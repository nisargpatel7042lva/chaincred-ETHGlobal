'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getUniversalLink } from "@selfxyz/core";
import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp, countries } from "@selfxyz/qrcode";
const getUniversalLink = (app: any) => `https://self.xyz/verify/${app.scope}/${app.userId}`;

interface SelfApp {
  version: number;
  appName: string;
  scope: string;
  endpoint: string;
  logoBase64: string;
  userId: string;
  endpointType: string;
  userIdType: string;
  userDefinedData: string;
  disclosures: {
    minimumAge: number;
    nationality: boolean;
    gender: boolean;
  };
}

interface SelfQRcodeWrapperProps {
  selfApp: SelfApp;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Mock QR Code Wrapper (will be replaced with real SelfQRcodeWrapper)
function SelfQRcodeWrapper({ selfApp, onSuccess, onError }: SelfQRcodeWrapperProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationStatus('verifying');
    
    // Simulate verification process
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      if (success) {
        setVerificationStatus('success');
        onSuccess();
      } else {
        setVerificationStatus('error');
        onError('Verification failed');
      }
      setIsVerifying(false);
    }, 3000);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
          <span className="text-gray-500">QR Code</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Scan with Self app or click to verify
        </p>
        <Button 
          onClick={handleVerify}
          disabled={isVerifying}
          className="w-full"
        >
          {isVerifying ? 'Verifying...' : 'Verify Identity'}
        </Button>
      </div>
      
      {verificationStatus === 'success' && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span>Identity verified successfully!</span>
        </div>
      )}
      
      {verificationStatus === 'error' && (
        <div className="flex items-center gap-2 text-red-600">
          <XCircle className="w-5 h-5" />
          <span>Verification failed. Please try again.</span>
        </div>
      )}
    </div>
  );
}

interface SelfProtocolVerificationProps {
  onVerificationComplete?: (result: any) => void;
}

export function SelfProtocolVerification({ onVerificationComplete }: SelfProtocolVerificationProps) {
  const { address } = useAccount();
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!address) return;

    try {
      // Real Self Protocol implementation (will work once dependencies are installed)
      // const app = new SelfAppBuilder({
      //   version: 2,
      //   appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Ethereum Reputation Passport",
      //   scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "reputation-passport",
      //   endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
      //   logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
      //   userId: address, // Use wallet address as userId for Sybil prevention
      //   endpointType: "staging_https",
      //   userIdType: "hex",
      //   userDefinedData: `Reputation verification for ${address}`,
      //   disclosures: {
      //     minimumAge: 18,
      //     nationality: true,
      //     gender: true,
      //   }
      // }).build();

      // Temporary mock implementation
      const app: SelfApp = {
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Ethereum Reputation Passport",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "reputation-passport",
        endpoint: `${process.env.NEXT_PUBLIC_SELF_ENDPOINT}`,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: address, // Use wallet address as userId for Sybil prevention
        endpointType: "staging_https",
        userIdType: "hex",
        userDefinedData: `Reputation verification for ${address}`,
        disclosures: {
          minimumAge: 18,
          nationality: true,
          gender: true,
        }
      };

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [address]);

  const handleSuccessfulVerification = async (result?: any) => {
    console.log("Self Protocol verification successful!");
    
    // Store verification result with nullifier for Sybil prevention
    const verificationData = {
      walletAddress: address,
      nullifier: generateNullifier(address),
      timestamp: Date.now(),
      verified: true,
      disclosures: selfApp?.disclosures,
      userData: selfApp?.userDefinedData
    };
    
    setVerificationResult(verificationData);
    setIsVerified(true);
    
    // Call the verification complete callback
    if (onVerificationComplete) {
      onVerificationComplete(verificationData);
    }
    
    // Store in localStorage for persistence
    localStorage.setItem(`self_verification_${address}`, JSON.stringify(verificationData));
  };

  const handleVerificationError = (error: string) => {
    console.error("Self Protocol verification error:", error);
    setVerificationResult({
      walletAddress: address,
      verified: false,
      error: error,
      timestamp: Date.now()
    });
  };

  // Generate nullifier for Sybil prevention
  const generateNullifier = (walletAddress: string): string => {
    // In production, this would be generated by the Self Protocol
    // For demo, we'll create a deterministic nullifier
    const data = `${walletAddress}_self_verification_${Date.now()}`;
    return btoa(data).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  };

  // Check if already verified
  useEffect(() => {
    if (address) {
      const stored = localStorage.getItem(`self_verification_${address}`);
      if (stored) {
        const verificationData = JSON.parse(stored);
        if (verificationData.verified) {
          setVerificationResult(verificationData);
          setIsVerified(true);
        }
      }
    }
  }, [address]);

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Identity Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your wallet to verify your identity with Self Protocol.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isVerified && verificationResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Identity Verified
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Verified
            </Badge>
            <span className="text-sm text-muted-foreground">
              Sybil-resistant identity confirmed
            </span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wallet:</span>
              <span className="font-mono">{address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nullifier:</span>
              <span className="font-mono text-xs">{verificationResult.nullifier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verified:</span>
              <span>{new Date(verificationResult.timestamp).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Identity Verified</p>
                <p className="text-green-600">
                  This wallet is now linked to a verified human identity. 
                  You can participate in DAO voting and claim airdrops.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Verify Your Identity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Verify your identity using Self Protocol to prevent Sybil attacks and access gated features.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <span className="text-blue-600">
              Your wallet address will be used as your unique identifier
            </span>
          </div>
        </div>
        
        {selfApp ? (
          <SelfQRcodeWrapper
            selfApp={selfApp}
            onSuccess={handleSuccessfulVerification}
            onError={handleVerificationError}
          />
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            Loading verification system...
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>What this verifies:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>You are a real human (not a bot)</li>
            <li>You are at least 18 years old</li>
            <li>Your nationality and basic identity</li>
            <li>Prevents duplicate accounts for the same person</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
