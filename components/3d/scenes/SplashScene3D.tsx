'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface SplashScene3DProps {
  onComplete: () => void
}

function AnimatedTree() {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
      groupRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })

  return (
    <group ref={groupRef}>
      {/* Tree trunk */}
      <Sphere position={[0, -2, 0]} args={[1.5, 8, 8]}>
        <meshStandardMaterial 
          color="#4a5c3a" 
          emissive="#2d3624"
          emissiveIntensity={0.2}
        />
      </Sphere>
      
      {/* Tree branches/leaves */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const x = Math.cos(angle) * 3
        const z = Math.sin(angle) * 3
        const y = Math.random() * 4
        
        return (
          <Sphere key={i} position={[x, y, z]} args={[0.8, 16, 16]}>
            <meshStandardMaterial 
              color="#00ff88" 
              emissive="#00aa55"
              emissiveIntensity={0.3}
            />
          </Sphere>
        )
      })}
      
      {/* Lock symbol */}
      <Sphere position={[0, 0, 0]} args={[1, 16, 16]}>
        <meshStandardMaterial 
          color="#FFD700" 
          emissive="#FFA500"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
    </group>
  )
}

export default function SplashScene3D({ onComplete }: SplashScene3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 15], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ff88" />
      
      <AnimatedTree />
    </Canvas>
  )
} 