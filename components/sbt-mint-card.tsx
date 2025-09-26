/* New: SBT mint UI (stubbed on-chain call unless contract set) */
"use client"

import { useAccount, useWriteContract } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

const SBT_CONTRACT = process.env.NEXT_PUBLIC_SBT_CONTRACT_ADDRESS as `0x${string}` | undefined

// Minimal placeholder ABI: replace with your real SBT contract ABI
const SBT_ABI = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "score", type: "uint256" },
    ],
    outputs: [],
  },
] as const

export function SbtMintCard({ eligible, score }: { eligible: boolean; score: number }) {
  const { address } = useAccount()
  const { writeContractAsync, isPending } = useWriteContract()
  const [txHash, setTxHash] = useState<string | null>(null)

  const canMint = eligible && !!address

  async function onMint() {
    if (!canMint) return
    if (!SBT_CONTRACT) {
      toast({
        title: "Contract not configured",
        description: "Set NEXT_PUBLIC_SBT_CONTRACT_ADDRESS to enable on-chain minting. Simulating success for demo.",
      })
      setTxHash("0x-simulated")
      return
    }
    try {
      const hash = await writeContractAsync({
        address: SBT_CONTRACT,
        abi: SBT_ABI,
        functionName: "mint",
        args: [address!, BigInt(score)],
      })
      setTxHash(hash)
      toast({ title: "Transaction submitted", description: hash })
    } catch (e: any) {
      toast({ title: "Mint failed", description: e?.message ?? "Error" })
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-balance">Mint Reputation Passport SBT</CardTitle>
        <CardDescription>Eligible if score ≥ 70</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {eligible ? "You are eligible to mint." : "Not eligible yet. Increase your on-chain activity."}
        </p>
        {txHash && <p className="mt-2 text-xs break-all">Tx: {txHash}</p>}
      </CardContent>
      <CardFooter>
        <Button onClick={onMint} disabled={!canMint || isPending}>
          {isPending ? "Minting..." : "Mint SBT"}
        </Button>
      </CardFooter>
    </Card>
  )
}
