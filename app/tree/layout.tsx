'use client';

import { TabBar } from "@/components/navigation/TabBar";

export default function TreeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {children}
      <TabBar className="fixed bottom-0 left-0 right-0 z-50" />
    </div>
  );
} 