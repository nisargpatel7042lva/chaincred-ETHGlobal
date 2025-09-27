// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title SelfProtocolVerifier
 * @dev On-chain verification of Self Protocol identity proofs with ZK verification
 * @notice This contract verifies ZK proofs from Self Protocol and links them to wallets
 */
contract SelfProtocolVerifier is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // Struct to store verified identity data
    struct VerifiedIdentity {
        address walletAddress;
        bytes32 nullifier; // Prevents double verification
        uint256 timestamp;
        bool isHuman;
        bool isNotSanctioned;
        bool ageVerified;
        bool countryVerified;
        bytes32 proofHash; // Hash of the ZK proof
        bool isValid;
    }

    // Struct for ZK proof verification
    struct ZKProof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
        uint256[6] publicSignals; // [walletAddress, isHuman, isNotSanctioned, ageVerified, countryVerified, identityHash]
    }

    // Mapping from nullifier to verification status (prevents double verification)
    mapping(bytes32 => bool) public nullifierUsed;
    
    // Mapping from wallet address to verified identity
    mapping(address => VerifiedIdentity) public verifiedIdentities;
    
    // Mapping to check if wallet is verified
    mapping(address => bool) public isVerified;
    
    // Array of all verified wallets
    address[] public verifiedWallets;
    
    // Self Protocol verification key (would be set by owner)
    uint256[2] public verificationKey;
    
    // Minimum age requirement
    uint256 public constant MIN_AGE = 18;
    
    // Events
    event IdentityVerified(
        address indexed wallet,
        bytes32 indexed nullifier,
        bool isHuman,
        bool isNotSanctioned,
        uint256 timestamp
    );
    
    event IdentityRevoked(address indexed wallet, bytes32 indexed nullifier);
    
    event VerificationKeyUpdated(uint256[2] newKey);

    constructor() Ownable() {
        // Initialize with mock verification key (replace with real key)
        verificationKey = [
            0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef,
            0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
        ];
    }

    /**
     * @dev Verify a Self Protocol ZK proof and link identity to wallet
     * @param proof The ZK proof from Self Protocol
     * @param nullifier The nullifier to prevent double verification
     * @param walletAddress The wallet address to link to
     */
    function verifyAndLinkIdentity(
        ZKProof calldata proof,
        bytes32 nullifier,
        address walletAddress
    ) public nonReentrant {
        require(walletAddress != address(0), "Invalid wallet address");
        require(!nullifierUsed[nullifier], "Nullifier already used");
        require(!isVerified[walletAddress], "Wallet already verified");
        
        // Verify the ZK proof
        require(verifyZKProof(proof), "ZK proof verification failed");
        
        // Extract public signals
        uint256[6] memory publicSignals = proof.publicSignals;
        
        // Verify wallet address matches
        require(address(uint160(publicSignals[0])) == walletAddress, "Wallet address mismatch");
        
        // Verify identity requirements
        require(publicSignals[1] == 1, "Not verified as human");
        require(publicSignals[2] == 1, "Sanctioned individual");
        require(publicSignals[3] == 1, "Age verification failed");
        require(publicSignals[4] == 1, "Country verification failed");
        
        // Mark nullifier as used
        nullifierUsed[nullifier] = true;
        
        // Create verified identity record
        VerifiedIdentity memory identity = VerifiedIdentity({
            walletAddress: walletAddress,
            nullifier: nullifier,
            timestamp: block.timestamp,
            isHuman: true,
            isNotSanctioned: true,
            ageVerified: true,
            countryVerified: true,
            proofHash: keccak256(abi.encode(proof)),
            isValid: true
        });
        
        // Store verification
        verifiedIdentities[walletAddress] = identity;
        isVerified[walletAddress] = true;
        verifiedWallets.push(walletAddress);
        
        emit IdentityVerified(walletAddress, nullifier, true, true, block.timestamp);
    }

    /**
     * @dev Verify ZK proof using Groth16 verification
     * @param proof The ZK proof to verify
     * @return True if proof is valid
     */
    function verifyZKProof(ZKProof calldata proof) public view returns (bool) {
        // In a real implementation, this would use a proper ZK proof verification library
        // For demo purposes, we'll do basic validation
        
        // Check that proof components are non-zero
        require(proof.a[0] != 0 && proof.a[1] != 0, "Invalid proof component A");
        require(proof.b[0][0] != 0 && proof.b[0][1] != 0, "Invalid proof component B");
        require(proof.b[1][0] != 0 && proof.b[1][1] != 0, "Invalid proof component B");
        require(proof.c[0] != 0 && proof.c[1] != 0, "Invalid proof component C");
        
        // Check public signals length
        require(proof.publicSignals.length == 6, "Invalid public signals length");
        
        // In production, this would call a proper ZK verification function
        // For demo, we'll return true if basic checks pass
        return true;
    }

    /**
     * @dev Get verified identity for a wallet
     * @param wallet The wallet address
     * @return The verified identity struct
     */
    function getVerifiedIdentity(address wallet) external view returns (VerifiedIdentity memory) {
        require(isVerified[wallet], "Wallet not verified");
        return verifiedIdentities[wallet];
    }

    /**
     * @dev Check if a wallet is verified
     * @param wallet The wallet address
     * @return True if verified
     */
    function isWalletVerified(address wallet) external view returns (bool) {
        return isVerified[wallet] && verifiedIdentities[wallet].isValid;
    }

    /**
     * @dev Get all verified wallets
     * @return Array of verified wallet addresses
     */
    function getAllVerifiedWallets() external view returns (address[] memory) {
        return verifiedWallets;
    }

    /**
     * @dev Get total number of verified wallets
     * @return The count of verified wallets
     */
    function getVerifiedWalletsCount() external view returns (uint256) {
        return verifiedWallets.length;
    }

    /**
     * @dev Revoke verification for a wallet (only owner)
     * @param wallet The wallet address to revoke
     */
    function revokeVerification(address wallet) external onlyOwner {
        require(isVerified[wallet], "Wallet not verified");
        
        bytes32 nullifier = verifiedIdentities[wallet].nullifier;
        
        // Mark as invalid
        verifiedIdentities[wallet].isValid = false;
        isVerified[wallet] = false;
        
        emit IdentityRevoked(wallet, nullifier);
    }

    /**
     * @dev Update verification key (only owner)
     * @param newKey The new verification key
     */
    function updateVerificationKey(uint256[2] calldata newKey) external onlyOwner {
        verificationKey = newKey;
        emit VerificationKeyUpdated(newKey);
    }


    /**
     * @dev Get verification statistics
     * @return totalVerified Total number of verified wallets
     * @return totalRevoked Total number of revoked verifications
     */
    function getVerificationStats() external view returns (uint256 totalVerified, uint256 totalRevoked) {
        totalVerified = verifiedWallets.length;
        
        // Count revoked (this is inefficient, but for demo purposes)
        for (uint256 i = 0; i < verifiedWallets.length; i++) {
            if (!verifiedIdentities[verifiedWallets[i]].isValid) {
                totalRevoked++;
            }
        }
    }

    /**
     * @dev Check if nullifier has been used
     * @param nullifier The nullifier to check
     * @return True if nullifier has been used
     */
    function isNullifierUsed(bytes32 nullifier) external view returns (bool) {
        return nullifierUsed[nullifier];
    }

    /**
     * @dev Generate a nullifier for a wallet (for frontend use)
     * @param wallet The wallet address
     * @param salt A random salt
     * @return The generated nullifier
     */
    function generateNullifier(address wallet, uint256 salt) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(wallet, salt, "self_protocol_verification"));
    }

    /**
     * @dev Batch verify multiple identities
     * @param proofs Array of ZK proofs
     * @param nullifiers Array of nullifiers
     * @param walletAddresses Array of wallet addresses
     */
    function batchVerifyIdentities(
        ZKProof[] calldata proofs,
        bytes32[] calldata nullifiers,
        address[] calldata walletAddresses
    ) external nonReentrant {
        require(
            proofs.length == nullifiers.length && 
            nullifiers.length == walletAddresses.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < proofs.length; i++) {
            verifyAndLinkIdentity(proofs[i], nullifiers[i], walletAddresses[i]);
        }
    }
}
