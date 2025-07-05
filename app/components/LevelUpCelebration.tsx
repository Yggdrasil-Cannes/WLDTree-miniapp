import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export const LevelUpCelebration: React.FC = () => {
  const [show, setShow] = useState(false);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    const handleLevelUp = (event: CustomEvent) => {
      setLevel(event.detail.newLevel);
      setShow(true);
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Auto hide after 5 seconds
      setTimeout(() => setShow(false), 5000);
    };

    document.addEventListener('levelUp', handleLevelUp as EventListener);
    return () => document.removeEventListener('levelUp', handleLevelUp as EventListener);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-white rounded-2xl p-8 text-center max-w-md mx-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            
            <h2 className="text-3xl font-bold text-purple-800 mb-4">
              Level Up!
            </h2>
            
            <p className="text-xl text-gray-700 mb-6">
              Congratulations! You&apos;ve reached <br />
              <span className="text-purple-600 font-bold">Level {level}</span>
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-purple-800 font-medium">🎁 New Rewards Unlocked:</p>
                <ul className="text-sm text-purple-700 mt-2">
                  <li>• Evolution NFT minted</li>
                  <li>• New curator archetype traits</li>
                  <li>• Enhanced dashboard analytics</li>
                  <li>• Exclusive beta access</li>
                </ul>
              </div>
            </div>
            
            <button
              onClick={() => setShow(false)}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Continue Journey 🚀
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 