'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useUnifiedSession } from '@/hooks/useUnifiedSession';

// Dynamic import to avoid SSR issues
const Onboarding = dynamic(
  () => import("@/components/Onboarding"),
  { ssr: false }
);

// Dynamic import for LandingPage (World ID verification)
const LandingPage = dynamic(
  () => import("@/components/LandingPage"),
  { ssr: false }
);

export default function Home() {
  const [currentStep, setCurrentStep] = useState<'loading' | 'onboarding' | 'verification' | 'completed'>('loading');
  const router = useRouter();
  const unifiedSession = useUnifiedSession();

  useEffect(() => {
    console.log('Main App: Checking user status', {
      sessionStatus: unifiedSession.status,
      userId: unifiedSession.user?.id
    });

    // Check user authentication and onboarding status
    if (unifiedSession.status === 'loading') {
      return;
    }

    const onboardingCompleted = localStorage.getItem('worldtree_onboarding_completed');
    const onboardingSkipped = localStorage.getItem('worldtree_onboarding_skipped');
    
    // If user is already authenticated, check if they completed quiz
    if (unifiedSession.status === 'authenticated' && unifiedSession.user) {
      console.log('Main App: User authenticated, checking quiz status');
      
      // Check if user completed quiz (this would be set after quiz completion)
      const quizCompleted = localStorage.getItem('worldtree_quiz_completed');
      if (quizCompleted) {
        console.log('Main App: User completed quiz, redirecting to tree');
        router.push('/tree');
      } else {
        console.log('Main App: User needs to complete quiz');
        router.push('/quiz');
      }
      return;
    }

    // If onboarding was completed or skipped, show verification
    if (onboardingCompleted || onboardingSkipped) {
      console.log('Main App: Onboarding completed, showing verification');
      setCurrentStep('verification');
    } else {
      console.log('Main App: Showing onboarding');
      setCurrentStep('onboarding');
    }
  }, [unifiedSession.status, unifiedSession.user, router]);

  const handleOnboardingComplete = () => {
    console.log('Main App: Onboarding completed');
    localStorage.setItem('worldtree_onboarding_completed', 'true');
    setCurrentStep('verification');
  };

  const handleVerificationComplete = () => {
    console.log('Main App: Verification completed, redirecting to quiz');
    // After successful World ID verification, redirect to quiz
    router.push('/quiz');
  };

  // Loading state
  if (currentStep === 'loading') {
    return (
      <main className="h-[100dvh] overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading WorldTree...</p>
        </div>
      </main>
    );
  }

  // Onboarding step
  if (currentStep === 'onboarding') {
    return (
      <main className="h-[100dvh] overflow-hidden">
        <Onboarding onComplete={handleOnboardingComplete} />
      </main>
    );
  }

  // Verification step (World ID)
  if (currentStep === 'verification') {
    return (
      <main className="h-[100dvh] overflow-hidden">
        <LandingPage onComplete={handleVerificationComplete} />
      </main>
    );
  }

  // This should not be reached due to redirects above
  return null;
}
