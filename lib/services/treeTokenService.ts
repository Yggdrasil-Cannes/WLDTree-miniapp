import { ethers } from 'ethers';

export interface TREERewardResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  gasUsed?: number;
}

export class TreeTokenService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private backendWallet: ethers.Wallet;

  constructor() {
    console.log('🌳 Initializing TreeTokenService...');
    
    // Initialize provider (World Chain)
    const rpcUrl = process.env.NODE_ENV === 'production' 
      ? process.env.WORLD_CHAIN_RPC_URL_MAINNET
      : process.env.WORLD_CHAIN_RPC_URL_TESTNET;
    
    if (!rpcUrl) {
      throw new Error('World Chain RPC URL not configured');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Initialize backend wallet
    const backendPrivateKey = process.env.TREE_BACKEND_PRIVATE_KEY;
    if (!backendPrivateKey) {
      throw new Error('TREE backend private key not configured');
    }

    this.backendWallet = new ethers.Wallet(backendPrivateKey, this.provider);

    // Initialize contract
    const contractAddress = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_MAINNET
      : process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_TESTNET;

    if (!contractAddress) {
      throw new Error('TREE contract address not configured');
    }

    // Contract ABI for Heritage Tree Token
    const contractABI = [
      // Read functions
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function balanceOf(address) view returns (uint256)",
      "function getUserClaimInfo(address) view returns (uint256, uint256, uint256, uint256, uint256, uint256)",
      "function getEconomicInfo() view returns (uint256, uint256, uint256, uint256, uint256, uint256)",
      "function calculateTREEFromHeritagePoints(uint256) view returns (uint256)",
      
      // Write functions
      "function claimHeritageReward(address, uint256)",
      "function mintGenealogyReward(address, uint256, string)",
      "function batchMintGenealogyRewards(address[], uint256[], string[])",
      
      // Admin functions
      "function setBackendMinter(address, bool)",
      "function updateConversionRate(uint256)",
      
      // Events
      "event RewardMinted(address indexed user, uint256 amount, string rewardType)",
      "event BackendMinterAuthorized(address indexed minter, bool authorized)"
    ];

    this.contract = new ethers.Contract(contractAddress, contractABI, this.backendWallet);

    console.log('✅ TreeTokenService initialized successfully');
    console.log(`📍 Contract: ${contractAddress}`);
    console.log(`🔐 Backend Wallet: ${this.backendWallet.address}`);
  }

  /**
   * Mint TREE reward tokens for a user when they complete genealogy activities
   * 
   * Reward Types:
   * - "heritage_conversion": Basic Heritage Points to TREE conversion
   * - "tree_building": Family tree construction milestones
   * - "dna_upload": DNA data upload and processing
   * - "family_connection": Connecting with relatives
   * - "historical_research": Finding historical records
   * - "community_contribution": Sharing genealogy knowledge
   * - "achievement_unlock": Special genealogy achievements
   * 
   * @param userAddress User's wallet address
   * @param heritagePointsEarned Heritage Points earned (will be converted to TREE)
   * @param rewardType Type of reward (e.g., "tree_building", "dna_upload", "family_connection")
   * @returns Promise with transaction result
   */
  async mintRewardForHeritagePoints(
    userAddress: string,
    heritagePointsEarned: number,
    rewardType: string
  ): Promise<TREERewardResult> {
    try {
      console.log(`🌳 Minting TREE reward for ${userAddress}: ${heritagePointsEarned} heritage points (${rewardType})`);

      // Validate inputs
      if (!ethers.isAddress(userAddress)) {
        throw new Error('Invalid user address format');
      }

      if (heritagePointsEarned <= 0) {
        throw new Error('Heritage points must be positive');
      }

      // Check if backend wallet is authorized
      const isAuthorized = await this.contract.backendMinters(this.backendWallet.address);
      if (!isAuthorized) {
        console.error('❌ Backend wallet not authorized to mint TREE tokens');
        return {
          success: false,
          error: 'Backend wallet not authorized for minting'
        };
      }

      // Calculate TREE reward amount based on heritage points and type
      let rewardAmount: bigint;
      
      if (rewardType === 'heritage_conversion') {
        // Direct conversion: use Heritage Points to calculate TREE tokens
        rewardAmount = await this.contract.calculateTREEFromHeritagePoints(heritagePointsEarned);
      } else {
        // Special milestone rewards: bonus TREE tokens
        if (rewardType === 'tree_building' || rewardType === 'major_discovery') {
          // Major milestone: 1 TREE token
          rewardAmount = ethers.parseEther('1.0');
          console.log(`🌟 Major milestone reward: 1 TREE`);
        } else if (rewardType === 'dna_upload' || rewardType === 'family_connection') {
          // Medium milestone: 0.5 TREE tokens
          rewardAmount = ethers.parseEther('0.5');
          console.log(`🧬 DNA/Family milestone reward: 0.5 TREE`);
        } else if (rewardType === 'historical_research' || rewardType === 'record_discovery') {
          // Small milestone: 0.2 TREE tokens
          rewardAmount = ethers.parseEther('0.2');
          console.log(`📜 Research milestone reward: 0.2 TREE`);
        } else {
          // Micro rewards: 0.1 TREE tokens
          rewardAmount = ethers.parseEther('0.1');
          console.log(`⭐ Micro reward: 0.1 TREE`);
        }
      }

      // Ensure we don't exceed the max reward size (100 TREE)
      const maxReward = ethers.parseEther('100.0');
      if (rewardAmount > maxReward) {
        rewardAmount = maxReward;
        console.log(`🚨 Reward capped at max: 100 TREE`);
      }

      console.log(`💰 Final reward amount: ${ethers.formatEther(rewardAmount)} TREE (${rewardAmount.toString()} wei)`);

      // Execute the minting transaction
      const tx = await this.contract.mintGenealogyReward(
        userAddress,
        rewardAmount,
        rewardType
      );

      console.log(`⏳ TREE reward transaction submitted: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ TREE reward minted successfully!`);
      console.log(`📊 Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`🔗 Block: ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: receipt.hash || tx.hash,
        gasUsed: Number(receipt.gasUsed)
      };

    } catch (error: any) {
      console.error('❌ Error minting TREE reward:', error);
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Batch mint TREE rewards for multiple users
   * Used for processing multiple genealogy achievements in one transaction
   * 
   * @param rewards Array of reward objects with user, amount, and type
   * @returns Promise with batch transaction result
   */
  async batchMintGenealogyRewards(
    rewards: Array<{
      userAddress: string;
      heritagePoints: number;
      rewardType: string;
    }>
  ): Promise<TREERewardResult> {
    try {
      console.log(`🌳 Batch minting TREE rewards for ${rewards.length} users`);

      // Validate inputs
      if (rewards.length === 0) {
        throw new Error('No rewards to process');
      }

      if (rewards.length > 50) {
        throw new Error('Too many rewards in batch (max 50)');
      }

      // Prepare batch data
      const users: string[] = [];
      const amounts: bigint[] = [];
      const rewardTypes: string[] = [];

      for (const reward of rewards) {
        if (!ethers.isAddress(reward.userAddress)) {
          throw new Error(`Invalid address: ${reward.userAddress}`);
        }

        users.push(reward.userAddress);
        rewardTypes.push(reward.rewardType);

        // Calculate amount based on heritage points and type
        let amount: bigint;
        if (reward.rewardType === 'heritage_conversion') {
          amount = await this.contract.calculateTREEFromHeritagePoints(reward.heritagePoints);
        } else {
          // Use standard milestone amounts for non-conversion rewards
          amount = ethers.parseEther('0.1'); // Default micro reward
        }

        amounts.push(amount);
      }

      // Execute batch transaction
      const tx = await this.contract.batchMintGenealogyRewards(users, amounts, rewardTypes);

      console.log(`⏳ Batch TREE reward transaction submitted: ${tx.hash}`);

      const receipt = await tx.wait();
      console.log(`✅ Batch TREE rewards minted successfully: ${receipt.hash || tx.hash}`);

      return {
        success: true,
        transactionHash: receipt.hash || tx.hash,
        gasUsed: Number(receipt.gasUsed)
      };

    } catch (error: any) {
      console.error('❌ Error batch minting TREE rewards:', error);
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Get user's total TREE balance
   */
  async getUserTREEBalance(userAddress: string): Promise<bigint> {
    try {
      const balance = await this.contract.balanceOf(userAddress);
      return balance;
    } catch (error) {
      console.error('❌ Error getting TREE balance:', error);
      return BigInt(0);
    }
  }

  /**
   * Get comprehensive user claim information
   */
  async getUserClaimInfo(userAddress: string) {
    try {
      const [balance, dailyClaimed, dailyRemaining, totalClaimed, lastClaimDay, currentDay] = 
        await this.contract.getUserClaimInfo(userAddress);

      return {
        balance: ethers.formatEther(balance),
        dailyClaimed: ethers.formatEther(dailyClaimed),
        dailyRemaining: ethers.formatEther(dailyRemaining),
        totalClaimed: ethers.formatEther(totalClaimed),
        lastClaimDay: Number(lastClaimDay),
        currentDay: Number(currentDay)
      };
    } catch (error) {
      console.error('❌ Error getting user claim info:', error);
      throw error;
    }
  }

  /**
   * Get current token economics information
   */
  async getTokenEconomics() {
    try {
      const [currentSupply, maxSupply, remaining, conversionRate, dailyLimit, maxRewardSize] = 
        await this.contract.getEconomicInfo();

      return {
        currentSupply: ethers.formatEther(currentSupply),
        maxSupply: ethers.formatEther(maxSupply),
        remaining: ethers.formatEther(remaining),
        conversionRate: Number(conversionRate), // Heritage Points per TREE
        dailyLimit: ethers.formatEther(dailyLimit),
        maxRewardSize: ethers.formatEther(maxRewardSize)
      };
    } catch (error) {
      console.error('❌ Error getting token economics:', error);
      throw error;
    }
  }

  /**
   * Calculate TREE tokens from Heritage Points
   */
  async calculateTREEFromHeritagePoints(heritagePoints: number): Promise<string> {
    try {
      const treeAmount = await this.contract.calculateTREEFromHeritagePoints(heritagePoints);
      return ethers.formatEther(treeAmount);
    } catch (error) {
      console.error('❌ Error calculating TREE from Heritage Points:', error);
      throw error;
    }
  }
}

