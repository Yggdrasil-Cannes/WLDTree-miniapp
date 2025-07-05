'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  Text, 
  Sphere, 
  Cylinder, 
  Html,
  Float,
  Points,
  Line
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { useOnboardingFeedback } from '@/hooks/useOnboardingFeedback'

// Main Onboarding Component
export default function WorldTreeOnboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isWaitingForClick, setIsWaitingForClick] = useState(false)
  const { playFeedback } = useOnboardingFeedback()

  const steps = [
    { 
      component: DNAIntroduction, 
      text: "Your DNA contains the blueprint of your family's story", 
      subtitle: "Every cell carries generations of heritage",
      sound: 'dna-form',
      interactive: true
    },
    { 
      component: DNAHelixFormation, 
      text: "Your genetic code is unique and precious", 
      subtitle: "Like a fingerprint, no two are exactly alike",
      sound: 'block-chain',
      interactive: true
    },
    { 
      component: TreeSeedling, 
      text: "From your DNA, a family tree begins to grow", 
      subtitle: "Each branch represents a connection, each leaf a story",
      sound: 'tree-grow',
      interactive: true
    },
    { 
      component: FamilyTreeGrowth, 
      text: "Your family tree grows stronger with each connection", 
      subtitle: "Preserve your heritage for future generations",
      sound: 'story-discover',
      interactive: true
    },
    { 
      component: SecurityVerification, 
      text: "Your family data is secured with World ID", 
      subtitle: "Zero-knowledge proof protects your privacy",
      sound: 'security-shield',
      interactive: true
    },
    { 
      component: ReadyToBegin, 
      text: "You're ready to build your family tree", 
      subtitle: "Start your journey of discovery",
      sound: 'genesis-create',
      interactive: true
    }
  ]

  const handleStepComplete = () => {
    console.log(`WorldTree Onboarding: Step ${currentStep + 1} completed`)
    playFeedback('step-complete')
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setIsWaitingForClick(false)
    } else {
      console.log('WorldTree Onboarding: Flow completed')
      playFeedback('success')
      onComplete()
    }
  }

  const handleScreenClick = () => {
    if (isWaitingForClick) {
      handleStepComplete()
    }
  }

  const CurrentStepComponent = steps[currentStep]?.component

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-blue-900 to-black overflow-hidden">
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        onClick={handleScreenClick}
        className="cursor-pointer"
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#00ff88" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#4ecdc4" />
        
        <CurrentStepComponent 
          onComplete={handleStepComplete}
          playFeedback={playFeedback}
          setWaitingForClick={setIsWaitingForClick}
        />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.2} />
        </EffectComposer>
      </Canvas>

      {/* UI Overlay */}
      <OnboardingUI 
        currentStep={currentStep}
        totalSteps={steps.length}
        text={steps[currentStep]?.text || ''}
        subtitle={steps[currentStep]?.subtitle || ''}
        isWaitingForClick={isWaitingForClick}
        onSkip={() => {
          playFeedback('step-complete')
          onComplete()
        }}
      />
    </div>
  )
}

// Step 1: DNA Introduction - Clean, focused DNA visualization
function DNAIntroduction({ onComplete, playFeedback, setWaitingForClick }: { 
  onComplete: () => void, 
  playFeedback?: (type: string) => void,
  setWaitingForClick: (waiting: boolean) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true)
      setWaitingForClick(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [setWaitingForClick])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {/* Central DNA Helix */}
      <group position={[0, 0, 0]}>
        {Array.from({ length: 20 }).map((_, i) => {
          const y = (i - 10) * 0.4
          const angle = (i / 20) * Math.PI * 2
          const radius = 1.5
          
          return (
            <group key={i}>
              {/* Left strand */}
              <Sphere
                position={[
                  Math.cos(angle) * radius,
                  y,
                  Math.sin(angle) * radius
                ]}
                args={[0.15, 16, 16]}
              >
                <meshStandardMaterial 
                  color={i % 2 === 0 ? "#ff6b9d" : "#4ecdc4"}
                  emissive={i % 2 === 0 ? "#ff6b9d" : "#4ecdc4"}
                  emissiveIntensity={0.3}
                />
              </Sphere>

              {/* Right strand */}
              <Sphere
                position={[
                  Math.cos(angle + Math.PI) * radius,
                  y,
                  Math.sin(angle + Math.PI) * radius
                ]}
                args={[0.15, 16, 16]}
              >
                <meshStandardMaterial 
                  color={i % 2 === 0 ? "#4ecdc4" : "#ff6b9d"}
                  emissive={i % 2 === 0 ? "#4ecdc4" : "#ff6b9d"}
                  emissiveIntensity={0.3}
                />
              </Sphere>

              {/* Base pair connections */}
              <Cylinder
                position={[0, y, 0]}
                args={[0.02, 0.02, radius * 2]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <meshStandardMaterial 
                  color="#ffffff" 
                  emissive="#ffffff"
                  emissiveIntensity={0.2}
                  transparent
                  opacity={0.6}
                />
              </Cylinder>
            </group>
          )
        })}
      </group>

      {/* Floating particles representing genetic information */}
      <FloatingParticles count={30} color="#00ff88" radius={8} />
    </group>
  )
}

