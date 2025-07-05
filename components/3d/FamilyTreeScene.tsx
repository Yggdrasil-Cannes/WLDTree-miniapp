'use client'

import React, { useState, useRef, useEffect } from 'react'

interface Person {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  generation: number;
  children: string[];
}

const FamilyTreeScene = () => {
  const [familyData, setFamilyData] = useState<Person[]>([
    { id: 'user', name: 'You', x: 0, y: 0, z: 0, generation: 0, children: [] }
  ])

  console.log('🌳 FamilyTreeScene: Component loaded with', familyData.length, 'family members')
  console.log('🌳 FamilyTreeScene: Multi-generational tree data:', familyData.map(p => `${p.name} (Gen ${p.generation})`))

  const handleAddMember = (parentId: string, relationship: 'parent' | 'child' | 'spouse') => {
    console.log('🌳 FamilyTreeScene: Add member clicked for', parentId, 'as', relationship)
    
    const parent = familyData.find(p => p.id === parentId)
    if (!parent) return
    
    const newId = `member_${Date.now()}`
    let newX = parent.x
    let newY = parent.y
    let newZ = parent.z
    let newGeneration = parent.generation
    
    // Position new member based on relationship
    if (relationship === 'parent') {
      newY = parent.y + 120 // Above parent
      newGeneration = parent.generation - 1
    } else if (relationship === 'child') {
      newY = parent.y - 120 // Below parent
      newGeneration = parent.generation + 1
    } else if (relationship === 'spouse') {
      newX = parent.x + 150 // Beside parent
    }
    
    const newMember: Person = {
      id: newId,
      name: 'New Member',
      x: newX,
      y: newY,
      z: newZ,
      generation: newGeneration,
      children: []
    }
    
    // Update parent's children if adding a child
    if (relationship === 'child') {
      const updatedParent = { ...parent, children: [...parent.children, newId] }
      setFamilyData(prev => prev.map(p => p.id === parentId ? updatedParent : p))
    }
    
    setFamilyData(prev => [...prev, newMember])
  }

  const handleSearch = () => {
    console.log('🌳 FamilyTreeScene: Search clicked')
  }

  const handleShare = () => {
    console.log('🌳 FamilyTreeScene: Share clicked')
  }

  const handleExport = () => {
    console.log('🌳 FamilyTreeScene: Export clicked')
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Instructions */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
          <p>Double-click any node to add family members</p>
          <p className="text-gray-400 text-xs">↑ Parent | ↓ Child | ↔ Spouse</p>
        </div>
      </div>
      {/* 3D CSS Transform Container */}
      <div 
        className="absolute inset-0"
        style={{
          perspective: '1000px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        {/* Family Tree Nodes */}
        {familyData.map((person) => (
          <FamilyNode3D
            key={person.id}
            person={person}
            onClick={() => console.log('Selected:', person.name)}
            onAddMember={handleAddMember}
          />
        ))}

        {/* Family Connections */}
        {familyData.map((person) => 
          person.children?.map((childId) => {
            const child = familyData.find(p => p.id === childId)
            if (!child) return null
            
            return (
              <FamilyConnection3D
                key={`${person.id}-${childId}`}
                from={person}
                to={child}
              />
            )
          })
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute left-6 top-1/2 transform -translate-y-1/2 space-y-4 z-20">
        <ActionButton icon="+" color="green" label="Add Member" onClick={() => handleAddMember('user', 'child')} />
        <ActionButton icon="🔍" color="blue" label="Search" onClick={handleSearch} />
        <ActionButton icon="↗" color="purple" label="Share" onClick={handleShare} />
        <ActionButton icon="📋" color="orange" label="Export" onClick={handleExport} />
      </div>
    </div>
  )
}

// Individual Family Node Component
const FamilyNode3D = ({ person, onClick, onAddMember }: { 
  person: Person; 
  onClick: () => void;
  onAddMember: (parentId: string, relationship: 'parent' | 'child' | 'spouse') => void;
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showAddButtons, setShowAddButtons] = useState(false)
  
  return (
    <div
      className="absolute cursor-pointer transition-all duration-300 group"
      style={{
        left: '50%',
        top: '50%',
        transform: `
          translate(-50%, -50%) 
          translate3d(${person.x}px, ${person.y}px, ${person.z}px)
          ${isHovered ? 'scale(1.1)' : 'scale(1)'}
        `,
        transformStyle: 'preserve-3d'
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={() => setShowAddButtons(!showAddButtons)}
    >
      {/* Node Sphere */}
      <div 
        className={`
          w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-sm
          ${person.generation === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 
            person.generation === 1 ? 'bg-gradient-to-br from-green-400 to-green-600' :
            'bg-gradient-to-br from-blue-400 to-blue-600'}
          shadow-lg border-2 border-white
          ${isHovered ? 'shadow-2xl' : ''}
        `}
        style={{
          boxShadow: isHovered ? '0 0 30px rgba(0, 255, 136, 0.6)' : '0 4px 8px rgba(0,0,0,0.3)'
        }}
      >
        {person.name.split(' ').map((n: string) => n[0]).join('')}
      </div>

      {/* Name Label */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
          {person.name}
        </div>
        <div className="text-gray-400 text-xs">Gen {person.generation}</div>
      </div>

      {/* Add Member Buttons */}
      {showAddButtons && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 flex gap-2">
          <button
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200 hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onAddMember(person.id, 'parent');
              setShowAddButtons(false);
            }}
            title="Add Parent"
          >
            ↑
          </button>
          <button
            className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200 hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onAddMember(person.id, 'child');
              setShowAddButtons(false);
            }}
            title="Add Child"
          >
            ↓
          </button>
          <button
            className="w-8 h-8 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-xs font-bold flex items-center justify-center transition-all duration-200 hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              onAddMember(person.id, 'spouse');
              setShowAddButtons(false);
            }}
            title="Add Spouse"
          >
            ↔
          </button>
        </div>
      )}

      {/* Blockchain Glow Effect */}
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            background: 'radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%)',
            transform: 'scale(1.5)'
          }}
        />
      )}
    </div>
  )
}

// Connection Lines Between Family Members
const FamilyConnection3D = ({ from, to }: { from: Person; to: Person }) => {
  const lineStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)),
    height: '2px',
    background: 'linear-gradient(90deg, #00ff88, #4ecdc4)',
    transformOrigin: '0 50%',
    transform: `
      translate(-50%, -50%)
      translate3d(${from.x}px, ${from.y}px, ${from.z}px)
      rotate(${Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI}deg)
    `,
    boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
    zIndex: 1
  }

  return <div style={lineStyle} />
}

// Action Button Component
const ActionButton = ({ icon, color, label, onClick }: { 
  icon: string; 
  color: 'green' | 'blue' | 'purple' | 'orange'; 
  label: string; 
  onClick: () => void 
}) => {
  const colorClasses = {
    green: 'bg-green-500 hover:bg-green-600 shadow-green-500/50',
    blue: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/50',
    purple: 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/50',
    orange: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/50'
  }

  return (
    <button
      className={`
        w-14 h-14 rounded-full ${colorClasses[color]} 
        text-white font-bold text-xl flex items-center justify-center
        transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl
        backdrop-blur-sm border border-white/20
      `}
      onClick={onClick}
      title={label}
    >
      {icon}
    </button>
  )
}

export default FamilyTreeScene 