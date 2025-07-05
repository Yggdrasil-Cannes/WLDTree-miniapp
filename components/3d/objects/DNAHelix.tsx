'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Cylinder, Text } from '@react-three/drei'
import * as THREE from 'three'

interface DNAHelixProps {
  data: any[]
  selectedMember?: string
  scale?: number
  position?: [number, number, number]
}

export default function DNAHelix({ 
  data, 
  selectedMember, 
  scale = 1, 
  position = [0, 0, 0] 
}: DNAHelixProps) {
  const groupRef = useRef<THREE.Group>(null)
  
  const helixData = useMemo(() => {
    const segments = 50
    const radius = 3
    const height = 20
    const points: Array<{
      position: [number, number, number]
      color: string
      member?: any
      side: 'left' | 'right'
    }> = []

    for (let i = 0; i < segments; i++) {
      const y = (i / segments) * height - height / 2
      const angle = (i / segments) * Math.PI * 8 // 4 full rotations
      
      // Left strand
      const xLeft = Math.cos(angle) * radius
      const zLeft = Math.sin(angle) * radius
      
      // Right strand (opposite side)
      const xRight = Math.cos(angle + Math.PI) * radius
      const zRight = Math.sin(angle + Math.PI) * radius
      
      points.push({
        position: [xLeft, y, zLeft],
        color: '#00ff88',
        member: data[i % data.length],
        side: 'left'
      })
      
      points.push({
        position: [xRight, y, zRight],
        color: '#ff6b9d',
        member: data[(i + Math.floor(data.length / 2)) % data.length],
        side: 'right'
      })
    }
    
    return points
  }, [data])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <group ref={groupRef} scale={scale} position={position}>
      {/* DNA Base Pairs */}
      {helixData.map((point, index) => {
        const isSelected = point.member?.id === selectedMember
        
        return (
          <group key={index}>
            {/* DNA Nucleotide */}
            <Sphere
              position={point.position}
              args={[0.2, 16, 16]}
            >
              <meshStandardMaterial 
                color={isSelected ? '#ffffff' : point.color}
                emissive={point.color}
                emissiveIntensity={isSelected ? 0.5 : 0.2}
                metalness={0.8}
                roughness={0.2}
              />
            </Sphere>

            {/* Connection to center (base pair) */}
            {index % 4 === 0 && index < helixData.length - 1 && (
              <Cylinder
                position={[
                  (point.position[0] + helixData[index + 1].position[0]) / 2,
                  point.position[1],
                  (point.position[2] + helixData[index + 1].position[2]) / 2
                ]}
                args={[0.05, 0.05, 
                  Math.sqrt(
                    Math.pow(point.position[0] - helixData[index + 1].position[0], 2) +
                    Math.pow(point.position[2] - helixData[index + 1].position[2], 2)
                  )
                ]}
                rotation={[
                  0, 
                  Math.atan2(
                    helixData[index + 1].position[2] - point.position[2],
                    helixData[index + 1].position[0] - point.position[0]
                  ), 
                  Math.PI / 2
                ]}
              >
                <meshStandardMaterial 
                  color="#4ecdc4" 
                  emissive="#4ecdc4"
                  emissiveIntensity={0.3}
                />
              </Cylinder>
            )}

            {/* Member name label */}
            {isSelected && (
              <Text
                position={[point.position[0] + 2, point.position[1], point.position[2]]}
                fontSize={0.5}
                color="#ffffff"
                anchorX="left"
                anchorY="middle"
              >
                {point.member?.name || 'Unknown'}
              </Text>
            )}
          </group>
        )
      })}

      {/* Central axis */}
      <Cylinder
        position={[0, 0, 0]}
        args={[0.1, 0.1, 20]}
        rotation={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff"
          emissiveIntensity={0.1}
          transparent
          opacity={0.3}
        />
      </Cylinder>
    </group>
  )
} 