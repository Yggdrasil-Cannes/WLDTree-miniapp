"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TREETokenBalance } from '@/app/components/TREETokenBalance';
import { useUnifiedSession } from '@/hooks/useUnifiedSession';
import { TabBar } from "@/components/navigation/TabBar";

export default function DashboardPage() {
  const router = useRouter();
  const unifiedSession = useUnifiedSession();
  const [proofPoints, setProofPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    if (unifiedSession.status === 'loading') {
      return;
    }

    if (unifiedSession.status === 'unauthenticated') {
      router.push('/');
      return;
    }

    // Mock proof points for demo
    setProofPoints(150);
    setLoading(false);
  }, [unifiedSession.status, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {unifiedSession.user?.name || 'Explorer'}!
          </h1>
          <p className="text-gray-600">
            Your WorldTree journey continues
          </p>
        </div>

        {/* Proof Points Display */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Heritage Points</h2>
            <div className="text-3xl font-bold text-green-600">{proofPoints}</div>
            <p className="text-gray-600">Points earned from your genealogy journey</p>
          </div>
        </div>

        {/* TREE Token Section */}
        <div className="mb-8">
          <TREETokenBalance />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/tree')}
              className="p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <div className="text-2xl mb-2">🌳</div>
              <div className="font-medium">View Tree</div>
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="p-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium">Settings</div>
            </button>
          </div>
        </div>
      </div>
      <TabBar className="fixed bottom-0 left-0 right-0 z-50" />
    </div>
  );
} 