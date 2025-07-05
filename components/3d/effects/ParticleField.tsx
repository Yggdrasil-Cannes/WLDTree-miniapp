'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface ParticleFieldProps {
  count?: number
}

export default function ParticleField({ count = 1000 }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    const colorPalette = [
      new THREE.Color('#00ff88'), // Green
      new THREE.Color('#4ecdc4'), // Cyan
      new THREE.Color('#ff6b9d'), // Pink
      new THREE.Color('#ffffff'), // White
      new THREE.Color('#0088ff'), // Blue
    ]
    
    for (let i = 0; i < count; i++) {
      // Random positions in a large sphere
      const radius = Math.random() * 50 + 30
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      // Random colors from palette
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    return { positions, colors }
  }, [count])

  useFrame((state) => {
    if (pointsRef.current) {
      // Slow rotation
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
      
      // Gentle floating
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 2
    }
  })

  return (
    <Points ref={pointsRef} positions={positions} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
} 