// Step 2: DNA Helix Formation - More detailed DNA structure
function DNAHelixFormation({ onComplete, playFeedback, setWaitingForClick }: { 
  onComplete: () => void, 
  playFeedback?: (type: string) => void,
  setWaitingForClick: (waiting: boolean) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [formationProgress, setFormationProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFormationProgress(1)
      setWaitingForClick(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [setWaitingForClick])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  const nucleotideColors = {
    A: "#ff6b9d", // Adenine - pink
    T: "#4ecdc4", // Thymine - cyan
    G: "#00ff88", // Guanine - green
    C: "#ff9500"  // Cytosine - orange
  }

  const basePairs = ['A-T', 'G-C', 'T-A', 'C-G', 'A-T', 'G-C']

  return (
    <group ref={groupRef}>
      {/* Enhanced DNA Double Helix */}
      {Array.from({ length: 32 }).map((_, i) => {
        const y = (i - 16) * 0.3
        const angle = (i / 32) * Math.PI * 3
        const radius = 2
        const opacity = formationProgress > (i / 32) ? 1 : 0.1
        
        const basePair = basePairs[i % basePairs.length]
        const [nucleotide1, nucleotide2] = basePair.split('-')

        return (
          <group key={i}>
            {/* Left strand */}
            <Sphere
              position={[
                Math.cos(angle) * radius,
                y,
                Math.sin(angle) * radius
              ]}
              args={[0.12, 16, 16]}
            >
              <meshStandardMaterial 
                color={nucleotideColors[nucleotide1 as keyof typeof nucleotideColors]}
                emissive={nucleotideColors[nucleotide1 as keyof typeof nucleotideColors]}
                emissiveIntensity={0.4}
                transparent
                opacity={opacity}
              />
            </Sphere>

            {/* Right strand */}
            <Sphere
              position={[
                Math.cos(angle + Math.PI) * radius,
                y,
                Math.sin(angle + Math.PI) * radius
              ]}
              args={[0.12, 16, 16]}
            >
              <meshStandardMaterial 
                color={nucleotideColors[nucleotide2 as keyof typeof nucleotideColors]}
                emissive={nucleotideColors[nucleotide2 as keyof typeof nucleotideColors]}
                emissiveIntensity={0.4}
                transparent
                opacity={opacity}
              />
            </Sphere>

            {/* Hydrogen bonds */}
            <Cylinder
              position={[0, y, 0]}
              args={[0.015, 0.015, radius * 2]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <meshStandardMaterial 
                color="#ffffff" 
                emissive="#ffffff"
                emissiveIntensity={0.3}
                transparent
                opacity={opacity * 0.8}
              />
            </Cylinder>
          </group>
        )
      })}

      {/* Genetic information particles */}
      <FloatingParticles count={40} color="#00ff88" radius={10} />
    </group>
  )
}

// Step 3: Tree Seedling - DNA transforms into a tree seed
function TreeSeedling({ onComplete, playFeedback, setWaitingForClick }: { 
  onComplete: () => void, 
  playFeedback?: (type: string) => void,
  setWaitingForClick: (waiting: boolean) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [growthProgress, setGrowthProgress] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setGrowthProgress(1)
      setWaitingForClick(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [setWaitingForClick])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Tree Seed (DNA-inspired) */}
      <group position={[0, -2, 0]}>
        <Sphere args={[0.8, 32, 32]}>
          <meshStandardMaterial 
            color="#8B4513"
            emissive="#654321"
            emissiveIntensity={0.2}
          />
        </Sphere>
        
        {/* DNA pattern on seed */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 0.6
          
          return (
            <group key={i}>
              <Sphere
                position={[
                  Math.cos(angle) * radius,
                  Math.sin(angle) * radius,
                  0.3
                ]}
                args={[0.08, 16, 16]}
              >
                <meshStandardMaterial 
                  color={i % 2 === 0 ? "#00ff88" : "#4ecdc4"}
                  emissive={i % 2 === 0 ? "#00ff88" : "#4ecdc4"}
                  emissiveIntensity={0.3}
                />
              </Sphere>
            </group>
          )
        })}
      </group>

      {/* Growing Tree Trunk */}
      <group position={[0, 0, 0]}>
        <Cylinder
          args={[0.3, 0.4, 4 * growthProgress]}
          position={[0, 2 * growthProgress - 2, 0]}
        >
          <meshStandardMaterial 
            color="#8B4513"
            emissive="#654321"
            emissiveIntensity={0.1}
          />
        </Cylinder>

        {/* First branches */}
        {growthProgress > 0.5 && (
          <>
            <Cylinder
              args={[0.1, 0.15, 1.5]}
              position={[-1.5, 1, 0]}
              rotation={[0, 0, Math.PI / 4]}
            >
              <meshStandardMaterial color="#228B22" />
            </Cylinder>
            <Cylinder
              args={[0.1, 0.15, 1.5]}
              position={[1.5, 1, 0]}
              rotation={[0, 0, -Math.PI / 4]}
            >
              <meshStandardMaterial color="#228B22" />
            </Cylinder>
          </>
        )}

        {/* Leaves */}
        {growthProgress > 0.7 && (
          <>
            <Sphere position={[-1.8, 1.5, 0]} args={[0.3, 16, 16]}>
              <meshStandardMaterial color="#32CD32" />
            </Sphere>
            <Sphere position={[1.8, 1.5, 0]} args={[0.3, 16, 16]}>
              <meshStandardMaterial color="#32CD32" />
            </Sphere>
          </>
        )}
      </group>

      {/* Growth particles */}
      <FloatingParticles count={25} color="#00ff88" radius={6} />
    </group>
  )
}

