'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Torus, Text } from '@react-three/drei'
import * as THREE from 'three'

export default function LoadingSpinner() {
  const spinnerRef = useRef<THREE.Mesh>(null)
  const outerRingRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (spinnerRef.current) {
      spinnerRef.current.rotation.x = state.clock.elapsedTime * 2
      spinnerRef.current.rotation.z = state.clock.elapsedTime * 1.5
    }
    
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = state.clock.elapsedTime * -1
    }
  })

  return (
    <group>
      {/* Main spinner */}
      <Torus
        ref={spinnerRef}
        args={[1, 0.3, 8, 16]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.5}
          wireframe
        />
      </Torus>

      {/* Outer ring */}
      <Torus
        ref={outerRingRef}
        args={[2, 0.1, 8, 32]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#4ecdc4"
          emissive="#4ecdc4"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </Torus>

      {/* Loading text */}
      <Text
        position={[0, -3, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Loading Family Tree...
      </Text>
    </group>
  )
} 