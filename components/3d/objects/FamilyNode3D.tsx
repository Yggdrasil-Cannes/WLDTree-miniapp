'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Text, Ring } from '@react-three/drei'
import * as THREE from 'three'

interface FamilyNode3DProps {
  node: {
    id: string
    name: string
    generation: number
    gender?: 'male' | 'female'
    birth?: string
    death?: string
    position: [number, number, number]
  }
  isSelected: boolean
  isHovered: boolean
  onClick: () => void
  onHover: () => void
  onUnhover: () => void
}

export default function FamilyNode3D({
  node,
  isSelected,
  isHovered,
  onClick,
  onHover,
  onUnhover
}: FamilyNode3DProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  const getNodeColor = () => {
    if (isSelected) return '#ffffff'
    if (isHovered) return '#00ff88'
    return node.gender === 'female' ? '#ff6b9d' : '#4ecdc4'
  }

  const getEmissiveIntensity = () => {
    if (isSelected) return 0.8
    if (isHovered) return 0.4
    return 0.2
  }

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = 
        node.position[1] + Math.sin(state.clock.elapsedTime * 2 + node.position[0]) * 0.3
      
      // Pulsing effect when selected
      if (isSelected) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.2
        meshRef.current.scale.setScalar(pulse)
      } else {
        meshRef.current.scale.setScalar(1)
      }
    }

    // Rotating selection ring
    if (ringRef.current && (isSelected || isHovered)) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 2
    }
  })

  return (
    <group position={node.position}>
      {/* Main node sphere */}
      <Sphere
        ref={meshRef}
        args={[1, 32, 32]}
        onClick={onClick}
        onPointerOver={onHover}
        onPointerOut={onUnhover}
      >
        <meshStandardMaterial 
          color={getNodeColor()}
          emissive={getNodeColor()}
          emissiveIntensity={getEmissiveIntensity()}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* Selection/Hover ring */}
      {(isSelected || isHovered) && (
        <Ring
          ref={ringRef}
          args={[1.5, 2, 32]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial 
            color={getNodeColor()}
            transparent
            opacity={isSelected ? 0.8 : 0.4}
          />
        </Ring>
      )}

      {/* Blockchain-style wireframe */}
      {isHovered && (
        <Sphere args={[1.2, 8, 8]}>
          <meshBasicMaterial 
            color={getNodeColor()}
            wireframe
            transparent
            opacity={0.3}
          />
        </Sphere>
      )}

      {/* Name label */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={6}
      >
        {node.name}
      </Text>

      {/* Generation indicator */}
      <Text
        position={[0, -3.2, 0]}
        fontSize={0.4}
        color="#888888"
        anchorX="center"
        anchorY="middle"
      >
        Gen {node.generation}
      </Text>

      {/* Birth/Death dates */}
      {(node.birth || node.death) && (
        <Text
          position={[0, -3.8, 0]}
          fontSize={0.3}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          {node.birth || '?'} - {node.death || 'Present'}
        </Text>
      )}
    </group>
  )
} 