'use client'

import React, { useState } from 'react'
import FamilyTreeScene from '../3d/FamilyTreeScene'
import DNAHelixView from '../3d/DNAHelixView'
import FamilyWorldMap from '../map/FamilyWorldMap'
import { useRouter } from 'next/navigation'

// Placeholder Chat View
const ChatView = () => (
  <div className="flex items-center justify-center h-full bg-black text-white">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">WorldTree Chat</h2>
      <p className="text-gray-400">AI-powered family tree assistance</p>
    </div>
  </div>
)

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState('tree')
  const [activeSubTab, setActiveSubTab] = useState('3d') // For tree view: '3d' or 'dna'
  const router = useRouter()

  console.log('🎯 TabNavigation: Component loaded, activeTab:', activeTab, 'activeSubTab:', activeSubTab)

  const handleTabChange = (tab: string) => {
    console.log('🎯 TabNavigation: Switching to tab:', tab)
    setActiveTab(tab)
    
    // Navigate to the appropriate page
    switch (tab) {
      case 'tree':
        router.push('/tree')
        break
      case 'map':
        router.push('/map')
        break
      case 'chat':
        router.push('/chat')
        break
      case 'request':
        router.push('/requests')
        break
      default:
        router.push('/tree')
    }
  }

  const renderTreeContent = () => {
    if (activeSubTab === 'dna') {
      console.log('🎯 TabNavigation: Rendering DNA Helix View')
      return <DNAHelixView />
    }
    console.log('🎯 TabNavigation: Rendering 3D Family Tree Scene')
    return <FamilyTreeScene />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'tree':
        console.log('🎯 TabNavigation: Switching to Tree tab')
        return renderTreeContent()
      case 'map':
        console.log('🎯 TabNavigation: Switching to Map tab')
        return <FamilyWorldMap />
      case 'chat':
        console.log('🎯 TabNavigation: Switching to Chat tab')
        return <ChatView />
      case 'request':
        console.log('🎯 TabNavigation: Switching to Request tab')
        // This will be handled by navigation, but we can show a placeholder
        return (
          <div className="flex items-center justify-center h-full bg-black text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Family Requests</h2>
              <p className="text-gray-400">Navigate to requests page to view connections</p>
            </div>
          </div>
        )
      default:
        return renderTreeContent()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Top Tab Selector (Tree/Map) */}
      <div className="flex items-center justify-center pt-6 pb-4">
        <div className="bg-gray-800 rounded-full p-1 flex">
          <button
            className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'tree' 
                ? 'bg-green-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('tree')}
          >
            🌳 Tree
          </button>
          <button
            className={`px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'map' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('map')}
          >
            🗺️ Map
          </button>
        </div>
      </div>

      {/* Sub-tab for Tree view (3D/DNA) */}
      {activeTab === 'tree' && (
        <div className="flex items-center justify-center pb-4">
          <div className="bg-gray-700 rounded-full p-1 flex">
            <button
              className={`px-4 py-1 rounded-full text-sm transition-all duration-300 ${
                activeSubTab === '3d' 
                  ? 'bg-green-400 text-black' 
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => {
                console.log('🎯 TabNavigation: 3D View sub-tab clicked')
                setActiveSubTab('3d')
              }}
            >
              3D View
            </button>
            <button
              className={`px-4 py-1 rounded-full text-sm transition-all duration-300 ${
                activeSubTab === 'dna' 
                  ? 'bg-green-400 text-black' 
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => {
                console.log('🎯 TabNavigation: DNA Helix sub-tab clicked')
                setActiveSubTab('dna')
              }}
            >
              DNA Helix
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gray-900 border-t border-gray-700 px-6 py-4">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <TabButton 
            icon="🌳" 
            label="Tree" 
            active={activeTab === 'tree'} 
            onClick={() => handleTabChange('tree')}
          />
          <TabButton 
            icon="💬" 
            label="Chat" 
            active={activeTab === 'chat'} 
            onClick={() => handleTabChange('chat')}
          />
          <TabButton 
            icon="🔗" 
            label="Request" 
            active={activeTab === 'request'} 
            onClick={() => handleTabChange('request')}
          />
        </div>
      </div>
    </div>
  )
}

const TabButton = ({ icon, label, active, onClick }: { 
  icon: string; 
  label: string; 
  active: boolean; 
  onClick: () => void 
}) => (
  <button
    className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-green-600 text-white' 
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`}
    onClick={onClick}
  >
    <span className="text-lg mb-1">{icon}</span>
    <span className="text-xs font-medium">{label}</span>
  </button>
)

export default TabNavigation 