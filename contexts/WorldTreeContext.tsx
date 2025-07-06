'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'

interface FamilyMember {
  id: string
  name: string
  gender?: 'male' | 'female'
  birth?: string
  death?: string
  location?: string
  occupation?: string
  parents?: string[]
  children?: string[]
  spouse?: string
  position?: [number, number, number]
  generation?: number
}

interface WorldTreeState {
  // Connection & Auth
  isConnected: boolean
  isVerified: boolean
  userWorldId?: string
  
  // Family Data
  familyData: FamilyMember[]
  selectedMember: string | null
  viewMode: '3d' | 'dna' | 'hybrid'
  
  // UI State
  loading: boolean
  error: string | null
  showSplash: boolean
}

type WorldTreeAction = 
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_VERIFIED'; payload: { verified: boolean; worldId?: string } }
  | { type: 'SET_FAMILY_DATA'; payload: FamilyMember[] }
  | { type: 'ADD_FAMILY_MEMBER'; payload: FamilyMember }
  | { type: 'SELECT_MEMBER'; payload: string | null }
  | { type: 'SET_VIEW_MODE'; payload: '3d' | 'dna' | 'hybrid' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SHOW_SPLASH'; payload: boolean }

const initialState: WorldTreeState = {
  isConnected: false,
  isVerified: false,
  familyData: [],
  selectedMember: null,
  viewMode: '3d',
  loading: false,
  error: null,
  showSplash: true
}

function worldTreeReducer(state: WorldTreeState, action: WorldTreeAction): WorldTreeState {
  switch (action.type) {
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload }
    case 'SET_VERIFIED':
      return { 
        ...state, 
        isVerified: action.payload.verified,
        userWorldId: action.payload.worldId
      }
    case 'SET_FAMILY_DATA':
      return { ...state, familyData: action.payload }
    case 'ADD_FAMILY_MEMBER':
      return { 
        ...state, 
        familyData: [...state.familyData, action.payload] 
      }
    case 'SELECT_MEMBER':
      return { ...state, selectedMember: action.payload }
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'SET_SHOW_SPLASH':
      return { ...state, showSplash: action.payload }
    default:
      return state
  }
}

const WorldTreeContext = createContext<{
  state: WorldTreeState
  dispatch: React.Dispatch<WorldTreeAction>
  actions: {
    connectWallet: () => Promise<void>
    verifyWorldID: (proof: any) => Promise<void>
    loadFamilyTree: () => Promise<void>
    addFamilyMember: (memberData: Omit<FamilyMember, 'id'>) => Promise<void>
    selectMember: (id: string | null) => void
    setViewMode: (mode: '3d' | 'dna' | 'hybrid') => void
    importFamilyData: (data: any[], type: string) => Promise<void>
  }
} | null>(null)

export function WorldTreeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(worldTreeReducer, initialState)

  // Load sample data on mount
  useEffect(() => {
    const sampleData: FamilyMember[] = [
      {
        id: 'genesis',
        name: 'Genesis Block',
        gender: 'male',
        birth: '1990-01-01',
        generation: 0,
        position: [0, 0, 0],
        children: ['alice', 'bob']
      },
      {
        id: 'alice',
        name: 'Alice Chain',
        gender: 'female',
        birth: '2010-01-01',
        generation: 1,
        position: [-5, -5, 0],
        parents: ['genesis'],
        children: ['carol']
      },
      {
        id: 'bob',
        name: 'Bob Block',
        gender: 'male',
        birth: '2012-01-01',
        generation: 1,
        position: [5, -5, 0],
        parents: ['genesis'],
        children: ['dave']
      },
      {
        id: 'carol',
        name: 'Carol Crypto',
        gender: 'female',
        birth: '2030-01-01',
        generation: 2,
        position: [-5, -10, 0],
        parents: ['alice']
      },
      {
        id: 'dave',
        name: 'Dave Defi',
        gender: 'male',
        birth: '2032-01-01',
        generation: 2,
        position: [5, -10, 0],
        parents: ['bob']
      }
    ]
    
    dispatch({ type: 'SET_FAMILY_DATA', payload: sampleData })
  }, [])

  const actions = {
    connectWallet: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
          dispatch({ type: 'SET_CONNECTED', payload: true })
        } else {
          throw new Error('No wallet found')
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    verifyWorldID: async (proof: any) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        // Process World ID verification
        console.log('World ID verification:', proof)
        dispatch({ type: 'SET_VERIFIED', payload: { verified: true, worldId: proof.nullifier_hash } })
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    loadFamilyTree: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        // Load from blockchain or API
        // For now, using sample data
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    addFamilyMember: async (memberData: Omit<FamilyMember, 'id'>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        const newMemberId = `member-${Date.now()}`;
        const newMember: FamilyMember = {
          ...memberData,
          id: newMemberId,
          generation: (memberData.parents?.length || 0) > 0 ? 1 : 0,
          position: [
            Math.random() * 20 - 10,
            -5 * ((memberData.parents?.length || 0) > 0 ? 1 : 0),
            Math.random() * 10 - 5
          ]
        }
        
        // Update parent's children array if this member has parents
        if (memberData.parents && memberData.parents.length > 0) {
          const updatedFamilyData = state.familyData.map(member => {
            if (memberData.parents?.includes(member.id)) {
              return {
                ...member,
                children: [...(member.children || []), newMemberId]
              };
            }
            return member;
          });
          
          // Add the new member to the updated family data
          const finalFamilyData = [...updatedFamilyData, newMember];
          dispatch({ type: 'SET_FAMILY_DATA', payload: finalFamilyData });
        } else {
          // No parents, just add the member
          dispatch({ type: 'ADD_FAMILY_MEMBER', payload: newMember });
        }
        
        console.log('✅ Added new family member:', newMember.name, 'with ID:', newMemberId);
        console.log('🔗 Updated family data with parent-child relationships');
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },

    selectMember: (id: string | null) => {
      dispatch({ type: 'SELECT_MEMBER', payload: id })
    },

    setViewMode: (mode: '3d' | 'dna' | 'hybrid') => {
      dispatch({ type: 'SET_VIEW_MODE', payload: mode })
    },

    importFamilyData: async (data: any[], type: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        // Process different import types
        console.log('Importing data:', type, data)
        // Transform data and add to family tree
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
  }

  return (
    <WorldTreeContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </WorldTreeContext.Provider>
  )
}

export function useWorldTree() {
  const context = useContext(WorldTreeContext)
  if (!context) {
    throw new Error('useWorldTree must be used within WorldTreeProvider')
  }
  return context
} 