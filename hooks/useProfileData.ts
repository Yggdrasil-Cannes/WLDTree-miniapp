import { useState, useEffect } from 'react';

interface QuizProfile {
  userInterests?: string[];
  userLocation?: string;
  userAge?: string;
  preferredPlatforms?: string[];
  aiTasks?: string[];
  aiComfortLevel?: string;
  aiBudget?: string;
}

interface UserStats {
  totalSessions: number;
  totalBadges: number;
  quizCompleted: boolean;
  joinDate: string;
  lastActive: string;
}

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  bio: string | null;
  isVerified: boolean;
  worldcoinId: string | null;
  region: string | null;
  interests: string[];
  experienceLevel: string;
  proofPoints: number;
  level: number;
  preferences: {
    language?: string;
    socials?: {
      twitter?: string;
      linkedin?: string;
    };
  } | null;
  quizProfile: QuizProfile;
  profileCompletion: number;
  stats: UserStats;
}

export function useProfileData(userId: string | undefined) {
  const [data, setData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Try to get from cache first
        const cacheKey = `profile_${userId}`;
        const cached = sessionStorage.getItem(cacheKey);
        
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          // Use cached data if it's less than 1 minute old
          if (Date.now() - timestamp < 60000) {
            if (isMounted) {
              setData(cachedData);
              setIsLoading(false);
            }
            return;
          }
        }

        // Fetch fresh data with minimal API
        const response = await fetch(`/api/user/${userId}?minimal=true`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const userData = await response.json();
        
        if (isMounted) {
          setData(userData);
          // Cache the data
          sessionStorage.setItem(cacheKey, JSON.stringify({
            data: userData,
            timestamp: Date.now()
          }));
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load profile data';
          setError(errorMessage);
          console.error('Error fetching profile data:', err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const refetch = async () => {
    if (!userId) return;
    
    // Clear cache
    const cacheKey = `profile_${userId}`;
    sessionStorage.removeItem(cacheKey);
    
    // Refetch
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/user/${userId}?minimal=true`);
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status}`);
      }

      const userData = await response.json();
      setData(userData);
      
      // Cache the fresh data
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: userData,
        timestamp: Date.now()
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile data';
      setError(errorMessage);
      console.error('Error refetching profile data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch
  };
} 