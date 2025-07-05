'use client'

import React, { useState, useEffect } from 'react'

interface HelixPoint {
  id: string;
  leftStrand: { x: number; y: number; z: number };
  rightStrand: { x: number; y: number; z: number };
  nucleotide: 'A' | 'T' | 'G' | 'C';
  familyMember: string;
}

const DNAHelixView = () => {
  const [rotation, setRotation] = useState(0)
  
  console.log('🧬 DNAHelixView: Component loaded, starting DNA helix rotation')
  
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360)
    }, 50)
    console.log('🧬 DNAHelixView: Rotation animation started')
    return () => clearInterval(interval)
  }, [])

  // Generate DNA base pairs
  const generateHelixPoints = (): HelixPoint[] => {
    const points: HelixPoint[] = []
    for (let i = 0; i < 20; i++) {
      const y = i * 30 - 300 // Vertical spacing
      const angle = (i * 36) * (Math.PI / 180) // 36 degrees per step
      const radius = 60
      
      // Left strand
      const leftX = Math.cos(angle + rotation * 0.01) * radius
      const leftZ = Math.sin(angle + rotation * 0.01) * radius
      
      // Right strand (opposite)
      const rightX = Math.cos(angle + Math.PI + rotation * 0.01) * radius
      const rightZ = Math.sin(angle + Math.PI + rotation * 0.01) * radius
      
      points.push({
        id: `pair-${i}`,
        leftStrand: { x: leftX, y, z: leftZ },
        rightStrand: { x: rightX, y, z: rightZ },
        nucleotide: ['A', 'T', 'G', 'C'][i % 4] as 'A' | 'T' | 'G' | 'C',
        familyMember: ['Genesis', 'Alice', 'Bob', 'Carol', 'Dave'][i % 5]
      })
    }
    console.log('🧬 DNAHelixView: Generated', points.length, 'DNA base pairs with proper A-T, G-C pairing')
    return points
  }

  const helixPoints = generateHelixPoints()

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <div 
        className="absolute inset-0"
        style={{
          perspective: '800px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        {/* DNA Helix Structure */}
        {helixPoints.map((point, index) => (
          <DNABasePair
            key={point.id}
            point={point}
            index={index}
            rotation={rotation}
          />
        ))}

        {/* Central Axis */}
        <div 
          className="absolute bg-gradient-to-b from-transparent via-green-400 to-transparent opacity-30"
          style={{
            left: '50%',
            top: '10%',
            width: '2px',
            height: '80%',
            transform: 'translateX(-50%)'
          }}
        />
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-6 left-6 text-white">
        <div className="text-sm opacity-70">Step 2 / 6</div>
        <div className="w-32 h-1 bg-gray-700 rounded mt-2">
          <div className="w-1/3 h-full bg-gradient-to-r from-green-400 to-blue-500 rounded" />
        </div>
      </div>
    </div>
  )
}

const DNABasePair = ({ point, index, rotation }: { 
  point: HelixPoint; 
  index: number; 
  rotation: number 
}) => {
  const colors = {
    A: '#ff6b9d', // Adenine - Pink
    T: '#4ecdc4', // Thymine - Cyan  
    G: '#00ff88', // Guanine - Green
    C: '#ffa502'  // Cytosine - Orange
  }

  const getComplementaryBase = (base: 'A' | 'T' | 'G' | 'C'): 'A' | 'T' | 'G' | 'C' => {
    const complementMap = { A: 'T', T: 'A', G: 'C', C: 'G' } as const
    return complementMap[base]
  }

  const complementaryBase = getComplementaryBase(point.nucleotide)

  return (
    <div
      className="absolute"
      style={{
        left: '50%',
        top: '50%',
        transform: `
          translate(-50%, -50%)
          translate3d(0px, ${point.leftStrand.y}px, 0px)
          rotateX(${rotation * 0.5}deg)
        `,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Left Strand Nucleotide */}
      <div
        className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
        style={{
          backgroundColor: colors[point.nucleotide],
          transform: `translate3d(${point.leftStrand.x}px, 0px, ${point.leftStrand.z}px)`,
          boxShadow: `0 0 15px ${colors[point.nucleotide]}60`
        }}
      >
        {point.nucleotide}
      </div>

      {/* Right Strand Nucleotide */}
      <div
        className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
        style={{
          backgroundColor: colors[complementaryBase],
          transform: `translate3d(${point.rightStrand.x}px, 0px, ${point.rightStrand.z}px)`,
          boxShadow: `0 0 15px ${colors[complementaryBase]}60`
        }}
      >
        {complementaryBase}
      </div>

      {/* Connection Line (Base Pair Bond) */}
      <div
        className="absolute h-0.5 bg-gradient-to-r from-white to-white opacity-60"
        style={{
          width: Math.sqrt(
            Math.pow(point.rightStrand.x - point.leftStrand.x, 2) + 
            Math.pow(point.rightStrand.z - point.leftStrand.z, 2)
          ),
          left: point.leftStrand.x,
          top: '50%',
          transform: `translateY(-50%) rotateZ(${Math.atan2(
            point.rightStrand.z - point.leftStrand.z,
            point.rightStrand.x - point.leftStrand.x
          ) * 180 / Math.PI}deg)`,
          transformOrigin: '0 50%'
        }}
      />

      {/* Family Member Label */}
      {index % 4 === 0 && (
        <div 
          className="absolute text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded"
          style={{
            transform: 'translate3d(80px, 0px, 0px)',
            whiteSpace: 'nowrap'
          }}
        >
          {point.familyMember}
        </div>
      )}
    </div>
  )
}

export default DNAHelixView 