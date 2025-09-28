// components/SbtMintCard.tsx

"use client"

import { useEffect, useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { BrowserProvider } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle } from "lucide-react"

// Load from .env.local
const SBT_CONTRACT = process.env.NEXT_PUBLIC_REPUTATION_PASSPORT_ADDRESS as `0x${string}` | undefined

const SBT_ABI = [
  {
    type: "function",
    name: "mintReputationPassport",
    stateMutability: "nonpayable",
    inputs: [{ name: "explanation", type: "string" }],
    outputs: [],
  },
] as const

export function SbtMintCard({ score }: { score: number }) {
  const { address, chain, isConnected } = useAccount()
  const [hash, setHash] = useState<`0x${string}` | undefined>()
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "confirmed" | "failed">("idle")
  const [checking, setChecking] = useState(false)
  const [isIdentityVerified, setIsIdentityVerified] = useState(false)
  const [isSbtMintedFlag, setIsSbtMintedFlag] = useState(false)

  // Check if user is identity verified
  useEffect(() => {
    const check = () => {
      if (!address) return setIsIdentityVerified(false)
      try {
        const stored = localStorage.getItem(`self_verification_${address}`)
        if (stored) {
          const verificationData = JSON.parse(stored)
          const verified = verificationData?.verified === true
          setIsIdentityVerified(verified)
          console.debug('SbtMintCard: found per-wallet verification:', verified)
          return
        }
        // fallback: check global marker
        const global = localStorage.getItem('self_verified_global')
        if (global && global.toLowerCase() === address.toLowerCase()) {
          setIsIdentityVerified(true)
          console.debug('SbtMintCard: verified via global marker')
          // check minted flag too
          const minted = localStorage.getItem(`sbt_minted_${address}`) === 'true'
          setIsSbtMintedFlag(minted)
          return
        }
      } catch (e) {
        console.warn('SbtMintCard: error reading verification from storage', e)
      }
      setIsIdentityVerified(false)
    }

    check()
  }, [address])

  // Listen for verification changes in other components in the same window
  useEffect(() => {
    const handler = () => {
      if (!address) return
      const stored = localStorage.getItem(`self_verification_${address}`)
      if (stored) {
        try {
          const verificationData = JSON.parse(stored)
          setIsIdentityVerified(verificationData.verified === true)
        } catch (e) {
          setIsIdentityVerified(false)
        }
      } else {
        setIsIdentityVerified(false)
      }
    }

    window.addEventListener('selfVerificationChanged', handler)
    // Also listen to storage events (other tabs) to update UI
    const storageHandler = (ev: StorageEvent) => {
      if (!ev.key) return
      if (ev.key === `self_verification_${address}` || ev.key === 'self_verified_global') {
        handler()
      }
    }
    window.addEventListener('storage', storageHandler)

    return () => {
      window.removeEventListener('selfVerificationChanged', handler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [address])

  // Optional: log when verification becomes available (helpful for debugging)
  useEffect(() => {
    if (isIdentityVerified) {
      console.info('SBT Mint: identity verified for', address)
      try {
        // friendly notice for users in dev
        // toast({ title: 'Identity Verified', description: 'You can now mint your SBT.' })
      } catch (e) {
        // ignore if toast not available
      }
    }
  }, [isIdentityVerified, address])

  // watch minted flag as well
  useEffect(() => {
    const handler = () => {
      if (!address) return
      const minted = localStorage.getItem(`sbt_minted_${address}`) === 'true'
      setIsSbtMintedFlag(minted)
    }
    window.addEventListener('selfVerificationChanged', handler)
    window.addEventListener('storage', handler)
    handler()
    return () => {
      window.removeEventListener('selfVerificationChanged', handler)
      window.removeEventListener('storage', handler)
    }
  }, [address])

  const eligible = score >= 70
  const canMint = eligible && isConnected && isIdentityVerified && !isSbtMintedFlag

  const disabledReasons: string[] = []
  if (!eligible) disabledReasons.push('Score below eligibility threshold (>= 70)')
  if (!isConnected) disabledReasons.push('Wallet not connected')
  if (!isIdentityVerified) disabledReasons.push('Identity not verified')
  if (isSbtMintedFlag) disabledReasons.push('SBT already minted for this wallet in this browser')
  if (!SBT_CONTRACT) disabledReasons.push('Contract address not configured')

  const { writeContract, isPending: isSubmitting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({ hash })

  const onMint = () => {
    // Defensive logging & user feedback
    console.debug('SbtMintCard.onMint called', { canMint, isSubmitting, isConfirming, txStatus, isSbtMintedFlag, SBT_CONTRACT })
    if (!canMint) {
      const reasons: string[] = []
      if (!eligible) reasons.push('score too low')
      if (!isConnected) reasons.push('wallet not connected')
      if (!isIdentityVerified) reasons.push('identity not verified')
      if (isSbtMintedFlag) reasons.push('SBT already minted for this wallet in this browser')
      const msg = `Cannot mint: ${reasons.join(', ') || 'unknown reason'}`
      console.warn(msg)
      toast({ title: 'Cannot Mint', description: msg, variant: 'destructive' })
      return
    }

    if (!SBT_CONTRACT) {
      console.warn('SbtMintCard: missing contract address (NEXT_PUBLIC_REPUTATION_PASSPORT_ADDRESS)')
      toast({ title: 'Contract Not Configured', description: 'The contract address is missing in .env.local.', variant: 'destructive' })
      return
    }

    try {
      writeContract(
        {
          address: SBT_CONTRACT,
          abi: SBT_ABI,
          functionName: 'mintReputationPassport',
          args: ['Minting my on-chain reputation passport from the dApp.'],
        },
        {
          onSuccess: (txHash) => {
            console.info('SbtMintCard: writeContract onSuccess', txHash)
            setHash(txHash)
            setTxStatus('pending')
            toast({ title: 'Transaction Submitted', description: 'Waiting for confirmation...' })
          },
          onError: (error: any) => {
            setTxStatus('failed')
            console.error('SbtMintCard: writeContract onError', error)
            const msg = error?.message?.includes('User rejected the request')
              ? 'Transaction rejected by user.'
              : error?.shortMessage || 'An unknown error occurred.'
            toast({ title: 'Submission Failed', description: msg, variant: 'destructive' })
          },
        }
      )
    } catch (e) {
      console.error('SbtMintCard: writeContract threw', e)
      toast({ title: 'Mint Failed', description: String(e), variant: 'destructive' })
    }
  }

  // Effect to update status when confirmed or failed
  useEffect(() => {
    if (isConfirmed) {
      setTxStatus("confirmed")
      toast({ title: "Mint Successful!", description: "Your Reputation Passport SBT has been minted." })
      try {
        if (address) {
          localStorage.setItem(`sbt_minted_${address}`, 'true')
          setIsSbtMintedFlag(true)
          try { window.dispatchEvent(new Event('selfVerificationChanged')) } catch (e) { /* ignore */ }
        }
      } catch (e) {
        console.warn('Could not persist sbt minted flag', e)
      }
    }
    if (receiptError) {
      setTxStatus("failed")
      toast({ title: "Transaction Failed", description: receiptError?.message || "Unknown error.", variant: "destructive" })
    }
  }, [isConfirmed, receiptError])

  const explorerUrl = chain?.blockExplorers?.default.url

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Mint Reputation Passport SBT</CardTitle>
        <CardDescription>Your score: {score} — Eligible if ≥ 70</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {eligible
              ? "You are eligible to mint this non-transferable token."
              : "You are not eligible yet. Increase your on-chain activity."}
          </p>
          
          {eligible && !isIdentityVerified && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Identity Verification Required</p>
                  <p className="text-yellow-600">
                    You must verify your identity with Self Protocol before minting your SBT.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {eligible && isIdentityVerified && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Ready to Mint</p>
                  <p className="text-green-600">
                    Your identity is verified and you're eligible to mint your SBT.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {hash && (
          <div className="mt-4 text-xs">
            <p className="font-medium">Transaction Hash:</p>
            {explorerUrl ? (
              <a
                href={`${explorerUrl}/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline break-all"
              >
                {hash}
              </a>
            ) : (
              <p className="break-all">{hash}</p>
            )}
            <p className="mt-1">Status: {txStatus.charAt(0).toUpperCase() + txStatus.slice(1)}</p>
            <div className="mt-2 flex gap-2">
              <Button
                onClick={async () => {
                  try {
                    setChecking(true)
                    // run diagnostics
                    const anyWindow: any = window
                    const results: Record<string, any> = {}

                    if (anyWindow?.ethereum) {
                      try {
                        const provider = new BrowserProvider(anyWindow.ethereum)
                        const tx = await provider.getTransaction(hash)
                        const receipt = await provider.getTransactionReceipt(hash)
                        results.injected = { tx, receipt }
                        console.info('injected provider result', results.injected)
                        toast({ title: 'Checked injected provider', description: tx ? 'Injected provider knows about the tx' : 'Injected provider does NOT know about the tx' })
                      } catch (e) {
                        console.warn('Injected provider diagnostic failed', e)
                        results.injected = { error: String(e) }
                        toast({ title: 'Injected provider error', description: String(e), variant: 'destructive' })
                      }
                    }

                    const publicRpc = process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_URL || process.env.NEXT_PUBLIC_INFURA_MAINNET_URL
                    if (publicRpc) {
                      try {
                        const { JsonRpcProvider } = await import('ethers')
                        const rpcProvider = new (JsonRpcProvider as any)(publicRpc)
                        const tx = await rpcProvider.getTransaction(hash)
                        const receipt = await rpcProvider.getTransactionReceipt(hash)
                        results.public = { tx, receipt }
                        console.info('public rpc result', results.public)
                        toast({ title: 'Checked public RPC', description: tx ? 'Public RPC knows about the tx' : 'Public RPC does NOT know about the tx' })
                      } catch (e) {
                        console.warn('Public RPC diagnostic failed', e)
                        results.public = { error: String(e) }
                      }
                    }

                    if (process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY) {
                      try {
                        const key = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY
                        const urls = [
                          `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${key}`,
                          `https://api-sepolia.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${key}`,
                        ]
                        for (const url of urls) {
                          try {
                            const res = await fetch(url)
                            const json = await res.json()
                            results[url.includes('sepolia') ? 'etherscan_sepolia' : 'etherscan_main'] = json
                            console.info('etherscan probe', url, json)
                            if (json?.result) {
                              toast({ title: 'Etherscan', description: 'Etherscan reports the tx exists. Open the explorer.' })
                              break
                            }
                          } catch (e) {
                            console.warn('Etherscan probe failed for', url, e)
                          }
                        }
                      } catch (e) {
                        console.warn('Etherscan diagnostic failed', e)
                      }
                    }

                    console.log('tx diagnostics', results)
                  } finally {
                    setChecking(false)
                  }
                }}
                disabled={checking}
              >
                {checking ? 'Checking…' : 'Check transaction'}
              </Button>
            </div>
          </div>
        )}

        {/* Show explicit reasons why mint is disabled */}
        {!canMint && !isSbtMintedFlag && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">Cannot mint yet</p>
            <ul className="text-xs text-yellow-700 list-disc list-inside mt-2">
              {disabledReasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isSbtMintedFlag ? (
          <Button disabled variant="outline">Already Minted</Button>
        ) : (
          <Button onClick={onMint} disabled={!canMint || isSubmitting || isConfirming || txStatus === "pending"}>
            {isSubmitting ? "Confirm in wallet..." : isConfirming ? "Minting..." : "Mint SBT"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
