'use client'

import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment
} from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { Suspense } from 'react'
import { Vector2 } from 'three'
import GenealogyTree3D from '../objects/GenealogyTree3D'
import DNAHelix from '../objects/DNAHelix'
import ParticleField from '../effects/ParticleField'
import LoadingSpinner from '../effects/LoadingSpinner'

interface MainSceneProps {
  genealogyData: any[]
  selectedMember?: string
  onMemberSelect: (id: string) => void
  viewMode: '3d' | 'dna' | 'hybrid'
}

export default function MainScene({ 
  genealogyData, 
  selectedMember, 
  onMemberSelect,
  viewMode 
}: MainSceneProps) {
  return (
    <div className="w-full h-screen relative">
      <Canvas
        camera={{ 
          position: [0, 15, 25], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
      >
        {/* Lighting Setup */}
        <ambientLight intensity={0.3} color="#4a90e2" />
        <pointLight position={[20, 20, 20]} intensity={1} color="#ffffff" />
        <pointLight position={[-20, -20, 10]} intensity={0.5} color="#00ff88" />
        <spotLight 
          position={[0, 30, 0]} 
          angle={0.3} 
          penumbra={1} 
          intensity={0.8}
          color="#00ff88"
        />

        {/* Environment */}
        <Environment preset="night" />
        
        {/* Background Particle Field */}
        <ParticleField count={1000} />

        {/* Camera Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={100}
          minDistance={5}
          maxPolarAngle={Math.PI * 0.75}
        />

        {/* Main 3D Content */}
        <Suspense fallback={<LoadingSpinner />}>
          {viewMode === '3d' && (
            <GenealogyTree3D 
              data={genealogyData}
              selectedMember={selectedMember}
              onMemberSelect={onMemberSelect}
            />
          )}
          
          {viewMode === 'dna' && (
            <DNAHelix 
              data={genealogyData}
              selectedMember={selectedMember}
            />
          )}
          
          {viewMode === 'hybrid' && (
            <>
              <GenealogyTree3D 
                data={genealogyData}
                selectedMember={selectedMember}
                onMemberSelect={onMemberSelect}
                scale={0.7}
                position={[-10, 0, 0]}
              />
              <DNAHelix 
                data={genealogyData}
                selectedMember={selectedMember}
                scale={0.5}
                position={[10, 0, 0]}
              />
            </>
          )}
        </Suspense>

        {/* Post-processing Effects */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} intensity={1.5} />
          <ChromaticAberration 
            offset={new Vector2(0.002, 0.002)} 
            radialModulation={false} 
            modulationOffset={0} 
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
} 