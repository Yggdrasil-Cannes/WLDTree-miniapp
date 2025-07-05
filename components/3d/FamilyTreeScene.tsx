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
  const [familyData] = useState<Person[]>([
    { id: 'genesis', name: 'Genesis Block', x: 0, y: 0, z: 0, generation: 0, children: ['child1', 'child2'] },
    { id: 'child1', name: 'Alice Chain', x: -150, y: -120, z: 20, generation: 1, children: ['grandchild1'] },
    { id: 'child2', name: 'Bob Block', x: 150, y: -120, z: -20, generation: 1, children: ['grandchild2'] },
    { id: 'grandchild1', name: 'Carol Crypto', x: -150, y: -240, z: 40, generation: 2, children: [] },
    { id: 'grandchild2', name: 'Dave DeFi', x: 150, y: -240, z: -40, generation: 2, children: [] }
  ])

  console.log('🌳 FamilyTreeScene: Component loaded with', familyData.length, 'family members')
  console.log('🌳 FamilyTreeScene: Multi-generational tree data:', familyData.map(p => `${p.name} (Gen ${p.generation})`))

  const handleAddMember = () => {
    console.log('🌳 FamilyTreeScene: Add member clicked')
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
        <ActionButton icon="+" color="green" label="Add Member" onClick={handleAddMember} />
        <ActionButton icon="🔍" color="blue" label="Search" onClick={handleSearch} />
        <ActionButton icon="↗" color="purple" label="Share" onClick={handleShare} />
        <ActionButton icon="📋" color="orange" label="Export" onClick={handleExport} />
      </div>
    </div>
  )
}

// Individual Family Node Component
const FamilyNode3D = ({ person, onClick }: { person: Person; onClick: () => void }) => {
  const [isHovered, setIsHovered] = useState(false)
  
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