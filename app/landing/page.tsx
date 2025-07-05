'use client';

import { LandingPage } from "@/components/LandingPage";

export default function Landing() {
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