// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ReputationOracle
 * @dev Oracle contract that validates and stores reputation scores
 * @notice This contract acts as the source of truth for reputation data
 */
contract ReputationOracle is Ownable, ReentrancyGuard {
    
    // Struct to store reputation data
    struct ReputationData {
        uint256 score;
        uint256 walletAge;
        uint256 daoVotes;
        uint256 defiTxs;
        uint256 totalTxs;
        uint256 uniqueContracts;
        uint256 lastActivity;
        uint256 timestamp;
        bool isValid;
    }
    
    // Mapping from address to reputation data
    mapping(address => ReputationData) public reputationScores;
    
    // Mapping to track if an address has been scored
    mapping(address => bool) public hasScore;
    
    // Minimum score required for SBT minting
    uint256 public constant MIN_SCORE = 70;
    
    // Maximum score allowed
    uint256 public constant MAX_SCORE = 100;
    
    // Events
    event ReputationScoreUpdated(
        address indexed wallet,
        uint256 score,
        uint256 walletAge,
        uint256 daoVotes,
        uint256 defiTxs,
        uint256 timestamp
    );
    
    event ReputationScoreInvalidated(address indexed wallet);
    
    constructor() Ownable() {}
    
    /**
     * @dev Update reputation score for a wallet (only owner)
     * @param wallet The wallet address
     * @param score The reputation score (0-100)
     * @param walletAge Age of wallet in days
     * @param daoVotes Number of DAO votes
     * @param defiTxs Number of DeFi transactions
     * @param totalTxs Total number of transactions
     * @param uniqueContracts Number of unique contracts interacted with
     * @param lastActivity Timestamp of last activity
     */
    function updateReputationScore(
        address wallet,
        uint256 score,
        uint256 walletAge,
        uint256 daoVotes,
        uint256 defiTxs,
        uint256 totalTxs,
        uint256 uniqueContracts,
        uint256 lastActivity
    ) external onlyOwner {
        require(wallet != address(0), "Invalid wallet address");
        require(score <= MAX_SCORE, "Score exceeds maximum");
        
        reputationScores[wallet] = ReputationData({
            score: score,
            walletAge: walletAge,
            daoVotes: daoVotes,
            defiTxs: defiTxs,
            totalTxs: totalTxs,
            uniqueContracts: uniqueContracts,
            lastActivity: lastActivity,
            timestamp: block.timestamp,
            isValid: true
        });
        
        hasScore[wallet] = true;
        
        emit ReputationScoreUpdated(wallet, score, walletAge, daoVotes, defiTxs, block.timestamp);
    }
    
    /**
     * @dev Batch update reputation scores
     * @param wallets Array of wallet addresses
     * @param scores Array of reputation scores
     * @param walletAges Array of wallet ages
     * @param daoVotesArray Array of DAO votes
     * @param defiTxsArray Array of DeFi transactions
     * @param totalTxsArray Array of total transactions
     * @param uniqueContractsArray Array of unique contracts
     * @param lastActivities Array of last activity timestamps
     */
    function batchUpdateReputationScores(
        address[] calldata wallets,
        uint256[] calldata scores,
        uint256[] calldata walletAges,
        uint256[] calldata daoVotesArray,
        uint256[] calldata defiTxsArray,
        uint256[] calldata totalTxsArray,
        uint256[] calldata uniqueContractsArray,
        uint256[] calldata lastActivities
    ) external onlyOwner {
        require(wallets.length == scores.length, "Array length mismatch");
        require(wallets.length == walletAges.length, "Array length mismatch");
        require(wallets.length == daoVotesArray.length, "Array length mismatch");
        require(wallets.length == defiTxsArray.length, "Array length mismatch");
        require(wallets.length == totalTxsArray.length, "Array length mismatch");
        require(wallets.length == uniqueContractsArray.length, "Array length mismatch");
        require(wallets.length == lastActivities.length, "Array length mismatch");
        
        for (uint256 i = 0; i < wallets.length; i++) {
            require(wallets[i] != address(0), "Invalid wallet address");
            require(scores[i] <= MAX_SCORE, "Score exceeds maximum");
            
            reputationScores[wallets[i]] = ReputationData({
                score: scores[i],
                walletAge: walletAges[i],
                daoVotes: daoVotesArray[i],
                defiTxs: defiTxsArray[i],
                totalTxs: totalTxsArray[i],
                uniqueContracts: uniqueContractsArray[i],
                lastActivity: lastActivities[i],
                timestamp: block.timestamp,
                isValid: true
            });
            
            hasScore[wallets[i]] = true;
            
            emit ReputationScoreUpdated(wallets[i], scores[i], walletAges[i], daoVotesArray[i], defiTxsArray[i], block.timestamp);
        }
    }
    
    /**
     * @dev Invalidate a reputation score
     * @param wallet The wallet address
     */
    function invalidateReputationScore(address wallet) external onlyOwner {
        require(hasScore[wallet], "No score exists for this wallet");
        
        reputationScores[wallet].isValid = false;
        
        emit ReputationScoreInvalidated(wallet);
    }
    
    /**
     * @dev Get reputation data for a wallet
     * @param wallet The wallet address
     * @return The reputation data struct
     */
    function getReputationData(address wallet) external view returns (ReputationData memory) {
        require(hasScore[wallet], "No score exists for this wallet");
        require(reputationScores[wallet].isValid, "Score is invalid");
        
        return reputationScores[wallet];
    }
    
    /**
     * @dev Check if a wallet is eligible for SBT minting
     * @param wallet The wallet address
     * @return True if eligible
     */
    function isEligibleForSBT(address wallet) external view returns (bool) {
        if (!hasScore[wallet] || !reputationScores[wallet].isValid) {
            return false;
        }
        
        return reputationScores[wallet].score >= MIN_SCORE;
    }
    
    /**
     * @dev Get the score for a wallet
     * @param wallet The wallet address
     * @return The reputation score
     */
    function getScore(address wallet) external view returns (uint256) {
        require(hasScore[wallet], "No score exists for this wallet");
        require(reputationScores[wallet].isValid, "Score is invalid");
        
        return reputationScores[wallet].score;
    }
    
    /**
     * @dev Check if a wallet has a valid score
     * @param wallet The wallet address
     * @return True if has valid score
     */
    function hasValidScore(address wallet) external view returns (bool) {
        return hasScore[wallet] && reputationScores[wallet].isValid;
    }
}
