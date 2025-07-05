"use client";

import dynamic from 'next/dynamic';

// Dynamic import for 3D chat to avoid SSR issues
const WorldTreeChat = dynamic(
  () => import('@/components/Chat/WorldTreeChat'),
  { ssr: false }
);

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-black">
      <WorldTreeChat />
    </div>
  );
} 