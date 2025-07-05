'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LandingPage } from "@/components/LandingPage";

export default function Landing() {
  const router = useRouter();

  useEffect(() => {
    // Check if onboarding was completed
    const onboardingCompleted = localStorage.getItem('worldtree_onboarding_completed');
    const onboardingSkipped = localStorage.getItem('worldtree_onboarding_skipped');
    
    // If onboarding was not completed, redirect to home page
    if (!onboardingCompleted && !onboardingSkipped) {
      console.log('Landing: Onboarding not completed, redirecting to home');
      router.push('/');
      return;
    }
  }, [router]);

  return (
    <main className="min-h-[100dvh] flex items-center justify-center p-4 bg-gray-50 landing-page">
      <LandingPage />
      <style jsx global>{`
        .landing-page + div .fixed.bottom-0 {
          display: none;
        }
      `}</style>
    </main>
  );
} 