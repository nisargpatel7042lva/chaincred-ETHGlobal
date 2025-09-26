// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ReputationOracle.sol";

/**
 * @title ReputationPassport
 * @dev Soulbound Token (SBT) for Ethereum Reputation Passport
 * @notice This is a non-transferable NFT that represents a wallet's reputation score
 */
contract ReputationPassport is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Reference to the reputation oracle
    ReputationOracle public immutable reputationOracle;
    
    // Struct to store reputation data
    struct ReputationData {
        uint256 score;
        uint256 walletAge;
        uint256 daoVotes;
        uint256 defiTxs;
        uint256 totalTxs;
        uint256 uniqueContracts;
        uint256 lastActivity;
        uint256 mintedAt;
        string explanation;
    }
    
    // Mapping from token ID to reputation data
    mapping(uint256 => ReputationData) public reputationData;
    
    // Mapping from address to token ID (one SBT per address)
    mapping(address => uint256) public addressToTokenId;
    
    // Mapping to check if address has minted
    mapping(address => bool) public hasMinted;
    
    // Minimum score required to mint
    uint256 public constant MIN_SCORE = 70;
    
    // Events
    event ReputationPassportMinted(
        address indexed to,
        uint256 indexed tokenId,
        uint256 score,
        uint256 walletAge,
        uint256 daoVotes,
        uint256 defiTxs
    );
    
    event ReputationPassportBurned(
        address indexed from,
        uint256 indexed tokenId
    );
    
    constructor(address _reputationOracle) ERC721("Ethereum Reputation Passport", "REP") Ownable() {
        reputationOracle = ReputationOracle(_reputationOracle);
    }
    
    /**
     * @dev Mint a reputation passport SBT
     * @param to The address to mint to
     * @param explanation AI-generated explanation of the score
     */
    function mintReputationPassport(
        address to,
        string memory explanation
    ) external onlyOwner nonReentrant {
        require(!hasMinted[to], "Address already has a reputation passport");
        require(to != address(0), "Cannot mint to zero address");
        
        // Get reputation data from oracle
        ReputationOracle.ReputationData memory oracleData = reputationOracle.getReputationData(to);
        require(oracleData.score >= MIN_SCORE, "Score too low to mint passport");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        // Store reputation data
        reputationData[tokenId] = ReputationData({
            score: oracleData.score,
            walletAge: oracleData.walletAge,
            daoVotes: oracleData.daoVotes,
            defiTxs: oracleData.defiTxs,
            totalTxs: oracleData.totalTxs,
            uniqueContracts: oracleData.uniqueContracts,
            lastActivity: oracleData.lastActivity,
            mintedAt: block.timestamp,
            explanation: explanation
        });
        
        // Map address to token ID
        addressToTokenId[to] = tokenId;
        hasMinted[to] = true;
        
        // Mint the SBT
        _safeMint(to, tokenId);
        
        emit ReputationPassportMinted(to, tokenId, oracleData.score, oracleData.walletAge, oracleData.daoVotes, oracleData.defiTxs);
    }
    
    /**
     * @dev Burn a reputation passport SBT (only owner)
     * @param tokenId The token ID to burn
     */
    function burnReputationPassport(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        
        address owner = ownerOf(tokenId);
        
        // Clear mappings
        delete addressToTokenId[owner];
        hasMinted[owner] = false;
        delete reputationData[tokenId];
        
        // Burn the token
        _burn(tokenId);
        
        emit ReputationPassportBurned(owner, tokenId);
    }
    
    /**
     * @dev Get reputation data for a token ID
     * @param tokenId The token ID
     * @return The reputation data struct
     */
    function getReputationData(uint256 tokenId) external view returns (ReputationData memory) {
        require(_exists(tokenId), "Token does not exist");
        return reputationData[tokenId];
    }
    
    /**
     * @dev Get reputation data for an address
     * @param addr The address
     * @return The reputation data struct
     */
    function getReputationDataByAddress(address addr) external view returns (ReputationData memory) {
        require(hasMinted[addr], "Address has not minted a passport");
        uint256 tokenId = addressToTokenId[addr];
        return reputationData[tokenId];
    }
    
    /**
     * @dev Check if an address has a reputation passport
     * @param addr The address to check
     * @return True if the address has minted a passport
     */
    function hasReputationPassport(address addr) external view returns (bool) {
        return hasMinted[addr];
    }
    
    /**
     * @dev Get the score for an address
     * @param addr The address
     * @return The reputation score
     */
    function getScore(address addr) external view returns (uint256) {
        require(hasMinted[addr], "Address has not minted a passport");
        uint256 tokenId = addressToTokenId[addr];
        return reputationData[tokenId].score;
    }
    
    /**
     * @dev Check if an address is eligible for SBT minting
     * @param addr The address to check
     * @return True if eligible
     */
    function isEligibleForSBT(address addr) external view returns (bool) {
        return reputationOracle.isEligibleForSBT(addr);
    }
    
    /**
     * @dev Override transfer functions to make this a Soulbound Token
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        // Only allow minting and burning, no transfers
        require(
            from == address(0) || to == address(0) || from == owner(),
            "Reputation Passport is non-transferable"
        );
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    /**
     * @dev Override approve functions to prevent transfers
     */
    function approve(address, uint256) public pure override {
        revert("Reputation Passport is non-transferable");
    }
    
    function setApprovalForAll(address, bool) public pure override {
        revert("Reputation Passport is non-transferable");
    }
    
    /**
     * @dev Get the total number of minted passports
     * @return The total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev Get token URI for metadata
     * @param tokenId The token ID
     * @return The token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        
        ReputationData memory data = reputationData[tokenId];
        
        // Create JSON metadata
        string memory json = string(abi.encodePacked(
            '{"name": "Ethereum Reputation Passport #', _toString(tokenId), '",',
            '"description": "A Soulbound Token representing on-chain reputation",',
            '"image": "https://reputation-passport.vercel.app/api/metadata/', _toString(tokenId), '",',
            '"attributes": [',
            '{"trait_type": "Score", "value": ', _toString(data.score), '},',
            '{"trait_type": "Wallet Age", "value": ', _toString(data.walletAge), '},',
            '{"trait_type": "DAO Votes", "value": ', _toString(data.daoVotes), '},',
            '{"trait_type": "DeFi Transactions", "value": ', _toString(data.defiTxs), '},',
            '{"trait_type": "Total Transactions", "value": ', _toString(data.totalTxs), '},',
            '{"trait_type": "Unique Contracts", "value": ', _toString(data.uniqueContracts), '},',
            '{"trait_type": "Minted At", "value": ', _toString(data.mintedAt), '}',
            ']}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @dev Convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    /**
     * @dev Base64 encode
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        
        string memory result = new string(4 * ((data.length + 2) / 3));
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let i := 0
            } lt(i, mload(data)) {
                i := add(i, 3)
            } {
                let input := and(mload(add(data, add(32, i))), 0xffffff)
                
                let out := mload(add(tablePtr, and(shr(250, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(244, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(238, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(232, input), 0x3F))), 0xFF))
                out := shl(224, out)
                
                mstore(resultPtr, out)
                
                resultPtr := add(resultPtr, 4)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }
        
        return result;
    }
}