// Step 4: Family Tree Growth - Tree grows with family connections
function FamilyTreeGrowth({ onComplete, playFeedback, setWaitingForClick }: { 
  onComplete: () => void, 
  playFeedback?: (type: string) => void,
  setWaitingForClick: (waiting: boolean) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [treeGrowth, setTreeGrowth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setTreeGrowth(1)
      setWaitingForClick(true)
    }, 4000)
    return () => clearTimeout(timer)
  }, [setWaitingForClick])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main Tree Trunk */}
      <Cylinder
        args={[0.4, 0.5, 6]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#8B4513"
          emissive="#654321"
          emissiveIntensity={0.1}
        />
      </Cylinder>

      {/* Primary Branches */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2
        const radius = 2
        const height = 2 + Math.sin(i) * 1
        
        return (
          <group key={i}>
            <Cylinder
              args={[0.15, 0.2, 2.5]}
              position={[
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
              ]}
              rotation={[
                Math.PI / 6,
                0,
                angle + Math.PI / 2
              ]}
            >
              <meshStandardMaterial color="#228B22" />
            </Cylinder>

            {/* Secondary branches */}
            {treeGrowth > 0.5 && (
              <>
                <Cylinder
                  args={[0.08, 0.12, 1.5]}
                  position={[
                    Math.cos(angle) * (radius + 1.2),
                    height + 1,
                    Math.sin(angle) * (radius + 1.2)
                  ]}
                  rotation={[
                    Math.PI / 4,
                    0,
                    angle + Math.PI
                  ]}
                >
                  <meshStandardMaterial color="#32CD32" />
                </Cylinder>
                <Cylinder
                  args={[0.08, 0.12, 1.5]}
                  position={[
                    Math.cos(angle) * (radius + 1.2),
                    height + 1,
                    Math.sin(angle) * (radius + 1.2)
                  ]}
                  rotation={[
                    -Math.PI / 4,
                    0,
                    angle
                  ]}
                >
                  <meshStandardMaterial color="#32CD32" />
                </Cylinder>
              </>
            )}

            {/* Family member nodes */}
            {treeGrowth > 0.7 && (
              <Sphere
                position={[
                  Math.cos(angle) * (radius + 2),
                  height,
                  Math.sin(angle) * (radius + 2)
                ]}
                args={[0.2, 16, 16]}
              >
                <meshStandardMaterial 
                  color="#00ff88"
                  emissive="#00ff88"
                  emissiveIntensity={0.3}
                />
              </Sphere>
            )}
          </group>
        )
      })}

      {/* Tree canopy */}
      {treeGrowth > 0.3 && (
        <group position={[0, 4, 0]}>
          <Sphere args={[3, 32, 32]}>
            <meshStandardMaterial 
              color="#228B22"
              transparent
              opacity={0.8}
            />
          </Sphere>
        </group>
      )}

      {/* Connection lines between family members */}
      {treeGrowth > 0.8 && (
        <group>
          {Array.from({ length: 4 }).map((_, i) => {
            const angle1 = (i / 4) * Math.PI * 2
            const angle2 = ((i + 1) / 4) * Math.PI * 2
            const radius = 2
            
            return (
              <Line
                key={i}
                points={[
                  [
                    Math.cos(angle1) * (radius + 2),
                    2 + Math.sin(i) * 1 + 1.5,
                    Math.sin(angle1) * (radius + 2)
                  ],
                  [
                    Math.cos(angle2) * (radius + 2),
                    2 + Math.sin(i + 1) * 1 + 1.5,
                    Math.sin(angle2) * (radius + 2)
                  ]
                ]}
                color="#00ff88"
                lineWidth={2}
              />
            )
          })}
        </group>
      )}

      {/* Growth particles */}
      <FloatingParticles count={35} color="#00ff88" radius={8} />
    </group>
  )
}

