"use client";

import { QuizSection } from "@/components/QuizSection";
import dynamic from 'next/dynamic';

// Dynamic import for 3D quiz to avoid SSR issues
const WorldTree3DQuiz = dynamic(
  () => import('@/components/QuizSection/WorldTree3DQuiz'),
  { ssr: false }
);
import { useUnifiedSession } from "@/hooks/useUnifiedSession";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function QuizPage() {
  const unifiedSession = useUnifiedSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedQuizStatus, setHasCheckedQuizStatus] = useState(false);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  useEffect(() => {
    const checkQuizCompletion = async () => {
      // Allow both authenticated users and guests to access the quiz
      if (unifiedSession.status === "loading") {
        return;
      }
      
      // Check WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setIsWebGLSupported(false);
      }
      
      // If user is authenticated, check if they've already completed the quiz
      if (unifiedSession.status === "authenticated" && unifiedSession.user) {
        try {
          // Use faster API endpoint to check quiz completion
          const response = await fetch(`/api/user/quiz-status?userId=${unifiedSession.user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.hasCompletedQuiz || data.onboardingCompleted) {
              // User has already completed quiz, redirect to dashboard/proofpoints page
              console.log("User has already completed quiz, redirecting to dashboard");
              router.push("/dashboard");
              return;
            }
          }
        } catch (error) {
          console.error("Error checking quiz completion:", error);
          // Continue to quiz if there's an error
        }
      }
      
      setHasCheckedQuizStatus(true);
      setIsLoading(false);
    };

    checkQuizCompletion();
  }, [unifiedSession.status, unifiedSession.user, router]);

  const handleQuizComplete = (answers: any) => {
    console.log('Quiz completed with answers:', answers);
    // Redirect to tree page
    router.push('/tree');
  };

  if (isLoading || !hasCheckedQuizStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isWebGLSupported) {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
        <QuizSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
        <WorldTree3DQuiz onComplete={handleQuizComplete} />
    </div>
  );
} 