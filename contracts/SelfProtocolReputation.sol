// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {SelfUtils} from "@selfxyz/contracts/contracts/libraries/SelfUtils.sol";
import {IIdentityVerificationHubV2} from "@selfxyz/contracts/contracts/interfaces/IIdentityVerificationHubV2.sol";

/**
 * @title SelfProtocolReputation
 * @notice Reputation system with Self Protocol identity verification and nullifier-based Sybil prevention
 * @dev This contract prevents Sybil attacks by linking wallet addresses to verified human identities
 */
contract SelfProtocolReputation is SelfVerificationRoot {
    // Storage for verification configuration
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;
    
    // Sybil prevention: Track nullifiers to prevent duplicate verifications
    mapping(bytes32 => bool) public usedNullifiers;
    mapping(address => bytes32) public walletToNullifier;
    mapping(bytes32 => address) public nullifierToWallet;
    
    // Reputation data with identity verification
    struct VerifiedReputation {
        address wallet;
        bytes32 nullifier;
        uint256 reputationScore;
        bool isVerified;
        uint256 verifiedAt;
        string identityData; // Encrypted/encoded identity data
    }
    
    mapping(address => VerifiedReputation) public verifiedReputations;
    mapping(bytes32 => address) public nullifierToReputation;
    
    // Events
    event VerificationCompleted(
        ISelfVerificationRoot.GenericDiscloseOutputV2 output,
        bytes userData
    );
    
    event ReputationVerified(
        address indexed wallet,
        bytes32 indexed nullifier,
        uint256 reputationScore,
        uint256 timestamp
    );
    
    event SybilAttemptDetected(
        address indexed wallet,
        bytes32 indexed nullifier,
        string reason
    );
    
    event NullifierUsed(
        bytes32 indexed nullifier,
        address indexed wallet,
        uint256 timestamp
    );

    /**
     * @notice Constructor for the reputation contract
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     * @param scopeSeed The scope seed for this application
     * @param _verificationConfig The verification configuration
     */
    constructor(
        address identityVerificationHubV2Address,
        uint256 scopeSeed,
        SelfUtils.UnformattedVerificationConfigV2 memory _verificationConfig
    ) SelfVerificationRoot(identityVerificationHubV2Address, scopeSeed) {
        verificationConfig = 
            SelfUtils.formatVerificationConfigV2(_verificationConfig);
        verificationConfigId = 
            IIdentityVerificationHubV2(identityVerificationHubV2Address)
            .setVerificationConfigV2(verificationConfig);
    }
    
    /**
     * @notice Implementation of customVerificationHook for reputation system
     * @dev This function is called by onVerificationSuccess after hub address validation
     * @param output The verification output from the hub (contains nullifier)
     * @param userData The user data passed through verification (wallet address)
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        // Extract wallet address from userData
        address wallet = abi.decode(userData, (address));
        
        // Extract nullifier from output for Sybil prevention
        bytes32 nullifier = extractNullifier(output);
        
        // Check for Sybil attacks
        if (usedNullifiers[nullifier]) {
            emit SybilAttemptDetected(wallet, nullifier, "Nullifier already used");
            return;
        }
        
        if (walletToNullifier[wallet] != bytes32(0)) {
            emit SybilAttemptDetected(wallet, nullifier, "Wallet already verified");
            return;
        }
        
        // Mark nullifier as used
        usedNullifiers[nullifier] = true;
        walletToNullifier[wallet] = nullifier;
        nullifierToWallet[nullifier] = wallet;
        
        // Store verification result
        VerifiedReputation memory reputation = VerifiedReputation({
            wallet: wallet,
            nullifier: nullifier,
            reputationScore: 0, // Will be set by reputation oracle
            isVerified: true,
            verifiedAt: block.timestamp,
            identityData: encodeIdentityData(output)
        });
        
        verifiedReputations[wallet] = reputation;
        nullifierToReputation[nullifier] = wallet;
        
        emit VerificationCompleted(output, userData);
        emit ReputationVerified(wallet, nullifier, 0, block.timestamp);
        emit NullifierUsed(nullifier, wallet, block.timestamp);
    }

    /**
     * @notice Get verification configuration ID
     */
    function getConfigId(
        bytes32 /* destinationChainId */,
        bytes32 /* userIdentifier */,
        bytes memory /* userDefinedData */
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }
    
    /**
     * @notice Update reputation score for a verified wallet
     * @param wallet The wallet address
     * @param score The new reputation score
     */
    function updateReputationScore(address wallet, uint256 score) external {
        require(verifiedReputations[wallet].isVerified, "Wallet not verified");
        
        verifiedReputations[wallet].reputationScore = score;
        
        emit ReputationVerified(
            wallet, 
            verifiedReputations[wallet].nullifier, 
            score, 
            block.timestamp
        );
    }
    
    /**
     * @notice Check if a wallet is verified and has good reputation
     * @param wallet The wallet address
     * @param minScore Minimum required reputation score
     * @return True if wallet is verified and meets minimum score
     */
    function isEligibleForGatedAccess(address wallet, uint256 minScore) external view returns (bool) {
        VerifiedReputation memory reputation = verifiedReputations[wallet];
        return reputation.isVerified && reputation.reputationScore >= minScore;
    }
    
    /**
     * @notice Get verification status for a wallet
     * @param wallet The wallet address
     * @return isVerified True if wallet is verified
     * @return nullifier The nullifier associated with the wallet
     * @return reputationScore The current reputation score
     */
    function getVerificationStatus(address wallet) external view returns (
        bool isVerified,
        bytes32 nullifier,
        uint256 reputationScore
    ) {
        VerifiedReputation memory reputation = verifiedReputations[wallet];
        return (
            reputation.isVerified,
            reputation.nullifier,
            reputation.reputationScore
        );
    }
    
    /**
     * @notice Check if a nullifier has been used (Sybil prevention)
     * @param nullifier The nullifier to check
     * @return True if nullifier has been used
     */
    function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
        return usedNullifiers[nullifier];
    }
    
    /**
     * @notice Get wallet associated with a nullifier
     * @param nullifier The nullifier
     * @return The wallet address associated with the nullifier
     */
    function getWalletByNullifier(bytes32 nullifier) external view returns (address) {
        return nullifierToWallet[nullifier];
    }
    
    /**
     * @notice Extract nullifier from Self Protocol output
     * @param output The verification output from Self Protocol
     * @return The extracted nullifier
     */
    function extractNullifier(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output
    ) internal pure returns (bytes32) {
        // In the real implementation, the nullifier would be extracted from the output
        // For now, we'll create a deterministic nullifier based on the output data
        return keccak256(abi.encodePacked(
            output.userIdentifier,
            output.timestamp,
            output.proof
        ));
    }
    
    /**
     * @notice Encode identity data from verification output
     * @param output The verification output from Self Protocol
     * @return Encoded identity data
     */
    function encodeIdentityData(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output
    ) internal pure returns (string memory) {
        // Encode the identity data for storage
        // In production, this would be properly encrypted
        return string(abi.encodePacked(
            "verified_",
            uint256(output.userIdentifier).toString(),
            "_",
            output.timestamp.toString()
        ));
    }
    
    /**
     * @notice Batch check multiple wallets for verification status
     * @param wallets Array of wallet addresses
     * @return Array of verification statuses
     */
    function batchCheckVerification(address[] calldata wallets) external view returns (bool[] memory) {
        bool[] memory results = new bool[](wallets.length);
        for (uint256 i = 0; i < wallets.length; i++) {
            results[i] = verifiedReputations[wallets[i]].isVerified;
        }
        return results;
    }
    
    /**
     * @notice Get statistics about verified wallets
     * @return totalVerified Total number of verified wallets
     * @return totalNullifiers Total number of used nullifiers
     */
    function getVerificationStats() external view returns (uint256 totalVerified, uint256 totalNullifiers) {
        // This would require additional storage to track efficiently
        // For now, return placeholder values
        return (0, 0);
    }
}