// Step 5: Security Verification - World ID shield formation
function SecurityVerification({ onComplete, playFeedback, setWaitingForClick }: { 
  onComplete: () => void, 
  playFeedback?: (type: string) => void,
  setWaitingForClick: (waiting: boolean) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [shieldFormation, setShieldFormation] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShieldFormation(1)
      setWaitingForClick(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [setWaitingForClick])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Central World ID Symbol */}
      <group position={[0, 0, 0]}>
        <Sphere args={[1.5, 32, 32]}>
          <meshStandardMaterial 
            color="#00ff88"
            emissive="#00ff88"
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </Sphere>
        
        {/* World ID Globe */}
        <Sphere args={[1, 32, 32]}>
          <meshStandardMaterial 
            color="#4ecdc4"
            emissive="#4ecdc4"
            emissiveIntensity={0.2}
          />
        </Sphere>
      </group>

      {/* Protective Shield */}
      {shieldFormation > 0.3 && (
        <group position={[0, 0, 0]}>
          <Sphere args={[3, 32, 32]}>
            <meshStandardMaterial 
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.1}
              transparent
              opacity={0.3}
              wireframe
            />
          </Sphere>
        </group>
      )}

      {/* Security particles */}
      <FloatingParticles count={20} color="#00ff88" radius={5} />
    </group>
  )
}

// Step 6: Ready to Begin - Final preparation
function ReadyToBegin({ onComplete, playFeedback, setWaitingForClick }: { 
  onComplete: () => void, 
  playFeedback?: (type: string) => void,
  setWaitingForClick: (waiting: boolean) => void
}) {
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setWaitingForClick(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [setWaitingForClick])

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <group ref={groupRef}>
      {/* Complete Family Tree */}
      <group position={[0, 0, 0]}>
        {/* Tree trunk */}
        <Cylinder args={[0.5, 0.6, 8]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#8B4513" />
        </Cylinder>

        {/* Tree canopy */}
        <Sphere args={[4, 32, 32]} position={[0, 6, 0]}>
          <meshStandardMaterial 
            color="#228B22"
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Family member nodes */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          const radius = 3
          const height = 4 + Math.sin(i) * 2
          
          return (
            <Sphere
              key={i}
              position={[
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
              ]}
              args={[0.3, 16, 16]}
            >
              <meshStandardMaterial 
                color="#00ff88"
                emissive="#00ff88"
                emissiveIntensity={0.4}
              />
            </Sphere>
          )
        })}
      </group>

      {/* Celebration particles */}
      <FloatingParticles count={50} color="#00ff88" radius={10} />
    </group>
  )
}

// Enhanced UI Overlay
function OnboardingUI({ 
  currentStep, 
  totalSteps, 
  text, 
  subtitle,
  isWaitingForClick, 
  onSkip 
}: {
  currentStep: number
  totalSteps: number
  text: string
  subtitle: string
  isWaitingForClick: boolean
  onSkip: () => void
}) {
  return (
    <>
      {/* Progress Bar */}
      <div className="absolute top-6 left-6 right-6 z-20">
        <div className="flex justify-between items-center mb-4">
          <div className="text-white text-sm font-medium">
            Step {currentStep + 1} of {totalSteps}
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Skip Tour
          </button>
        </div>
        
        <div className="w-full bg-gray-800 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="absolute bottom-20 left-6 right-6 z-20">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {text}
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          {isWaitingForClick && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 inline-block"
            >
              <p className="text-white text-lg font-medium">
                Click anywhere to continue →
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  )
}

// Enhanced Floating Particles
function FloatingParticles({ 
  count = 50, 
  color = "#ffffff", 
  radius = 5 
}: { 
  count?: number
  color?: string
  radius?: number 
}) {
  const pointsRef = useRef<THREE.Points>(null)
  
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * radius * 2
      positions[i * 3 + 1] = (Math.random() - 0.5) * radius * 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * radius * 2
    }
    return positions
  }, [count, radius])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      stride={3}
      frustumCulled={false}
    >
      <pointsMaterial
        color={color}
        size={0.05}
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </Points>
  )
} 