'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MiniKit, WalletAuthInput } from '@worldcoin/minikit-js';
import { useUnifiedSession } from '@/hooks/useUnifiedSession';

interface LandingPageProps {
  onComplete?: () => void;
}

export function LandingPage({ onComplete }: LandingPageProps = {}) {
  const router = useRouter();
  const unifiedSession = useUnifiedSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already authenticated
  useEffect(() => {
    if (unifiedSession.status === 'authenticated' && unifiedSession.user) {
      console.log('LandingPage: User already authenticated, redirecting to quiz');
      if (onComplete) {
        onComplete();
      } else {
        router.push('/quiz');
      }
    }
  }, [unifiedSession.status, unifiedSession.user, router, onComplete]);

  const signInWithWallet = async () => {
    console.log('🌐 Starting Wallet Auth (Sign in with Ethereum)...');
    
    if (!MiniKit.isInstalled()) {
      console.error('❌ MiniKit not installed');
      setError('World App is required for authentication');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get nonce from backend
      console.log('📡 Fetching nonce from backend...');
      const res = await fetch('/api/nonce');
      const { nonce } = await res.json();
      console.log('✅ Nonce received:', nonce);

      // Step 2: Call walletAuth command
      console.log('🔐 Calling walletAuth command...');
      const { commandPayload: generateMessageResult, finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: 'worldtree-signin',
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        statement: 'Sign in to WorldTree - Your Family Heritage Platform',
      });

      console.log('📋 Wallet auth result:', finalPayload);

      if (finalPayload.status === 'error') {
        console.error('❌ Wallet auth command failed:', finalPayload);
        setError('Authentication failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Step 3: Verify the response in backend
      console.log('🔍 Verifying SIWE response in backend...');
      const response = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
          username: MiniKit.user?.username, // Get username from MiniKit
        }),
      });

      const verifyResult = await response.json();
      console.log('✅ Backend verification result:', verifyResult);

      if (verifyResult.status === 'success' && verifyResult.isValid) {
        console.log('🎉 Wallet authentication successful!');
        
        // Store user data
        const walletAddress = finalPayload.address;
        const username = MiniKit.user?.username || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
        
        localStorage.setItem('worldcoin_user_id', walletAddress);
        localStorage.setItem('worldcoin_username', username);
        localStorage.setItem('worldcoin_wallet_address', walletAddress);
        localStorage.setItem('worldIdUser', JSON.stringify({
          id: walletAddress,
          name: username,
          isVerified: true,
          walletAddress: walletAddress,
          authMethod: 'wallet'
        }));

        console.log('💾 User data stored:', {
          id: walletAddress,
          name: username,
          isVerified: true
        });

        // Complete the flow
        if (onComplete) {
          onComplete();
        } else {
          router.push('/quiz');
        }
      } else {
        console.error('❌ Backend verification failed:', verifyResult);
        setError(verifyResult.message || 'Authentication verification failed');
      }
    } catch (error) {
      console.error('❌ Wallet auth error:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (unifiedSession.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white"
        >
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-black/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span className="text-3xl">🌳</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Welcome to WorldTree
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-300 mb-8"
        >
          Sign in with your Ethereum wallet to begin your family tree journey
        </motion.p>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={signInWithWallet}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              <>
                🔐 Sign in with Ethereum
              </>
            )}
          </button>
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-gray-400"
          >
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Completing authentication...</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-6 border-t border-gray-800"
        >
          <button
            onClick={() => {
              if (onComplete) {
                onComplete();
              } else {
                router.push('/quiz');
              }
            }}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Continue as guest
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Default export for dynamic imports
export default LandingPage; 