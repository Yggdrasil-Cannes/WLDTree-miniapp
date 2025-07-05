import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

interface UnifiedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isVerified?: boolean;
  worldcoinId?: string;
  authMethod: 'nextauth' | 'minikit';
}

interface UnifiedSession {
  user: UnifiedUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

export function useUnifiedSession(): UnifiedSession {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const [minikitUser, setMinikitUser] = useState<UnifiedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMinikitSession = () => {
      // Only check localStorage on client side
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      try {
      // Check localStorage for World ID MiniKit users
      const storedUserId = localStorage.getItem('worldcoin_user_id');
      const storedUsername = localStorage.getItem('worldcoin_username');
      const worldIdUser = localStorage.getItem('worldIdUser');

        console.log('Checking MiniKit session:', { storedUserId, storedUsername, worldIdUser });

      if (storedUserId) {
          const storedWalletAddress = localStorage.getItem('worldcoin_wallet_address');
        setMinikitUser({
          id: storedUserId,
          name: storedUsername,
          isVerified: true,
            worldcoinId: storedWalletAddress || undefined,
          authMethod: 'minikit'
        });
      } else if (worldIdUser) {
        try {
          const userData = JSON.parse(worldIdUser);
          setMinikitUser({
            id: userData.id,
            name: userData.name,
            isVerified: userData.isVerified || true,
              worldcoinId: userData.walletAddress || userData.worldcoinId,
            authMethod: 'minikit'
          });
        } catch (error) {
          console.error('Error parsing worldIdUser from localStorage:', error);
        }
        }
      } catch (error) {
        console.error('Error accessing localStorage:', error);
      }
      
      setIsLoading(false);
    };

    if (nextAuthStatus !== 'loading') {
      checkMinikitSession();
    }
  }, [nextAuthStatus]);

  // Return NextAuth session if available
  if (nextAuthSession?.user) {
    return {
      user: {
        id: (nextAuthSession.user as any).id || (nextAuthSession.user as any).sub || 'unknown',
        name: nextAuthSession.user.name,
        email: nextAuthSession.user.email,
        image: nextAuthSession.user.image,
        isVerified: (nextAuthSession.user as any).isVerified || false,
        authMethod: 'nextauth'
      },
      status: 'authenticated'
    };
  }

  // Return MiniKit session if available
  if (minikitUser) {
    return {
      user: minikitUser,
      status: 'authenticated'
    };
  }

  // Return loading or unauthenticated status
  if (nextAuthStatus === 'loading' || isLoading) {
    return {
      user: null,
      status: 'loading'
    };
  }

  return {
    user: null,
    status: 'unauthenticated'
  };
} 