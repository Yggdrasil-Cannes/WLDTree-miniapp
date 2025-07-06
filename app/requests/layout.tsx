'use client';

import { TabBar } from "@/components/navigation/TabBar";
import { WorldTreeProvider } from "../../contexts/WorldTreeContext";

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorldTreeProvider>
      <div className="relative min-h-screen">
        {children}
        <TabBar className="fixed bottom-0 left-0 right-0 z-50" />
      </div>
    </WorldTreeProvider>
  );
} 