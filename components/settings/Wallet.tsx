"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Vault, Coins, ArrowUpRight, ArrowDownLeft, History, Lock, X, Eye, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useUnifiedSession } from '@/hooks/useUnifiedSession';

// Ethereum window object type declaration
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] | Record<string, any> }) => Promise<any>;
    };
  }
}

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  image: string;
  mintedAt?: string;
  transactionId?: string;
  contract: string;
  network: string;
  rarity: string;
}

interface Transaction {
  id: number;
  type: 'earn' | 'spend' | 'mint';
  amount?: number;
  description: string;
  date: string;
  status: 'completed' | 'pending';
  txHash?: string;
}

export default function Wallet() {
  const router = useRouter();
  const unifiedSession = useUnifiedSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [proofPoints, setProofPoints] = useState(50);
  const [credits, setCredits] = useState(3);
  const [loading, setLoading] = useState(true);

  // User badges from database
  const [userBadges, setUserBadges] = useState<BadgeItem[]>([]);

  // Dynamic transactions including minting
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 2,
      type: 'earn',
      amount: 50,
      description: 'Badge Minting Reward',
      date: new Date().toLocaleDateString(),
      status: 'completed'
    },
    {
      id: 3,
      type: 'earn',
      amount: 3,
      description: 'Quiz Completion Credits',
      date: new Date().toLocaleDateString(),
      status: 'completed'
    }
  ]);

  // Prevent redirect to quiz if user is accessing wallet directly
  useEffect(() => {
    // If user is not authenticated, don't redirect to quiz from wallet
    // Just show the wallet with limited functionality
    if (unifiedSession.status === 'unauthenticated') {
      setLoading(false);
      return;
    }
  }, [unifiedSession.status]);

  // Load user data on mount
  useEffect(() => {
    const loadUserBadgeData = async () => {
      try {
        const userId = unifiedSession.user?.id;
        if (!userId) return;

        setLoading(true);
        
        // Fetch user's real badge data from database
        const response = await fetch(`/api/user/badges?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          
          // Update proof points and credits from database
          setProofPoints(data.proofPoints || 50);
          
          // Convert badge mints to badge items
          const badges: BadgeItem[] = data.badges.map((mint: any) => ({
            id: mint.id,
            name: mint.badgeName?.includes('Heritage') || mint.badgeType === 'Heritage' ? 'Heritage Explorer Badge' : mint.badgeName,
            description: (mint.badgeName?.includes('Heritage') || mint.badgeType === 'Heritage')
              ? 'First badge earned for completing the heritage quiz'
              : `Badge for ${mint.badgeName}`,
            image: (mint.badgeName?.includes('Heritage') || mint.badgeType === 'Heritage') ? '/badges/Edge_Badge.png' : '/badges/default.png',
            mintedAt: mint.mintedAt,
            transactionId: mint.transactionId,
            contract: 'ERC1155',
            network: mint.network || 'World Chain Sepolia',
            rarity: 'Common'
          }));

          setUserBadges(badges);

          // Update transactions with real mint data
          if (data.badges.length > 0) {
            const mintTransactions = data.badges.map((mint: any, index: number) => ({
              id: index + 1,
              type: 'mint' as const,
              description: `${mint.badgeName} Badge Minted`,
              date: new Date(mint.mintedAt).toLocaleDateString(),
              status: 'completed' as const,
              txHash: mint.transactionId
            }));

            setTransactions(prev => [
              ...mintTransactions,
              ...prev.filter(tx => tx.type !== 'mint')
            ]);
          }
        }



        // Also check localStorage for fallback data
        const storedMintResult = localStorage.getItem('lastMintResult');
        if (storedMintResult && userBadges.length === 0) {
          try {
            const mintData = JSON.parse(storedMintResult);
            // Add fallback badge if no database records  
            const fallbackBadge: BadgeItem = {
              id: 'fallback',
              name: 'Heritage Explorer Badge',
              description: 'First badge earned for completing the heritage quiz',
              image: '/badges/Edge_Badge.png',
              mintedAt: mintData.timestamp || new Date().toISOString(),
              transactionId: mintData.transactionId || '',
              contract: 'ERC1155',
              network: 'World Chain Sepolia',
              rarity: 'Common'
            };
            
            setUserBadges([fallbackBadge]);
            
            if (mintData.transactionId) {
              setTransactions(prev => [
                {
                  id: 1,
                  type: 'mint',
                  description: 'Heritage Explorer Badge Minted',
                  date: new Date(mintData.timestamp || Date.now()).toLocaleDateString(),
                  status: 'completed',
                  txHash: mintData.transactionId
                },
                ...prev.filter(tx => tx.type !== 'mint')
              ]);
            }
          } catch (error) {
            console.error('Error parsing mint result:', error);
          }
        }
      } catch (error) {
        console.error('Error loading badge data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (unifiedSession.status !== 'loading' && unifiedSession.user?.id) {
      loadUserBadgeData();
    } else if (unifiedSession.status === 'unauthenticated') {
      // Still allow wallet to load for unauthenticated users
      setLoading(false);
    }
  }, [unifiedSession.status, unifiedSession.user?.id]);

  const handleBadgeClick = (badge: BadgeItem) => {
    setSelectedBadge(badge);
  };

  const closeBadgeModal = () => {
    setSelectedBadge(null);
  };

  // Add to Metamask functionality
  const handleAddToMetamask = async () => {
    if (!selectedBadge) return;

    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const contractAddress = '0xE058B6D762346586d1d1315dFED4029d17b0160D';
        const tokenId = '1'; // Heritage Explorer token ID
        
        await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC1155',
            options: {
              address: contractAddress,
              tokenId: tokenId,
              symbol: 'EDGE',
              decimals: 0,
              image: `${window.location.origin}/badges/Edge_Badge.png`,
            },
          },
        });
        
        console.log('✅ Badge added to Metamask successfully');
      } else {
        alert('Metamask not detected. Please install Metamask to add this badge to your wallet.');
      }
    } catch (error) {
      console.error('❌ Failed to add badge to Metamask:', error);
      alert('Failed to add badge to Metamask. Please try again.');
    }
  };

  // View on Explorer functionality
  const handleViewOnExplorer = () => {
    if (!selectedBadge?.transactionId) return;
    
    const explorerUrl = `https://worldscan.org/tx/${selectedBadge.transactionId}`;
    window.open(explorerUrl, '_blank');
  };

  // TX Hash click functionality
  const handleTxHashClick = (txHash: string) => {
    // Use World Chain Sepolia explorer for transactions (testnet)
    const explorerUrl = `https://worldchain-sepolia.blockscout.com/tx/${txHash}`;
    window.open(explorerUrl, '_blank');
    
    // Also log for debugging
    console.log('🔍 Opening transaction in explorer:', explorerUrl);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earn':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'spend':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'mint':
        return <Vault className="w-5 h-5 text-purple-500" />;
      default:
        return <ArrowDownLeft className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <>
    <motion.div
      className="p-4 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded hover:bg-indigo-200 focus:ring-2 focus:ring-indigo-400 transition flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
      >
        <ArrowLeft className="w-5 h-5" /> Go Back
      </motion.button>

      <motion.h1
        className="text-2xl font-bold mb-2 text-indigo-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        Wallet
      </motion.h1>

        {/* User Info */}
        {unifiedSession.user && (
          <motion.div
            className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow px-5 py-4 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="text-sm text-gray-600 mb-1">Connected Wallet</div>
            <div className="text-lg font-bold text-indigo-700">
              {unifiedSession.user.name}
            </div>
            {unifiedSession.user.worldcoinId && (
              <div className="text-xs text-gray-500 font-mono">
                {unifiedSession.user.worldcoinId.slice(0, 10)}...{unifiedSession.user.worldcoinId.slice(-6)}
              </div>
            )}
          </motion.div>
        )}

      {/* Stats Widget */}
      <motion.div
        className="grid grid-cols-2 gap-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow px-4 py-4">
          <div className="flex items-center gap-3">
            <Image src="/badges/coin.PNG" alt="ProofPoints" width={32} height={32} />
            <div>
              <div className="text-xs text-gray-500">ProofPoints™</div>
              <div className="text-xl font-bold text-orange-700">{proofPoints}</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow px-4 py-4">
          <div className="flex items-center gap-3">
            <Coins className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-xs text-gray-500">Credits</div>
              <div className="text-xl font-bold text-purple-700">{credits}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badges Section */}
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          🏆 My Badges ({userBadges.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your badges...</p>
          </div>
        ) : userBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {userBadges.map((badge) => (
              <motion.div
                key={badge.id}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all border-2 border-transparent hover:border-purple-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBadgeClick(badge)}
              >
                <div className="relative w-16 h-16 mx-auto mb-3">
                  <Image
                    src={badge.image}
                    alt={badge.name}
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {badge.name.replace('Heritage Explorer ', '')}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{badge.rarity}</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">No badges earned yet</p>
            <p className="text-sm text-gray-500">Complete quizzes and challenges to earn your first badge!</p>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="bg-white rounded-xl shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'overview'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'history'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="w-4 h-4 inline mr-1" />
            History
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recent Activity</h4>
              {transactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        {transaction.date}
                        {transaction.txHash && (
                          <button
                            onClick={() => handleTxHashClick(transaction.txHash!)}
                            className="text-xs font-mono bg-white px-1 py-0.5 rounded border hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer flex items-center gap-1"
                          >
                            {transaction.txHash.slice(0, 8)}...
                            <ExternalLink className="w-2 h-2" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'earn' ? 'text-green-600' : 
                    transaction.type === 'spend' ? 'text-red-600' : 'text-purple-600'
                  }`}>
                    {transaction.amount ? 
                      `${transaction.type === 'earn' ? '+' : '-'}${transaction.amount}` : 
                      'NFT'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Transaction History</h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-700">View All</button>
            </div>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        {transaction.date}
                        {transaction.txHash && (
                          <button
                            onClick={() => handleTxHashClick(transaction.txHash!)}
                            className="text-xs font-mono bg-white px-1 py-0.5 rounded border hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer flex items-center gap-1"
                          >
                            {transaction.txHash.slice(0, 8)}...
                            <ExternalLink className="w-2 h-2" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'earn' ? 'text-green-600' : 
                    transaction.type === 'spend' ? 'text-red-600' : 'text-purple-600'
                  }`}>
                    {transaction.amount ? 
                      `${transaction.type === 'earn' ? '+' : '-'}${transaction.amount}` : 
                      'NFT'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeBadgeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Badge Details</h3>
                <button
                  onClick={closeBadgeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={selectedBadge.image}
                    alt={selectedBadge.name}
                    fill
                    className="object-contain"
                    sizes="128px"
                  />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedBadge.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">On-Chain Information</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract:</span>
                      <span className="font-medium">{selectedBadge.contract}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network:</span>
                      <span className="font-medium">{selectedBadge.network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rarity:</span>
                      <span className="font-medium">{selectedBadge.rarity}</span>
                    </div>
                    {selectedBadge.mintedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minted:</span>
                        <span className="font-medium">
                          {new Date(selectedBadge.mintedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedBadge.transactionId && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">TX Hash:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                            {selectedBadge.transactionId.slice(0, 10)}...{selectedBadge.transactionId.slice(-6)}
                          </span>
                          <button 
                            onClick={() => handleTxHashClick(selectedBadge.transactionId!)}
                            className="p-1 hover:bg-gray-200 rounded transition"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToMetamask}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Add to Metamask
                </button>
                <button 
                  onClick={handleViewOnExplorer}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View on Explorer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 