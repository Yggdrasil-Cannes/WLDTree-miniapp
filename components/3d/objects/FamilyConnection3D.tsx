'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cylinder, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface FamilyConnection3DProps {
  from: [number, number, number]
  to: [number, number, number]
  type: 'parent' | 'spouse' | 'child'
  animated?: boolean
}

export default function FamilyConnection3D({
  from,
  to,
  type,
  animated = false
}: FamilyConnection3DProps) {
  const connectionRef = useRef<THREE.Group>(null)
  const particleRefs = useRef<THREE.Mesh[]>([])
  
  const connectionData = useMemo(() => {
    const distance = Math.sqrt(
      Math.pow(to[0] - from[0], 2) +
      Math.pow(to[1] - from[1], 2) +
      Math.pow(to[2] - from[2], 2)
    )
    
    const midpoint: [number, number, number] = [
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2,
      (from[2] + to[2]) / 2
    ]
    
    const rotationY = Math.atan2(to[2] - from[2], to[0] - from[0])
    const rotationZ = Math.atan2(to[1] - from[1], Math.sqrt(Math.pow(to[0] - from[0], 2) + Math.pow(to[2] - from[2], 2)))
    
    return {
      distance,
      midpoint,
      rotationY,
      rotationZ
    }
  }, [from, to])

  const getConnectionColor = () => {
    switch (type) {
      case 'parent': return '#00ff88'
      case 'spouse': return '#ff6b9d'
      case 'child': return '#4ecdc4'
      default: return '#ffffff'
    }
  }

  const getConnectionRadius = () => {
    switch (type) {
      case 'parent': return 0.08
      case 'spouse': return 0.12
      case 'child': return 0.06
      default: return 0.05
    }
  }

  useFrame((state) => {
    if (animated && connectionRef.current) {
      // Subtle pulsing animation
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      connectionRef.current.scale.setScalar(pulse)
    }

    // Animate particles along the connection
    if (animated) {
      particleRefs.current.forEach((particle, index) => {
        if (particle) {
          const progress = (state.clock.elapsedTime * 0.5 + index * 0.3) % 1
          const pos = [
            from[0] + (to[0] - from[0]) * progress,
            from[1] + (to[1] - from[1]) * progress,
            from[2] + (to[2] - from[2]) * progress
          ]
          particle.position.set(pos[0], pos[1], pos[2])
        }
      })
    }
  })

  return (
    <group ref={connectionRef}>
      {/* Main connection line */}
      <Cylinder
        position={connectionData.midpoint}
        args={[getConnectionRadius(), getConnectionRadius(), connectionData.distance]}
        rotation={[0, connectionData.rotationY, connectionData.rotationZ]}
      >
        <meshStandardMaterial 
          color={getConnectionColor()}
          emissive={getConnectionColor()}
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </Cylinder>

      {/* Animated particles for active connections */}
      {animated && (
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <Sphere
              key={index}
              ref={(ref) => {
                if (ref) particleRefs.current[index] = ref
              }}
              args={[0.1, 8, 8]}
              position={from}
            >
              <meshStandardMaterial 
                color={getConnectionColor()}
                emissive={getConnectionColor()}
                emissiveIntensity={0.8}
                transparent
                opacity={0.6}
              />
            </Sphere>
          ))}
        </>
      )}

      {/* Connection type indicator */}
      {type === 'spouse' && (
        <Sphere
          position={connectionData.midpoint}
          args={[0.15, 16, 16]}
        >
          <meshStandardMaterial 
            color="#ff6b9d"
            emissive="#ff6b9d"
            emissiveIntensity={0.4}
            transparent
            opacity={0.7}
          />
        </Sphere>
      )}
    </group>
  )
} 