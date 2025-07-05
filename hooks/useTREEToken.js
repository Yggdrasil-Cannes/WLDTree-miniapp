import { useState, useEffect } from 'react';
import { MiniKit } from '@worldcoin/minikit-js';

// TREE Token Contract Address (Heritage Tree Token for WorldTree)
const TREE_CONTRACT_ADDRESS = process.env.NODE_ENV === 'production'
  ? process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_MAINNET
  : process.env.NEXT_PUBLIC_TREE_CONTRACT_ADDRESS_TESTNET;

// Heritage Tree Token ABI (essential functions only)
const TREE_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)', 
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function getUserClaimInfo(address) view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
  'function getEconomicInfo() view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
  'function calculateTREEFromHeritagePoints(uint256) view returns (uint256)',
  
  // Events
  'event RewardMinted(address indexed user, uint256 amount, string rewardType)'
];

const WORLD_CHAIN_CONFIG = {
  chainId: process.env.NODE_ENV === 'production' ? 480 : 4801,
  chainName: process.env.NODE_ENV === 'production' ? 'World Chain' : 'World Chain Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [
    process.env.NODE_ENV === 'production' 
      ? 'https://worldchain.g.alchemy.com/public'
      : 'https://worldchain-sepolia.g.alchemy.com/public'
  ],
  blockExplorerUrls: [
    process.env.NODE_ENV === 'production'
      ? 'https://worldchain.explorer.alchemy.com'
      : 'https://worldchain-sepolia.explorer.alchemy.com'
  ]
};

