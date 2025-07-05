'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile, FamilyTree, WorldTreeSession, WorldTreeResponse, DNAMatch, FamilyTreeAnalysis } from '../types/agent';

export function useWorldTree(userId: string) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [familyTrees, setFamilyTrees] = useState<FamilyTree[]>([]);
  const [currentSession, setCurrentSession] = useState<WorldTreeSession | null>(null);
  const [activeDNAMatches, setActiveDNAMatches] = useState<DNAMatch[]>([]);
  const [treeAnalysis, setTreeAnalysis] = useState<FamilyTreeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user profile and family trees
  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadFamilyTrees();
      loadActiveDNAMatches();
    }
  }, [userId]);

  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const loadFamilyTrees = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/${userId}/family-trees`);
      const data = await response.json();
      
      if (data.success) {
        setFamilyTrees(data.trees);
      }
    } catch (error) {
      console.error('Error loading family trees:', error);
      setError('Failed to load family trees');
    }
  }, [userId]);

  const loadActiveDNAMatches = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/${userId}/dna-matches`);
      const data = await response.json();
      
      if (data.success) {
        setActiveDNAMatches(data.matches);
      }
    } catch (error) {
      console.error('Error loading DNA matches:', error);
      setError('Failed to load DNA matches');
    }
  }, [userId]);

  const startTreeAnalysis = useCallback(async (treeId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/genealogy/analyze-tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          treeId,
          type: 'tree_analysis'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentSession(data.session);
        setTreeAnalysis(data.analysis);
        return data.session;
      } else {
        throw new Error(data.error || 'Failed to start tree analysis');
      }
    } catch (error) {
      console.error('Error starting tree analysis:', error);
      setError('Failed to start tree analysis');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const processDNAUpload = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('dnaFile', file);
      formData.append('userId', userId);

      const response = await fetch('/api/genealogy/upload-dna', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentSession(data.session);
        loadActiveDNAMatches(); // Refresh matches after upload
        return data.session;
      } else {
        throw new Error(data.error || 'Failed to upload DNA data');
      }
    } catch (error) {
      console.error('Error uploading DNA data:', error);
      setError('Failed to upload DNA data');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadActiveDNAMatches]);

  const processGenealogyChat = useCallback(async (message: string): Promise<WorldTreeResponse> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/genealogy/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message,
          sessionId: currentSession?.id
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.response;
      } else {
        throw new Error(data.error || 'Failed to process genealogy chat');
      }
    } catch (error) {
      console.error('Error in genealogy chat:', error);
      setError('Failed to process genealogy chat');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentSession]);

  const createFamilyTree = useCallback(async (name: string, rootPersonName: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/genealogy/create-tree', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          name,
          rootPersonName
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFamilyTrees(prev => [...prev, data.tree]);
        return data.tree;
      } else {
        throw new Error(data.error || 'Failed to create family tree');
      }
    } catch (error) {
      console.error('Error creating family tree:', error);
      setError('Failed to create family tree');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const updateFamilyMember = useCallback(async (treeId: string, memberId: string, updates: any) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/genealogy/update-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          treeId,
          memberId,
          updates
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        loadFamilyTrees(); // Refresh trees after update
        return data.member;
      } else {
        throw new Error(data.error || 'Failed to update family member');
      }
    } catch (error) {
      console.error('Error updating family member:', error);
      setError('Failed to update family member');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, loadFamilyTrees]);

  const searchHistoricalRecords = useCallback(async (memberName: string, birthYear?: number, location?: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/genealogy/search-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          memberName,
          birthYear,
          location
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.records;
      } else {
        throw new Error(data.error || 'Failed to search historical records');
      }
    } catch (error) {
      console.error('Error searching historical records:', error);
      setError('Failed to search historical records');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSession = useCallback(() => {
    setCurrentSession(null);
    setTreeAnalysis(null);
  }, []);

  return {
    userProfile,
    familyTrees,
    currentSession,
    activeDNAMatches,
    treeAnalysis,
    isLoading,
    error,
    
    // Actions
    startTreeAnalysis,
    processDNAUpload,
    processGenealogyChat,
    createFamilyTree,
    updateFamilyMember,
    searchHistoricalRecords,
    clearError,
    clearSession,
    
    // Refresh functions
    loadUserProfile,
    loadFamilyTrees,
    loadActiveDNAMatches
  };
} 