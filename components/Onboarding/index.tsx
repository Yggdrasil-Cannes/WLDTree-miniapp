'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
const WorldTreeOnboarding = dynamic(
  () => import('./WorldTreeOnboarding'),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }
);

const slides = [
  // {
  //   id: 1,
  //   title: "",
  //   subtitle: "",
  //   image: "/onboarding/welcome.png"
  // },
  {
    id: 1,
    title: "Welcome to WorldTree",
    subtitle: "Start your Heritage Journey — Discover your roots.",
    image: "/onboarding/brain.svg"
  },
  {
    id: 2,
    title: "Build Your Family Tree in minutes",
    subtitle: "From scattered memories to connected heritage",
    image: "/onboarding/rocket.svg",
    checklist: [
      "Lost family stories? We'll help you map your heritage — preserved forever on-chain.",
      "DNA insights, historical records, and AI-powered genealogy research.",
      "Plus, you earn Heritage Points for every family connection discovered"
    ]
  },
  {
    id: 3,
    title: "Meet Your Genealogy Guide",
    subtitle: "Got ancestry questions? We've got the AI-powered answers",
    image: "/onboarding/crown.svg",
    checklist: [
      "Share your family knowledge — we'll help you discover missing connections.",
      "No confusion. No endless research. Just personalized genealogy insights.",
      "You'll get Your Heritage Map™ — verified, scored, and blockchain-secured."
    ]
  },
  {
    id: 4,
    title: "🌳 Discover, Connect, Earn & Grow! 🌳",
    subtitle: "Earn rewards by building your family tree",
    image: "/onboarding/lightning.svg",
    checklist: [
      "Complete family discoveries and fill your vault with Heritage Points™",
      "Use your points to unlock DNA analysis and premium genealogy features",
      "Join the Heritage Revolution on World Chain"
    ]
  }
];

interface OnboardingProps {
  onComplete: (userData?: any) => void;
  userProfile?: any;
}

export default function Onboarding({ onComplete, userProfile }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } else {
      setCurrentSlide(prev => prev + 1);
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  // Handle page click to advance
  const handlePageClick = () => {
    if (currentSlide < slides.length - 1) {
      handleNext();
    }
  };

  // Handle sign in button
  const handleSignIn = () => {
    router.push('/landing');
  };

  const slide = slides[currentSlide];

  // Use SVGs for icons
  const iconSrcs = [
    '/onboarding/curator.png',
    '/onboarding/launch.png',
    '/onboarding/guide.png',
    '/onboarding/curator.png',
  ];
  const iconAlts = [
    'WorldTree Heritage Icon',
    'Family Tree Icon',
    'Genealogy Guide Icon',
    'Heritage Discovery Icon',
  ];
  const iconClassNames = [
    'rocket-icon-container',
    'brain-icon-container',
    'guide-icon-container',
    'crown-icon-container',
  ];

  useEffect(() => {
    // Initialize onboarding analytics
    console.log('WorldTree Onboarding: Starting 3D flow', {
      userProfile: userProfile?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });

    // Check if browser supports WebGL
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      setError('WebGL not supported. Please use a modern browser.');
      return;
    }

    setIsLoading(false);
  }, [userProfile]);

  const handleOnboardingComplete = (userData?: any) => {
    console.log('WorldTree Onboarding: Flow completed successfully', userData);
    
    // Track completion analytics
    const completionData = {
      userId: userProfile?.id || 'anonymous',
      completedAt: new Date().toISOString(),
      duration: Date.now() - (window as any).onboardingStartTime,
      userData
    };
    
    // Store completion in localStorage
    localStorage.setItem('worldtree_onboarding_completed', 'true');
    localStorage.setItem('worldtree_onboarding_data', JSON.stringify(completionData));
    
    onComplete(userData);
  };

  const handleSkip = () => {
    console.log('WorldTree Onboarding: User skipped flow');
    localStorage.setItem('worldtree_onboarding_skipped', 'true');
    onComplete();
  };

  if (error) {
  return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white max-w-md mx-4">
          <h2 className="text-2xl font-bold mb-4">⚠️ Browser Not Supported</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={handleSkip}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Continue Without 3D Experience
          </button>
            </div>
          </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
                <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold">Loading Your Journey...</h2>
          <p className="text-gray-400 text-sm">Preparing 3D experience</p>
        </div>
      </div>
    );
  }

  // Set start time for analytics
  if (!(window as any).onboardingStartTime) {
    (window as any).onboardingStartTime = Date.now();
        }

  return (
    <div className="relative w-full h-full">
      <WorldTreeOnboarding onComplete={handleOnboardingComplete} />
      
      {/* Emergency skip button (hidden by default) */}
      <button
        onClick={handleSkip}
        className="absolute top-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300 text-gray-400 hover:text-white text-xs"
        title="Emergency skip (for debugging)"
      >
        Emergency Skip
      </button>
    </div>
  );
} 