export const useTREEToken = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState('0');
  const [userStats, setUserStats] = useState({
    balance: '0',
    dailyClaimed: '0',
    dailyRemaining: '0',
    totalClaimed: '0',
    lastClaimDay: 0,
    currentDay: 0
  });
  const [tokenEconomics, setTokenEconomics] = useState({
    currentSupply: '0',
    maxSupply: '0',
    remaining: '0',
    conversionRate: 100,      // 100 HP = 1 TREE
    dailyLimit: '0',
    maxRewardSize: '0'
  });
  const [error, setError] = useState(null);

  /**
   * Check if user is in World App environment
   */
  const isWorldApp = () => {
    return typeof window !== 'undefined' && window.MiniKit;
  };

  /**
   * Check if user has World Chain network added to their wallet
   */
  const hasWorldChain = async () => {
    if (!window.ethereum) return false;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId === `0x${WORLD_CHAIN_CONFIG.chainId.toString(16)}`;
    } catch (error) {
      console.error('Error checking chain:', error);
      return false;
    }
  };

  /**
   * 🚀 MAIN FUNCTION: Claim TREE tokens using World Send Transaction
   */
  const claimTREETokens = async (heritagePointsAmount, worldIdProof) => {
    if (!isWorldApp()) {
      throw new Error('World App required for claiming TREE');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🌳 Starting TREE token claim process...');
      console.log('Heritage Points:', heritagePointsAmount);
      console.log('World ID Proof:', worldIdProof);

      console.log('🌳 Initiating TREE claim with World Send Transaction...');

      // Call our backend API to prepare the TREE claim
      console.log('📡 Calling backend for TREE claim...');
      
      const claimResponse = await fetch('/api/claim-tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heritagePointsAmount,
          worldIdProof,
          userAddress: MiniKit.user?.walletAddress,
        }),
      });

      const claimData = await claimResponse.json();

      if (!claimData.success) {
        throw new Error(claimData.error || 'Failed to prepare TREE claim');
      }

      console.log('✅ Backend prepared TREE claim:', claimData);

      // ✨ THIS IS THE WORLD SEND TRANSACTION FOR TREE! ✨
      const sendTransactionPayload = {
        transaction: [
          {
            address: TREE_CONTRACT_ADDRESS,
            abi: TREE_ABI,
            functionName: 'claimHeritageReward',
            args: [
              MiniKit.user?.walletAddress,
              heritagePointsAmount,
            ],
          },
        ],
      };

      console.log('📤 TREE World transaction sent!');
      console.log('Transaction Payload:', sendTransactionPayload);

      const { transactionId } = await MiniKit.sendTransaction(sendTransactionPayload);

      console.log('📬 Transaction ID received:', transactionId);

      // Poll for transaction hash
      const transactionHash = await pollForTransactionHash(transactionId);
      
      if (transactionHash) {
        console.log('✅ TREE claim transaction submitted successfully!');
        console.log('🔗 Transaction Hash:', transactionHash);
        
        // Refresh user data
        await loadUserData();
        
        return {
          success: true,
          transactionHash,
          transactionId
        };
      } else {
        throw new Error('Failed to get transaction hash');
      }

    } catch (error) {
      console.error('❌ TREE claim failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Poll World API for transaction hash after World Send Transaction
   */
  const pollForTransactionHash = async (txId, maxAttempts = 30, interval = 2000) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log('🔄 Polling for TREE transaction hash...', txId);
        
        const response = await fetch(`/api/world-transaction-status?transactionId=${txId}`);
        const data = await response.json();
        
        if (data.success && data.transactionHash) {
          console.log('🎉 TREE transaction hash received:', data.transactionHash);
          return data.transactionHash;
        }
        
        if (attempt < maxAttempts) {
          console.log(`⏳ Attempt ${attempt}/${maxAttempts}, retrying in ${interval/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      } catch (error) {
        console.error('Error polling for TREE transaction hash:', error);
        if (attempt === maxAttempts) {
          throw error;
        }
      }
    }
    
    throw new Error('Transaction hash polling timeout');
  };

  /**
   * Add TREE token to MetaMask (World Chain)
   */
  const addTREEToWallet = async () => {
    console.log('🦊 Adding TREE to wallet via World App...');
    
    try {
      if (isWorldApp()) {
        // In World App, show token information
        const tokenInfo = `🌳 TREE Token Information:
        
🏷️ Name: Heritage Tree Token
🏷️ Symbol: TREE
📍 Contract: ${TREE_CONTRACT_ADDRESS}
⛓️ Network: World Chain

To add TREE to external wallets:
1. Switch to World Chain network
2. Add custom token
3. Use contract address above
4. TREE will appear in your wallet

Note: World App automatically recognizes TREE transactions!`;
        
        // Could show this in a modal or notification
        console.log(tokenInfo);
        alert(tokenInfo);
        return true;
      }
      
      // For MetaMask/external wallets
      console.log('🦊 Adding TREE to MetaMask on World Chain...');
      
      if (!window.ethereum) {
        throw new Error('MetaMask not detected');
      }

      // Switch to World Chain if needed
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      const targetChainId = `0x${WORLD_CHAIN_CONFIG.chainId.toString(16)}`;
      
      if (currentChainId !== targetChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError) {
          // Chain not added yet
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [WORLD_CHAIN_CONFIG],
            });
          } else {
            throw switchError;
          }
        }
      }

      // Add TREE token
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: TREE_CONTRACT_ADDRESS,
            symbol: 'TREE',
            decimals: 18,
            image: `${window.location.origin}/tokens/tree-token.png`,
          },
        },
      });

      console.log('✅ TREE added to MetaMask!');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to add TREE to wallet:', error);
      setError(error.message);
      return false;
    }
  };

  /**
   * Load user TREE data and statistics
   */
  const loadUserData = async () => {
    if (!isWorldApp() || !MiniKit.user?.walletAddress) {
      console.log('📊 Loading TREE user data...');
      
      // Mock data for development/non-World App environments
      setUserStats({
        balance: '0.5',
        dailyClaimed: '0.2',
        dailyRemaining: '0.8',
        totalClaimed: '5.7',
        lastClaimDay: Math.floor(Date.now() / 86400000) - 1,
        currentDay: Math.floor(Date.now() / 86400000)
      });
      
      setTokenEconomics({
        currentSupply: '50000000',
        maxSupply: '1000000000',
        remaining: '950000000',
        conversionRate: 100,      // 100 HP = 1 TREE
        dailyLimit: '1000',
        maxRewardSize: '100'
      });
      
      return;
    }

    try {
      const userAddress = MiniKit.user.walletAddress;
      
      // Call our API to get user TREE data
      const response = await fetch(`/api/user-tree-data?address=${userAddress}`);
      const data = await response.json();
      
      if (data.success) {
        setUserStats(data.userStats);
        setTokenEconomics(data.tokenEconomics);
        setBalance(data.userStats.balance);
      }
    } catch (error) {
      console.error('Error loading TREE user data:', error);
    }
  };

  /**
   * Calculate TREE tokens from heritage points
   */
  const calculateTREEFromHeritagePoints = (heritagePoints) => {
    const treeAmount = heritagePoints / tokenEconomics.conversionRate;
    return {
      heritagePoints,
      treeTokens: treeAmount.toFixed(2),
      conversionRate: tokenEconomics.conversionRate
    };
  };

  /**
   * Get user's current TREE balance
   */
  const getUserBalance = () => balance;

  /**
   * Check if user can claim TREE today
   */
  const canClaimToday = () => {
    return parseFloat(userStats.dailyRemaining) > 0;
  };

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  return {
    // State
    balance,
    userStats,
    tokenEconomics,
    isLoading,
    error,

    // Actions
    claimTREETokens, // 🔥 Main function using World Send Transaction
    addTREEToWallet,
    loadUserData,
    calculateTREEFromHeritagePoints,
    
    // Utilities
    getUserBalance,
    canClaimToday,
    isWorldApp,
    hasWorldChain,
    
    // Constants
    TREE_CONTRACT_ADDRESS,
    WORLD_CHAIN_CONFIG
  };
};