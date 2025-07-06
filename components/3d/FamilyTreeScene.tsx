'use client'

import React, { useState, useEffect } from 'react'
import { useWorldTree } from '../../contexts/WorldTreeContext'

const FamilyTreeScene = () => {
  const { state, actions } = useWorldTree();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  console.log('🌳 FamilyTreeScene: Loading tree scene with', state.familyData.length, 'members');

  const handleNodeClick = (nodeId: string) => {
    console.log('🌳 FamilyTreeScene: Node clicked:', nodeId);
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const handleAddMember = (parentId: string, relationship: 'parent' | 'child' | 'spouse') => {
    console.log('🌳 FamilyTreeScene: Add member clicked for', parentId, 'as', relationship);
    
    const newMember = {
      name: 'New Member',
      gender: undefined,
      birth: new Date().getFullYear().toString(),
      location: 'Added via Tree',
      occupation: 'Family Member',
      generation: 1,
      parents: relationship === 'child' ? [parentId] : [],
      children: []
    };
    
    actions.addFamilyMember(newMember);
  };

  if (!state.familyData.length) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Your Family Tree</h2>
          <p className="text-slate-300 mb-4">No family members found</p>
          <button
            onClick={() => handleAddMember('genesis', 'child')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add First Member
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Tree Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)`,
        }} />
      </div>

      {/* Header */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="bg-black/60 backdrop-blur-md border border-slate-700 text-white px-6 py-3 rounded-2xl text-center shadow-2xl">
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Your Family Tree
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {state.familyData.length} family members • Click nodes to add relatives
          </p>
        </div>
      </div>

      {/* Tree Container */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="relative w-full max-w-4xl h-full">
          {/* Tree Nodes */}
          <div className="relative w-full h-full">
            {state.familyData.map((member, index) => {
              // Calculate position based on generation and index
              const generation = member.generation || 0;
              const y = 20 + generation * 120; // Vertical spacing
              const x = 50 + (index % 3) * 200 - (generation * 50); // Horizontal spacing with generation offset
              
              return (
                <div
                  key={member.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                    selectedNode === member.id ? 'scale-110' : 'hover:scale-105'
                  }`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() => handleNodeClick(member.id)}
                >
                  {/* Node */}
                  <div className={`relative w-16 h-16 rounded-full border-4 transition-all duration-300 ${
                    member.gender === 'male' ? 'border-blue-500 bg-blue-500/20' : 
                    member.gender === 'female' ? 'border-pink-500 bg-pink-500/20' : 
                    'border-yellow-500 bg-yellow-500/20'
                  } ${selectedNode === member.id ? 'shadow-lg shadow-green-400/50' : ''}`}>
                    
                    {/* Node content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Pulsing ring for selected node */}
                    {selectedNode === member.id && (
                      <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping"></div>
        )}
      </div>

                  {/* Node label */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-center">
                    <div className="bg-black/80 backdrop-blur-md border border-slate-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                      {member.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Gen {generation}
      </div>
    </div>
                  
                  {/* Connection lines to children */}
                  {member.children && member.children.length > 0 && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-px h-8 bg-green-400/60"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Node Actions */}
      {selectedNode && (
        <div className="absolute top-20 left-6 bg-black/60 backdrop-blur-md border border-slate-700 text-white p-4 rounded-2xl z-20">
          <h3 className="font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Add Relative to {state.familyData.find(m => m.id === selectedNode)?.name}
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => handleAddMember(selectedNode, 'child')}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Add Child
            </button>
            <button
              onClick={() => handleAddMember(selectedNode, 'parent')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Add Parent
            </button>
            <button
              onClick={() => handleAddMember(selectedNode, 'spouse')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Add Spouse
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Panel */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2 space-y-3 z-20">
        <ActionButton icon="+" color="green" label="Add Member" onClick={() => handleAddMember('genesis', 'child')} />
        <ActionButton icon="🔍" color="blue" label="Search" onClick={() => console.log('Search clicked')} />
        <ActionButton icon="↗" color="purple" label="Share" onClick={() => console.log('Share clicked')} />
        <ActionButton icon="📋" color="orange" label="Export" onClick={() => console.log('Export clicked')} />
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md border border-slate-700 text-white p-4 rounded-2xl text-sm z-20">
        <h3 className="font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Tree Legend
        </h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Male Family Members</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <span>Female Family Members</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Unknown Gender</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Family Connections</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md border border-slate-700 text-white p-4 rounded-2xl text-sm z-20 max-w-xs">
        <h3 className="font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          How to Use
        </h3>
        <div className="space-y-1 text-xs text-slate-300">
          <div>• Click any node to select it</div>
          <div>• Use the action panel to add relatives</div>
          <div>• Nodes are positioned by generation</div>
          <div>• Green lines show family connections</div>
        </div>
      </div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ 
  icon, 
  color, 
  label, 
  onClick 
}: { 
  icon: string; 
  color: 'green' | 'blue' | 'purple' | 'orange'; 
  label: string; 
  onClick: () => void 
}) => {
  const colorClasses = {
    green: 'bg-green-500 hover:bg-green-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600'
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group`}
      title={label}
    >
      <span className="text-lg">{icon}</span>
      <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </div>
    </button>
  );
};

export default FamilyTreeScene; 