'use client';

import dynamic from "next/dynamic";
import { ReactNode } from "react";

// Dynamically import components that need client-side features
const MiniKitProvider = dynamic(() => import("@/components/minikit-provider"), {
  ssr: false,
});

const NextAuthProvider = dynamic(() => import("@/components/next-auth-provider"), {
  ssr: false,
});

const ErudaProvider = dynamic(
  () => import("../components/Eruda").then((c) => c.ErudaProvider),
  { ssr: false }
);

const ErrorBoundary = dynamic(
  () => import("@/components/error-boundary").then(mod => mod.ErrorBoundary),
  { ssr: false }
);

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <NextAuthProvider>
        <ErudaProvider>
          <MiniKitProvider>
            {children}
          </MiniKitProvider>
        </ErudaProvider>
      </NextAuthProvider>
    </ErrorBoundary>
  );
} 