// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Heritage Tree Token (TREE) - WorldTree Production Contract
 * @dev Gas-optimized ERC-20 token for WorldTree Genealogy Economy
 * @author WorldTree Team
 * 
 * Token Economics:
 * - Fixed supply of 1 billion TREE tokens
 * - Heritage Points to TREE conversion (100 HP = 1 TREE)
 * - Daily minting limits to prevent abuse
 * - Smart contract rewards for genealogy milestones
 * 
 * WorldTree App: Rich gamification (handled off-chain)
 * - Family tree building: Earn Heritage Points
 * - DNA matching: Bonus TREE tokens
 * - Historical research: Unlock special rewards
 * - Community contributions: Share genealogy knowledge
 */
contract HeritageTreeToken is ERC20, AccessControl, ReentrancyGuard {
    
    // === Core Token Configuration ===
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    // Economic constants (immutable after deployment for transparency)
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion TREE
    uint256 public constant INITIAL_SUPPLY = 100000000 * 10**18; // 100M TREE initial
    
    uint256 public constant MAX_CLAIM_PER_DAY = 1000 * 10**18; // 1000 TREE max per day
    uint256 public constant CONVERSION_RATE_BASE = 100; // Base rate: 100 HP = 1 TREE
    uint256 public constant MAX_REWARD_SIZE = 100 * 10**18; // Max 100 TREE per reward
    uint256 public constant MAX_ADMIN_MINT = 1000 * 10**18; // Max 1000 TREE admin mint
    
    // Dynamic economic parameters (adjustable for platform growth)
    uint256 public heritagePointsPerToken = 100; // 100 heritage points = 1 TREE
    uint256 public dailyMintLimit = MAX_CLAIM_PER_DAY;
    uint256 public maxRewardSize = MAX_REWARD_SIZE;
    
    // Usage tracking
    mapping(address => uint256) public lastClaimDay;
    mapping(address => uint256) public dailyClaimedAmount;
    mapping(address => uint256) public totalLifetimeClaimed;
    mapping(address => bool) public authorizedMinters;
    
    // WorldTree backend authorization for gamification rewards
    mapping(address => bool) public backendMinters;
    
    // Events for transparency and analytics
    event RewardMinted(address indexed user, uint256 amount, string rewardType);
    event BackendMinterAuthorized(address indexed minter, bool authorized);
    event EconomicParameterUpdated(string parameter, uint256 oldValue, uint256 newValue);
    event DailyLimitReset(address indexed user, uint256 day);
    
    constructor() ERC20("Heritage Tree Token", "TREE") {
        // Setup access control
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        
        // Initial token distribution to contract deployer
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Primary function: Convert Heritage Points to TREE tokens
     * Called by WorldTree backend when users earn points through:
     * - Building family trees
     * - Uploading DNA data
     * - Connecting with relatives
     * - Contributing historical records
     * @param userAddress User's wallet address
     * @param heritagePointsAmount Amount of Heritage Points to convert to TREE
     */
    function claimHeritageReward(
        address userAddress, 
        uint256 heritagePointsAmount
    ) external onlyRole(MINTER_ROLE) nonReentrant {
        require(userAddress != address(0), "Invalid user address");
        require(heritagePointsAmount > 0, "Heritage points must be positive");
        
        // Calculate base TREE tokens (no gamification bonuses)
        uint256 baseTokenAmount = (heritagePointsAmount * 10**decimals()) / heritagePointsPerToken;
        
        // Enforce individual daily limits
        uint256 currentDay = block.timestamp / 86400;
        if (lastClaimDay[userAddress] != currentDay) {
            dailyClaimedAmount[userAddress] = 0;
            lastClaimDay[userAddress] = currentDay;
            emit DailyLimitReset(userAddress, currentDay);
        }
        
        require(
            dailyClaimedAmount[userAddress] + baseTokenAmount <= dailyMintLimit,
            "Daily claim limit exceeded"
        );
        
        // Update tracking
        dailyClaimedAmount[userAddress] += baseTokenAmount;
        totalLifetimeClaimed[userAddress] += baseTokenAmount;
        
        // Mint tokens
        _mint(userAddress, baseTokenAmount);
        
        emit RewardMinted(userAddress, baseTokenAmount, "heritage_conversion");
    }
    
    /**
     * @dev Backend reward minting for WorldTree gamification system
     * Handles special milestone rewards beyond basic Heritage Point conversion:
     * Called by authorized WorldTree backend when users achieve milestones:
     * - Complete family tree branches: 10-50 TREE bonuses
     * - Find DNA matches: 5-25 TREE rewards
     * - Research achievements: 1-10 TREE daily rewards
     * - Community contributions: 20-100 TREE special rewards
     * - Beta participation: 25-75 TREE early access rewards
     * 
     * @param userAddress User's wallet address  
     * @param amount Amount of TREE to mint (in wei, max 100 TREE)
     * @param rewardType Type of reward for analytics
     */
    function mintGenealogyReward(
        address userAddress,
        uint256 amount,
        string calldata rewardType
    ) external nonReentrant {
        require(backendMinters[msg.sender], "Not authorized backend minter");
        require(userAddress != address(0), "Invalid user address");
        require(amount > 0 && amount <= maxRewardSize, "Invalid reward amount");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        
        // Mint reward tokens
        _mint(userAddress, amount);
        
        emit RewardMinted(userAddress, amount, rewardType);
    }
    
    /**
     * @dev Batch reward processing for efficiency
     * Called by WorldTree backend every hour to process queued rewards.
     * Gas-optimized for handling multiple users in single transaction.
     */
    function batchMintGenealogyRewards(
        address[] calldata users,
        uint256[] calldata amounts,
        string[] calldata rewardTypes
    ) external nonReentrant {
        require(backendMinters[msg.sender], "Not authorized backend minter");
        require(users.length == amounts.length && amounts.length == rewardTypes.length, "Array length mismatch");
        require(users.length <= 50, "Too many rewards in batch"); // Gas limit protection
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < users.length; i++) {
            require(users[i] != address(0), "Invalid user address");
            require(amounts[i] > 0 && amounts[i] <= maxRewardSize, "Invalid reward amount");
            totalAmount += amounts[i];
        }
        
        require(totalSupply() + totalAmount <= MAX_SUPPLY, "Would exceed max supply");
        
        // Mint all rewards
        for (uint256 i = 0; i < users.length; i++) {
            _mint(users[i], amounts[i]);
            emit RewardMinted(users[i], amounts[i], rewardTypes[i]);
        }
    }
    
    /**
     * @dev Get comprehensive user claiming information
     * Used by WorldTree app to show user's claiming status and history.
     * Returns all data needed for frontend display and limit checking.
     */
    function getUserClaimInfo(address userAddress) external view returns (
        uint256 balance,           // Current TREE balance
        uint256 dailyClaimed,      // TREE claimed today  
        uint256 dailyRemaining,    // TREE remaining today
        uint256 totalUserClaimed,  // Total TREE claimed by user
        uint256 lastClaimDayStored, // Last day user claimed
        uint256 currentDay         // Current day number
    ) {
        balance = balanceOf(userAddress);
        currentDay = block.timestamp / 86400;
        lastClaimDayStored = lastClaimDay[userAddress];
        totalUserClaimed = totalLifetimeClaimed[userAddress];
        
        if (lastClaimDayStored == currentDay) {
            dailyClaimed = dailyClaimedAmount[userAddress];
            dailyRemaining = dailyMintLimit > dailyClaimed ? dailyMintLimit - dailyClaimed : 0;
        } else {
            dailyClaimed = 0;
            dailyRemaining = dailyMintLimit;
        }
    }
    
    /**
     * @dev Calculate TREE tokens from Heritage Points
     * Public helper function for frontend integration
     */
    function calculateTREEFromHeritagePoints(uint256 heritagePoints) external view returns (uint256) {
        return (heritagePoints * 10**decimals()) / heritagePointsPerToken;
    }
    
    /**
     * @dev Get current economic parameters
     * Used by frontend and analytics for displaying current rates and limits
     */
    function getEconomicInfo() external view returns (
        uint256 currentSupply,     // Current circulating supply
        uint256 maxSupplyLimit,    // Maximum possible supply
        uint256 remaining,         // Remaining tokens to mint
        uint256 conversionRate,    // HP per TREE ratio
        uint256 dailyLimit,        // Max TREE per day per user
        uint256 maxRewardSizeLimit // Max TREE per single reward
    ) {
        currentSupply = totalSupply();
        maxSupplyLimit = MAX_SUPPLY;
        remaining = MAX_SUPPLY > currentSupply ? MAX_SUPPLY - currentSupply : 0;
        conversionRate = heritagePointsPerToken;
        dailyLimit = dailyMintLimit;
        maxRewardSizeLimit = maxRewardSize;
    }
    
    /**
     * @dev Update Heritage Points to TREE conversion rate
     * Higher rate = more HP needed per TREE (deflationary)
     * Lower rate = fewer HP needed per TREE (inflationary)
     * Allows economic adjustments as WorldTree platform grows.
     */
    function updateConversionRate(uint256 newRate) external onlyRole(ADMIN_ROLE) {
        require(newRate >= 50 && newRate <= 500, "Rate must be between 50-500 HP per TREE");
        
        uint256 oldRate = heritagePointsPerToken;
        heritagePointsPerToken = newRate;
        
        emit EconomicParameterUpdated("conversionRate", oldRate, newRate);
    }
    
    /**
     * @dev Authorize/deauthorize WorldTree backend wallets for reward minting
     * Critical security function - only admin can modify
     * Backend wallets are WorldTree-controlled addresses that mint rewards
     * Should be secure, monitored wallets controlled by WorldTree.
     */
    function setBackendMinter(address minter, bool authorized) external onlyRole(ADMIN_ROLE) {
        require(minter != address(0), "Invalid minter address");
        
        backendMinters[minter] = authorized;
        emit BackendMinterAuthorized(minter, authorized);
    }
    
    /**
     * @dev Admin emergency mint function with strict limits
     * For initial distributions, partnerships, or emergency situations.
     * Capped at 1000 TREE per call to prevent abuse.
     * 
     * @param to Recipient address
     * @param amount Amount to mint (max 1000 TREE)
     */
    function adminMint(address to, uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(to != address(0), "Invalid recipient");
        require(amount > 0 && amount <= MAX_ADMIN_MINT, "Amount exceeds admin limit");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        
        _mint(to, amount);
        emit RewardMinted(to, amount, "admin_mint");
    }
}