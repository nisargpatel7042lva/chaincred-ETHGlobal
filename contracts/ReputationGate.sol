// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ReputationPassport.sol";

// Self Protocol integration interface
interface ISelfProtocol {
    function verifyIdentity(address user) external view returns (bool);
    function isVerifiedHuman(address user) external view returns (bool);
    function getIdentityHash(address user) external view returns (bytes32);
}

/**
 * @title ReputationGate
 * @dev Contract for gating access based on reputation scores
 * @notice This contract can be used by DAOs, DeFi protocols, and other dApps for access control
 */
contract ReputationGate is Ownable, ReentrancyGuard {
    
    // Reference to the reputation passport contract
    ReputationPassport public immutable reputationPassport;
    
    // Reference to Self Protocol for identity verification
    ISelfProtocol public selfProtocol;
    
    // Struct to store gate configuration
    struct GateConfig {
        uint256 minScore;
        bool isActive;
        bool requiresIdentityVerification; // NEW: Self Protocol integration
        string description;
        uint256 createdAt;
    }
    
    // Mapping from gate ID to configuration
    mapping(bytes32 => GateConfig) public gates;
    
    // Mapping to track gate usage
    mapping(bytes32 => mapping(address => bool)) public hasAccess;
    
    // Events
    event GateCreated(
        bytes32 indexed gateId,
        uint256 minScore,
        string description
    );
    
    event GateUpdated(
        bytes32 indexed gateId,
        uint256 minScore,
        bool isActive
    );
    
    event AccessGranted(
        bytes32 indexed gateId,
        address indexed user,
        uint256 score
    );
    
    event AccessRevoked(
        bytes32 indexed gateId,
        address indexed user
    );
    
    constructor(address _reputationPassport, address _selfProtocol) Ownable() {
        reputationPassport = ReputationPassport(_reputationPassport);
        selfProtocol = ISelfProtocol(_selfProtocol);
    }
    
    /**
     * @dev Create a new gate with optional identity verification
     * @param gateId Unique identifier for the gate
     * @param minScore Minimum reputation score required
     * @param requiresIdentityVerification Whether Self Protocol verification is required
     * @param description Description of the gate
     */
    function createGate(
        bytes32 gateId,
        uint256 minScore,
        bool requiresIdentityVerification,
        string memory description
    ) external onlyOwner {
        require(gates[gateId].createdAt == 0, "Gate already exists");
        require(minScore > 0 && minScore <= 100, "Invalid minimum score");
        
        gates[gateId] = GateConfig({
            minScore: minScore,
            isActive: true,
            requiresIdentityVerification: requiresIdentityVerification,
            description: description,
            createdAt: block.timestamp
        });
        
        emit GateCreated(gateId, minScore, description);
    }
    
    /**
     * @dev Update gate configuration
     * @param gateId The gate ID
     * @param minScore New minimum score
     * @param isActive Whether the gate is active
     */
    function updateGate(
        bytes32 gateId,
        uint256 minScore,
        bool isActive
    ) external onlyOwner {
        require(gates[gateId].createdAt > 0, "Gate does not exist");
        require(minScore > 0 && minScore <= 100, "Invalid minimum score");
        
        gates[gateId].minScore = minScore;
        gates[gateId].isActive = isActive;
        
        emit GateUpdated(gateId, minScore, isActive);
    }
    
    /**
     * @dev Check if a user has access to a gate
     * @param gateId The gate ID
     * @param user The user address
     * @return True if user has access
     */
    function hasAccessToGate(bytes32 gateId, address user) external view returns (bool) {
        GateConfig memory gate = gates[gateId];
        
        if (!gate.isActive) {
            return false;
        }
        
        // Check if user has a reputation passport
        if (!reputationPassport.hasReputationPassport(user)) {
            return false;
        }
        
        // Check if user's score meets the minimum requirement
        uint256 userScore = reputationPassport.getScore(user);
        if (userScore < gate.minScore) {
            return false;
        }
        
        // Check Self Protocol identity verification if required
        if (gate.requiresIdentityVerification) {
            if (!selfProtocol.verifyIdentity(user)) {
                return false;
            }
            
            // Additional check: ensure user is verified as human
            if (!selfProtocol.isVerifiedHuman(user)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @dev Grant access to a gate (only owner)
     * @param gateId The gate ID
     * @param user The user address
     */
    function grantAccess(bytes32 gateId, address user) external onlyOwner {
        require(gates[gateId].createdAt > 0, "Gate does not exist");
        require(gates[gateId].isActive, "Gate is not active");
        
        hasAccess[gateId][user] = true;
        
        uint256 userScore = reputationPassport.getScore(user);
        emit AccessGranted(gateId, user, userScore);
    }
    
    /**
     * @dev Revoke access from a gate (only owner)
     * @param gateId The gate ID
     * @param user The user address
     */
    function revokeAccess(bytes32 gateId, address user) external onlyOwner {
        require(gates[gateId].createdAt > 0, "Gate does not exist");
        
        hasAccess[gateId][user] = false;
        
        emit AccessRevoked(gateId, user);
    }
    
    /**
     * @dev Get gate configuration
     * @param gateId The gate ID
     * @return The gate configuration
     */
    function getGateConfig(bytes32 gateId) external view returns (GateConfig memory) {
        require(gates[gateId].createdAt > 0, "Gate does not exist");
        return gates[gateId];
    }
    
    /**
     * @dev Get user's reputation score
     * @param user The user address
     * @return The reputation score
     */
    function getUserScore(address user) external view returns (uint256) {
        if (!reputationPassport.hasReputationPassport(user)) {
            return 0;
        }
        
        return reputationPassport.getScore(user);
    }
    
    /**
     * @dev Check if user has a reputation passport
     * @param user The user address
     * @return True if user has a passport
     */
    function hasReputationPassport(address user) external view returns (bool) {
        return reputationPassport.hasReputationPassport(user);
    }
    
    /**
     * @dev Get comprehensive access information for a user
     * @param gateId The gate ID
     * @param user The user address
     * @return hasAccess Whether user has access
     * @return score User's reputation score
     * @return isIdentityVerified Whether user is identity verified
     * @return isHumanVerified Whether user is verified as human
     * @return requiresIdentityVerification Whether gate requires identity verification
     */
    function getAccessInfo(bytes32 gateId, address user) external view returns (
        bool hasAccess,
        uint256 score,
        bool isIdentityVerified,
        bool isHumanVerified,
        bool requiresIdentityVerification
    ) {
        GateConfig memory gate = gates[gateId];
        requiresIdentityVerification = gate.requiresIdentityVerification;
        
        if (!reputationPassport.hasReputationPassport(user)) {
            return (false, 0, false, false, requiresIdentityVerification);
        }
        
        score = reputationPassport.getScore(user);
        isIdentityVerified = selfProtocol.verifyIdentity(user);
        isHumanVerified = selfProtocol.isVerifiedHuman(user);
        
        hasAccess = hasAccessToGate(gateId, user);
    }
}
