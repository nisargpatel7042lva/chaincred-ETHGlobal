// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ReputationOracle.sol";

/**
 * @title CrossChainReputation
 * @dev Contract for managing reputation across multiple chains
 * @notice This contract handles reputation data synchronization between chains
 */
contract CrossChainReputation is Ownable, ReentrancyGuard {
    
    // Reference to the reputation oracle
    ReputationOracle public immutable reputationOracle;
    
    // Struct to store cross-chain reputation data
    struct CrossChainData {
        uint256 score;
        uint256 walletAge;
        uint256 daoVotes;
        uint256 defiTxs;
        uint256 totalTxs;
        uint256 uniqueContracts;
        uint256 lastActivity;
        uint256 chainId;
        uint256 timestamp;
        bool isValid;
    }
    
    // Mapping from address to cross-chain data
    mapping(address => CrossChainData[]) public crossChainReputation;
    
    // Mapping to track supported chains
    mapping(uint256 => bool) public supportedChains;
    
    // Events
    event CrossChainReputationUpdated(
        address indexed wallet,
        uint256 chainId,
        uint256 score,
        uint256 timestamp
    );
    
    event ChainSupported(uint256 chainId, bool supported);
    
    constructor(address _reputationOracle) Ownable() {
        reputationOracle = ReputationOracle(_reputationOracle);
        
        // Support Ethereum mainnet and Sepolia by default
        supportedChains[1] = true; // Ethereum mainnet
        supportedChains[11155111] = true; // Sepolia
        supportedChains[1789] = true; // Kadena testnet
    }
    
    /**
     * @dev Add or remove support for a chain
     * @param chainId The chain ID
     * @param supported Whether the chain is supported
     */
    function setChainSupport(uint256 chainId, bool supported) external onlyOwner {
        supportedChains[chainId] = supported;
        emit ChainSupported(chainId, supported);
    }
    
    /**
     * @dev Update cross-chain reputation data
     * @param wallet The wallet address
     * @param chainId The chain ID
     * @param score The reputation score
     * @param walletAge Age of wallet in days
     * @param daoVotes Number of DAO votes
     * @param defiTxs Number of DeFi transactions
     * @param totalTxs Total number of transactions
     * @param uniqueContracts Number of unique contracts interacted with
     * @param lastActivity Timestamp of last activity
     */
    function updateCrossChainReputation(
        address wallet,
        uint256 chainId,
        uint256 score,
        uint256 walletAge,
        uint256 daoVotes,
        uint256 defiTxs,
        uint256 totalTxs,
        uint256 uniqueContracts,
        uint256 lastActivity
    ) external onlyOwner {
        require(supportedChains[chainId], "Chain not supported");
        require(wallet != address(0), "Invalid wallet address");
        require(score <= 100, "Score exceeds maximum");
        
        // Find existing entry for this chain
        CrossChainData[] storage chainData = crossChainReputation[wallet];
        bool found = false;
        
        for (uint256 i = 0; i < chainData.length; i++) {
            if (chainData[i].chainId == chainId) {
                chainData[i] = CrossChainData({
                    score: score,
                    walletAge: walletAge,
                    daoVotes: daoVotes,
                    defiTxs: defiTxs,
                    totalTxs: totalTxs,
                    uniqueContracts: uniqueContracts,
                    lastActivity: lastActivity,
                    chainId: chainId,
                    timestamp: block.timestamp,
                    isValid: true
                });
                found = true;
                break;
            }
        }
        
        // If not found, add new entry
        if (!found) {
            chainData.push(CrossChainData({
                score: score,
                walletAge: walletAge,
                daoVotes: daoVotes,
                defiTxs: defiTxs,
                totalTxs: totalTxs,
                uniqueContracts: uniqueContracts,
                lastActivity: lastActivity,
                chainId: chainId,
                timestamp: block.timestamp,
                isValid: true
            }));
        }
        
        emit CrossChainReputationUpdated(wallet, chainId, score, block.timestamp);
    }
    
    /**
     * @dev Get cross-chain reputation data for a wallet
     * @param wallet The wallet address
     * @return Array of cross-chain data
     */
    function getCrossChainReputation(address wallet) external view returns (CrossChainData[] memory) {
        return crossChainReputation[wallet];
    }
    
    /**
     * @dev Get reputation data for a specific chain
     * @param wallet The wallet address
     * @param chainId The chain ID
     * @return The cross-chain data for the specified chain
     */
    function getChainReputation(address wallet, uint256 chainId) external view returns (CrossChainData memory) {
        CrossChainData[] memory chainData = crossChainReputation[wallet];
        
        for (uint256 i = 0; i < chainData.length; i++) {
            if (chainData[i].chainId == chainId && chainData[i].isValid) {
                return chainData[i];
            }
        }
        
        revert("No reputation data found for this chain");
    }
    
    /**
     * @dev Calculate aggregated reputation score across all chains
     * @param wallet The wallet address
     * @return The aggregated score
     */
    function getAggregatedScore(address wallet) external view returns (uint256) {
        CrossChainData[] memory chainData = crossChainReputation[wallet];
        
        if (chainData.length == 0) {
            return 0;
        }
        
        uint256 totalScore = 0;
        uint256 validChains = 0;
        
        for (uint256 i = 0; i < chainData.length; i++) {
            if (chainData[i].isValid) {
                totalScore += chainData[i].score;
                validChains++;
            }
        }
        
        if (validChains == 0) {
            return 0;
        }
        
        return totalScore / validChains;
    }
    
    /**
     * @dev Check if a wallet has reputation data on a specific chain
     * @param wallet The wallet address
     * @param chainId The chain ID
     * @return True if reputation data exists
     */
    function hasChainReputation(address wallet, uint256 chainId) external view returns (bool) {
        CrossChainData[] memory chainData = crossChainReputation[wallet];
        
        for (uint256 i = 0; i < chainData.length; i++) {
            if (chainData[i].chainId == chainId && chainData[i].isValid) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * @dev Invalidate reputation data for a specific chain
     * @param wallet The wallet address
     * @param chainId The chain ID
     */
    function invalidateChainReputation(address wallet, uint256 chainId) external onlyOwner {
        CrossChainData[] storage chainData = crossChainReputation[wallet];
        
        for (uint256 i = 0; i < chainData.length; i++) {
            if (chainData[i].chainId == chainId) {
                chainData[i].isValid = false;
                break;
            }
        }
    }
}
