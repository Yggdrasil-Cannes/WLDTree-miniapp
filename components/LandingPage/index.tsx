'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { VerifyBlock } from '@/components/Verify';
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

  const handleVerificationSuccess = async (result: any) => {
    console.log('LandingPage: World ID verification successful', result);
    setIsLoading(true);
    
    try {
      // Store user data and redirect to quiz
      if (result.nullifier_hash) {
        localStorage.setItem('worldcoin_user_id', result.nullifier_hash);
        localStorage.setItem('worldIdUser', JSON.stringify({
          id: result.nullifier_hash,
          isVerified: true,
          verificationLevel: result.verification_level || 'orb'
        }));
      }
      
      console.log('LandingPage: Verification complete, calling onComplete callback');
      if (onComplete) {
        onComplete();
      } else {
        router.push('/quiz');
      }
    } catch (error) {
      console.error('LandingPage: Error handling verification success:', error);
      setError('Failed to complete verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationError = (error: any) => {
    console.error('LandingPage: World ID verification failed', error);
    setError('Verification failed. Please try again.');
    setIsLoading(false);
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
          Verify your identity with World ID to begin your family tree journey
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
          <VerifyBlock 
            action="worldtree-signin"
            onSuccess={handleVerificationSuccess}
            onError={handleVerificationError}
          />
        </motion.div>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-gray-400"
          >
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Completing verification...</p>
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