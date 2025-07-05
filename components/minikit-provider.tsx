"use client"; // Required for Next.js

import { MiniKit } from "@worldcoin/minikit-js";
import { ReactNode, useEffect } from "react";

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const initializeMiniKit = async () => {
      try {
        // Wait for window to be fully available
        if (typeof window === 'undefined') return;

        console.log("Starting MiniKit initialization...");
        
        // Get app ID from env
        const appId = process.env.NEXT_PUBLIC_WLD_APP_ID;
        if (!appId) {
          throw new Error("App ID not found in environment variables");
        }
        console.log("Using app ID:", appId);

        // Check if already installed
        if (MiniKit.isInstalled()) {
          console.log("MiniKit already installed");
          return;
        }

        // Install MiniKit with app ID
        await MiniKit.install(appId);
        console.log("MiniKit installed successfully");

        // Add event listeners for debugging
        window.addEventListener('minikit:error', (e: any) => {
          console.error('MiniKit error:', e.detail);
        });
        
        window.addEventListener('minikit:ready', () => {
          console.log('MiniKit ready');
        });

      } catch (error) {
        console.error("Error initializing MiniKit:", error);
      }
    };

    initializeMiniKit();

    // Cleanup listeners
    return () => {
      window.removeEventListener('minikit:error', () => {});
      window.removeEventListener('minikit:ready', () => {});
    };
  }, []);

  return <>{children}</>;
}
