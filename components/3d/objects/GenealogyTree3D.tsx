'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import FamilyNode3D from './FamilyNode3D'
import FamilyConnection3D from './FamilyConnection3D'
import { processGenealogyData3D } from '../../../lib/genealogy/dataProcessor3D'

interface GenealogyTree3DProps {
  data: any[]
  selectedMember?: string
  onMemberSelect: (id: string) => void
  scale?: number
  position?: [number, number, number]
}

export default function GenealogyTree3D({ 
  data, 
  selectedMember, 
  onMemberSelect,
  scale = 1,
  position = [0, 0, 0]
}: GenealogyTree3DProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hoveredMember, setHoveredMember] = useState<string | null>(null)

  const { nodes, connections } = useMemo(() => {
    return processGenealogyData3D(data)
  }, [data])

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02
      groupRef.current.scale.setScalar(scale + breathe)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Render connections first (behind nodes) */}
      {connections.map((connection, index) => (
        <FamilyConnection3D
          key={`connection-${index}`}
          from={connection.from}
          to={connection.to}
          type={connection.type}
          animated={true}
        />
      ))}

      {/* Render family nodes */}
      {nodes.map((node) => (
        <FamilyNode3D
          key={node.id}
          node={node}
          isSelected={selectedMember === node.id}
          isHovered={hoveredMember === node.id}
          onClick={() => onMemberSelect(node.id)}
          onHover={() => setHoveredMember(node.id)}
          onUnhover={() => setHoveredMember(null)}
        />
      ))}
    </group>
  )
} 