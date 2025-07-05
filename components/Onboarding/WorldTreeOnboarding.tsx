'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  Text, 
  Sphere, 
  Cylinder, 
  Html,
  Float,
  Points
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { useOnboardingFeedback } from '@/hooks/useOnboardingFeedback'

// Main Onboarding Component
export default function WorldTreeOnboarding({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isInteractive, setIsInteractive] = useState(false)
  const { playFeedback } = useOnboardingFeedback()

  const steps = [
    { component: DNAHelixLoading, duration: 3000, text: "Your story begins in your DNA...", sound: 'dna-form' },
    { component: BlockchainTransformation, duration: 3000, text: "...and lives forever on the blockchain", sound: 'block-chain' },
    { component: WorldTreeEmergence, duration: 4000, text: "Welcome to WorldTree - Where families grow on-chain", sound: 'tree-grow' },
    { component: HeritageDiscovery, interactive: true, text: "Every family has untold stories", sound: 'story-discover' },
    { component: SecurityShieldFormation, interactive: true, text: "Your legacy, verified by you", sound: 'security-shield' },
    { component: PlatformTour, interactive: true, text: "Build, share, and preserve your family history", sound: 'step-complete' },
    { component: FamilyCreation, interactive: true, text: "Start your eternal family tree", sound: 'genesis-create' }
  ]

  useEffect(() => {
    // Play step sound when entering a new step
    const currentStepData = steps[currentStep]
    if (currentStepData?.sound) {
      setTimeout(() => {
        playFeedback(currentStepData.sound, false) // Audio only, no haptic for automatic steps
      }, 500)
    }

    if (!steps[currentStep]?.interactive) {
      const timer = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          playFeedback('step-complete')
          setCurrentStep(currentStep + 1)
        } else {
          playFeedback('success')
          onComplete()
        }
      }, steps[currentStep]?.duration || 3000)

      return () => clearTimeout(timer)
    }
  }, [currentStep, onComplete, playFeedback])

  const handleNextStep = () => {
    console.log(`WorldTree Onboarding: Step ${currentStep + 1} completed`)
    playFeedback('step-complete')
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      console.log('WorldTree Onboarding: Flow completed')
      playFeedback('success')
      onComplete()
    }
  }

  const CurrentStepComponent = steps[currentStep]?.component

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ff88" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4ecdc4" />
        
        <CurrentStepComponent 
          onComplete={handleNextStep}
          playFeedback={playFeedback}
        />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} />
        </EffectComposer>
      </Canvas>

      {/* UI Overlay */}
      <OnboardingUI 
        currentStep={currentStep}
        totalSteps={steps.length}
        text={steps[currentStep]?.text || ''}
        isInteractive={steps[currentStep]?.interactive || false}
        onNext={handleNextStep}
        onSkip={() => {
          playFeedback('step-complete')
          onComplete()
        }}
      />
    </div>
  )
}

// Step 1: DNA Helix Loading
function DNAHelixLoading({ onComplete, playFeedback }: { onComplete: () => void, playFeedback?: (type: string) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const [progress, setProgress] = useState(0)

  // Nucleotide colors: A-pink, T-cyan, G-green, C-orange
  const nucleotideColors = {
    A: "#ff6b9d", // pink
    T: "#4ecdc4", // cyan
    G: "#00ff88", // green
    C: "#ff9500"  // orange
  }

  // Base pair sequence (A-T, G-C)
  const basePairs = ['A-T', 'G-C', 'T-A', 'C-G']

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5
      
      // Animate formation progress over 3 seconds
      const newProgress = Math.min((state.clock.elapsedTime / 3) * 100, 100)
      setProgress(newProgress)
    }
  })

  return (
    <group ref={groupRef}>
      {/* DNA Double Helix with proper nucleotide colors */}
      {Array.from({ length: 48 }).map((_, i) => {
        const y = (i - 24) * 0.3
        const angle = (i / 48) * Math.PI * 4
        const radius = 2
        const opacity = progress > (i / 48) * 100 ? 1 : 0.1
        
        const basePair = basePairs[i % 4]
        const [nucleotide1, nucleotide2] = basePair.split('-')

        return (
          <group key={i}>
            {/* Left strand nucleotide */}
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

            {/* Right strand nucleotide */}
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

            {/* Base pair connections */}
            {i % 2 === 0 && (
              <Cylinder
                position={[0, y, 0]}
                args={[0.02, 0.02, radius * 2]}
                rotation={[0, 0, Math.PI / 2]}
              >
                <meshStandardMaterial 
                  color="#ffffff" 
                  emissive="#ffffff"
                  emissiveIntensity={0.1}
                  transparent
                  opacity={opacity * 0.7}
                />
              </Cylinder>
            )}
          </group>
        )
      })}

      {/* Scattered particles materializing into DNA */}
      <FloatingParticles count={200} color="#4ecdc4" radius={8} />
      <FloatingParticles count={200} color="#00ff88" radius={8} />
    </group>
  )
}

// Step 2: Blockchain Transformation
function BlockchainTransformation({ onComplete, playFeedback }: { onComplete: () => void, playFeedback?: (type: string) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const [transformProgress, setTransformProgress] = useState(0)
  const [blockFormationStep, setBlockFormationStep] = useState(0)

  // Blockchain block colors
  const blockColors = ["#ffd700", "#00ff88", "#4ecdc4", "#ff6b9d", "#ff9500"]

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
      
      const progress = Math.min(state.clock.elapsedTime / 3, 1)
      setTransformProgress(progress)
      
      // Block formation steps
      const step = Math.floor(progress * 4)
      setBlockFormationStep(step)
    }
  })

  console.log(`BlockchainTransformation: Progress ${(transformProgress * 100).toFixed(1)}%, Step ${blockFormationStep}`)

  return (
    <group ref={groupRef}>
      {/* DNA to Data Transformation Particles */}
      {blockFormationStep >= 1 && (
        <FloatingParticles count={30} color="#ffffff" radius={6} />
      )}

      {/* Blockchain Formation */}
      {Array.from({ length: 8 }).map((_, i) => {
        const isVisible = transformProgress > i / 8
        const y = (i - 4) * 1.8
        const scale = isVisible ? 1 : 0
        const opacity = isVisible ? 0.9 : 0
        const color = blockColors[i % blockColors.length]

        return (
          <group key={i}>
            {/* Blockchain Block */}
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
              <mesh position={[0, y, 0]} scale={scale}>
                <boxGeometry args={[1.5, 1.2, 1.2]} />
                <meshStandardMaterial 
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.3}
                  transparent
                  opacity={opacity}
                />
              </mesh>
            </Float>

            {/* Block Data Visualization */}
            {isVisible && blockFormationStep >= 2 && (
              <group position={[0, y, 0]}>
                {/* Data cubes inside block */}
                {Array.from({ length: 6 }).map((_, j) => {
                  const dataAngle = (j / 6) * Math.PI * 2
                  const dataRadius = 0.4
                  
                  return (
                    <mesh
                      key={j}
                      position={[
                        Math.cos(dataAngle) * dataRadius,
                        0,
                        Math.sin(dataAngle) * dataRadius
                      ]}
                      scale={0.3}
                    >
                      <boxGeometry args={[0.2, 0.2, 0.2]} />
                      <meshStandardMaterial 
                        color="#ffffff"
                        emissive="#ffffff"
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.8}
                      />
                    </mesh>
                  )
                })}
              </group>
            )}

            {/* Chain Links */}
            {i < 7 && isVisible && (
              <Cylinder
                position={[0, y + 0.9, 0]}
                args={[0.08, 0.08, 0.6]}
              >
                <meshStandardMaterial 
                  color="#4ecdc4" 
                  emissive="#4ecdc4"
                  emissiveIntensity={0.4}
                  transparent
                  opacity={opacity}
                />
              </Cylinder>
            )}
          </group>
        )
      })}

      {/* Blockchain Hash Generation */}
      {transformProgress > 0.6 && (
        <group position={[0, -8, 0]}>
          <Text
            fontSize={0.4}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            Genesis Block Created
          </Text>
          <Text
            position={[0, -0.8, 0]}
            fontSize={0.3}
            color="#4ecdc4"
            anchorX="center"
            anchorY="middle"
          >
            Hash: 0x{Math.random().toString(16).substring(2, 18)}...
          </Text>
        </group>
      )}

      {/* Security Shield Formation Preview */}
      {transformProgress > 0.8 && (
        <group position={[0, 8, 0]}>
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
            <mesh scale={[2, 2, 0.2]}>
              <boxGeometry args={[1, 1.2, 0.1]} />
              <meshStandardMaterial 
                color="#ffd700"
                emissive="#ffd700"
                emissiveIntensity={0.5}
                transparent
                opacity={0.6}
              />
            </mesh>
          </Float>
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.3}
            color="#ffd700"
            anchorX="center"
            anchorY="middle"
          >
            🛡️ Immutable Legacy
          </Text>
        </group>
      )}
    </group>
  )
}

// Step 3: World Tree Emergence
function WorldTreeEmergence({ onComplete, playFeedback }: { onComplete: () => void, playFeedback?: (type: string) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const [growthProgress, setGrowthProgress] = useState(0)
  const [familyNodes, setFamilyNodes] = useState(0)

  const familyColors = ["#ffd700", "#ff6b9d", "#4ecdc4", "#00ff88", "#ff9500"]

  useFrame((state) => {
    if (groupRef.current) {
      const progress = Math.min(state.clock.elapsedTime / 4, 1)
      setGrowthProgress(progress)
      
      // Family nodes appear progressively
      const nodeCount = Math.floor(progress * 5)
      setFamilyNodes(nodeCount)
      
      // Gentle swaying
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05
    }
  })

  console.log(`WorldTreeEmergence: Growth ${(growthProgress * 100).toFixed(1)}%, Family Nodes: ${familyNodes}`)

  return (
    <group ref={groupRef}>
      {/* Growing Energy Particles */}
      {growthProgress > 0.2 && (
        <FloatingParticles count={40} color="#00ff88" radius={8} />
      )}

      {/* Tree trunk with blockchain texture */}
      <Cylinder
        position={[0, -3, 0]}
        args={[1, 1.5, 6 * growthProgress]}
      >
        <meshStandardMaterial 
          color="#8B4513" 
          emissive="#4a2c17"
          emissiveIntensity={0.1}
        />
      </Cylinder>

      {/* Blockchain roots foundation */}
      {growthProgress > 0.3 && (
        <group position={[0, -6, 0]}>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const length = 2 + i * 0.3
            const isVisible = growthProgress > 0.3 + (i / 8) * 0.2

            return isVisible ? (
              <Cylinder
                key={i}
                position={[
                  Math.cos(angle) * length * 0.5,
                  0,
                  Math.sin(angle) * length * 0.5
                ]}
                args={[0.1, 0.2, length]}
                rotation={[Math.PI / 6, angle, 0]}
              >
                <meshStandardMaterial 
                  color="#4ecdc4" 
                  emissive="#4ecdc4"
                  emissiveIntensity={0.3}
                />
              </Cylinder>
            ) : null
          })}
        </group>
      )}

      {/* Main Tree Structure with Family Nodes */}
      {growthProgress > 0.5 && (
        <group>
          {/* Genesis Node (Center) */}
          <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.8, 16, 16]} />
              <meshStandardMaterial 
                color="#ffd700"
                emissive="#ffd700"
                emissiveIntensity={0.5}
              />
            </mesh>
          </Float>

          {/* First Generation Nodes */}
          {familyNodes >= 2 && Array.from({ length: 2 }).map((_, i) => {
            const angle = (i / 2) * Math.PI * 2
            const radius = 2.5
            const height = 2

            return (
              <Float key={`gen1-${i}`} speed={1.2} rotationIntensity={0.3} floatIntensity={0.3}>
                <mesh position={[
                  Math.cos(angle) * radius,
                  height,
                  Math.sin(angle) * radius
                ]}>
                  <sphereGeometry args={[0.6, 16, 16]} />
                  <meshStandardMaterial 
                    color={familyColors[i + 1]}
                    emissive={familyColors[i + 1]}
                    emissiveIntensity={0.4}
                  />
                </mesh>
              </Float>
            )
          })}

          {/* Second Generation Nodes */}
          {familyNodes >= 4 && Array.from({ length: 4 }).map((_, i) => {
            const angle = (i / 4) * Math.PI * 2
            const radius = 4
            const height = 4

            return (
              <Float key={`gen2-${i}`} speed={1.5} rotationIntensity={0.4} floatIntensity={0.4}>
                <mesh position={[
                  Math.cos(angle) * radius,
                  height,
                  Math.sin(angle) * radius
                ]}>
                  <sphereGeometry args={[0.4, 16, 16]} />
                  <meshStandardMaterial 
                    color={familyColors[i % familyColors.length]}
                    emissive={familyColors[i % familyColors.length]}
                    emissiveIntensity={0.3}
                  />
                </mesh>
              </Float>
            )
          })}

          {/* Connection Lines */}
          {familyNodes >= 2 && (
            <group>
              {/* Genesis to First Generation */}
              {Array.from({ length: 2 }).map((_, i) => {
                const angle = (i / 2) * Math.PI * 2
                const radius = 2.5
                const height = 2

                return (
                  <Cylinder
                    key={`conn1-${i}`}
                    position={[
                      Math.cos(angle) * radius * 0.5,
                      height * 0.5,
                      Math.sin(angle) * radius * 0.5
                    ]}
                    args={[0.03, 0.03, Math.sqrt(radius * radius + height * height)]}
                    rotation={[0, angle, Math.atan2(height, radius)]}
                  >
                    <meshStandardMaterial 
                      color="#ffffff"
                      emissive="#ffffff"
                      emissiveIntensity={0.3}
                    />
                  </Cylinder>
                )
              })}

              {/* First to Second Generation */}
              {familyNodes >= 4 && Array.from({ length: 4 }).map((_, i) => {
                const parentAngle = Math.floor(i / 2) * Math.PI
                const parentRadius = 2.5
                const parentHeight = 2
                
                const childAngle = (i / 4) * Math.PI * 2
                const childRadius = 4
                const childHeight = 4

                return (
                  <Cylinder
                    key={`conn2-${i}`}
                    position={[
                      (Math.cos(parentAngle) * parentRadius + Math.cos(childAngle) * childRadius) * 0.5,
                      (parentHeight + childHeight) * 0.5,
                      (Math.sin(parentAngle) * parentRadius + Math.sin(childAngle) * childRadius) * 0.5
                    ]}
                    args={[0.02, 0.02, 2]}
                    rotation={[
                      0,
                      Math.atan2(
                        Math.sin(childAngle) * childRadius - Math.sin(parentAngle) * parentRadius,
                        Math.cos(childAngle) * childRadius - Math.cos(parentAngle) * parentRadius
                      ),
                      Math.atan2(childHeight - parentHeight, 2)
                    ]}
                  >
                    <meshStandardMaterial 
                      color="#4ecdc4"
                      emissive="#4ecdc4"
                      emissiveIntensity={0.2}
                    />
                  </Cylinder>
                )
              })}
            </group>
          )}
        </group>
      )}

      {/* WorldTree Branding */}
      {growthProgress > 0.8 && (
        <group position={[0, 7, 0]}>
          <Text
            fontSize={1.5}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            🌳 WorldTree
          </Text>
          <Text
            position={[0, -1, 0]}
            fontSize={0.4}
            color="#4ecdc4"
            anchorX="center"
            anchorY="middle"
          >
            Where families grow on-chain
          </Text>
        </group>
      )}

      {/* Completion Indicator */}
      {growthProgress > 0.95 && (
        <group position={[0, -8, 0]}>
          <Text
            fontSize={0.5}
            color="#ffd700"
            anchorX="center"
            anchorY="middle"
          >
            ✨ Tap to continue your journey
          </Text>
        </group>
      )}
    </group>
  )
}

// Step 4: Heritage Discovery
function HeritageDiscovery({ onComplete, playFeedback }: { onComplete: () => void, playFeedback?: (type: string) => void }) {
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  const [discoveredStories, setDiscoveredStories] = useState(0)
  const [showStoryDetail, setShowStoryDetail] = useState(false)

  const ancestralStories = [
    {
      title: "The Ocean Crossing",
      story: "Great-grandmother Elena was a pioneer who crossed the Atlantic in 1892, carrying only a worn leather journal and dreams of a new life",
      artifact: "📜",
      color: "#ff6b9d",
      year: "1892"
    },
    {
      title: "Building Nations",
      story: "Your great-grandfather Samuel helped build the first transcontinental railroad, his skilled hands connecting distant lands",
      artifact: "⛏️",
      color: "#ffd700",
      year: "1869"
    },
    {
      title: "Healing Hearts",
      story: "Aunt Margaret served as a field nurse in WWII, saving countless lives with her courage and compassion",
      artifact: "🏥",
      color: "#4ecdc4",
      year: "1943"
    },
    {
      title: "Master Craftsmen",
      story: "Your lineage traces back to medieval craftsmen, whose intricate stone work still stands in ancient cathedrals",
      artifact: "⚒️",
      color: "#00ff88",
      year: "1340"
    },
    {
      title: "New World Pioneers",
      story: "The Williams family were among the first settlers in the New World, establishing the foundations of what would become home",
      artifact: "🗺️",
      color: "#ff9500",
      year: "1620"
    }
  ]

  const handleNodeClick = (index: number) => {
    console.log(`Heritage Discovery: Story ${index} discovered - ${ancestralStories[index].title}`)
    playFeedback?.('story-discover')
    setSelectedNode(index)
    setShowStoryDetail(true)
    
    if (discoveredStories <= index) {
      setDiscoveredStories(index + 1)
    }
    
    // Auto-complete after discovering 3 stories
    if (discoveredStories >= 2 && index >= 2) {
      setTimeout(() => {
        console.log('Heritage Discovery: All stories discovered, proceeding to next step')
        onComplete()
      }, 3000)
    }
  }

  const handleCloseStory = () => {
    setShowStoryDetail(false)
    setSelectedNode(null)
  }

  return (
    <group>
      {/* Heritage Timeline Portal */}
      <group position={[0, 0, 0]}>
        <Cylinder args={[0.1, 0.1, 8]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial 
            color="#4ecdc4" 
            emissive="#4ecdc4"
            emissiveIntensity={0.3}
          />
        </Cylinder>
        
        {/* Timeline markers */}
        {ancestralStories.map((story, i) => {
          const x = (i - 2) * 2.5
          const isDiscovered = discoveredStories > i
          const isSelected = selectedNode === i
          const isAvailable = i <= discoveredStories || discoveredStories === 0

          return (
            <group key={i} position={[x, 0, 0]}>
              {/* Story Node */}
              <Float speed={1 + i * 0.1} rotationIntensity={0.2} floatIntensity={0.4}>
                <mesh
                  position={[0, 0, 0]}
                  onClick={() => isAvailable && handleNodeClick(i)}
                  scale={isSelected ? 1.3 : 1}
                >
                  <sphereGeometry args={[0.8, 16, 16]} />
                  <meshStandardMaterial 
                    color={isDiscovered ? story.color : isAvailable ? "#ffffff" : "#666666"}
                    emissive={isDiscovered ? story.color : isAvailable ? "#ffffff" : "#333333"}
                    emissiveIntensity={isSelected ? 0.8 : isAvailable ? 0.3 : 0.1}
                    transparent
                    opacity={isAvailable ? 1 : 0.3}
                  />
                </mesh>
              </Float>

              {/* Artifact Symbol */}
              {isAvailable && (
                <Text
                  position={[0, 0, 0.9]}
                  fontSize={0.6}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                >
                  {story.artifact}
                </Text>
              )}

              {/* Year Label */}
              <Text
                position={[0, -1.5, 0]}
                fontSize={0.3}
                color={isDiscovered ? story.color : "#ffffff"}
                anchorX="center"
                anchorY="middle"
              >
                {story.year}
              </Text>

              {/* Discovery Sparkles */}
              {isDiscovered && (
                <FloatingParticles count={15} color={story.color} radius={1.5} />
              )}

              {/* Connecting Lines */}
              {i < ancestralStories.length - 1 && (
                <Cylinder
                  position={[1.25, 0, 0]}
                  args={[0.02, 0.02, 1.5]}
                  rotation={[0, 0, Math.PI / 2]}
                >
                  <meshStandardMaterial 
                    color={discoveredStories > i ? story.color : "#666666"}
                    emissive={discoveredStories > i ? story.color : "#333333"}
                    emissiveIntensity={discoveredStories > i ? 0.3 : 0.1}
                  />
                </Cylinder>
              )}
            </group>
          )
        })}
      </group>

      {/* Story Detail Modal */}
      {showStoryDetail && selectedNode !== null && (
        <Html position={[0, 4, 0]} center>
          <div className="bg-black bg-opacity-90 text-white p-6 rounded-lg max-w-md border-2 border-cyan-400">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-cyan-400">{ancestralStories[selectedNode].title}</h3>
              <button 
                onClick={handleCloseStory}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">{ancestralStories[selectedNode].artifact}</span>
              <span className="text-sm text-gray-400">{ancestralStories[selectedNode].year}</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">{ancestralStories[selectedNode].story}</p>
            <div className="text-center">
              <span className="text-xs text-cyan-400">✨ Story Discovered ✨</span>
            </div>
          </div>
        </Html>
      )}

      {/* Progress and Instructions */}
      <group position={[0, -4, 0]}>
        <Text
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          📚 Discover Your Heritage Timeline
        </Text>
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.4}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
        >
          Stories Discovered: {discoveredStories}/5
        </Text>
        <Text
          position={[0, -1.6, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {discoveredStories < 3 ? "Tap the glowing artifacts to unlock stories" : "🎉 Heritage timeline unlocked!"}
        </Text>
      </group>
    </group>
  )
}

// Step 5: Security Shield Formation
function SecurityShieldFormation({ onComplete, playFeedback }: { onComplete: () => void, playFeedback?: (type: string) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const [shieldProgress, setShieldProgress] = useState(0)
  const [showWorldId, setShowWorldId] = useState(false)
  const [worldIdPulse, setWorldIdPulse] = useState(0)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
      
      // Animate shield formation
      const progress = Math.min((state.clock.elapsedTime / 3) * 100, 100)
      setShieldProgress(progress)
      
      if (progress > 60 && !showWorldId) {
        setShowWorldId(true)
      }
      
      // World ID pulse effect
      if (showWorldId) {
        setWorldIdPulse(Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1)
      }
    }
  })

  const handleAcknowledgeSecurity = () => {
    console.log('Security Shield: User acknowledged World ID security')
    playFeedback?.('security-shield')
    onComplete()
  }

  console.log(`SecurityShieldFormation: Shield progress ${shieldProgress.toFixed(1)}%, World ID visible: ${showWorldId}`)

  return (
    <group ref={groupRef}>
      {/* Enhanced Central Family Tree */}
      <group position={[0, 0, 0]}>
        {/* Genesis node */}
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.3}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial 
              color="#ffd700"
              emissive="#ffd700"
              emissiveIntensity={0.5}
            />
          </mesh>
        </Float>

        {/* Family members */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          const radius = 2.5
          const height = Math.sin(i * 0.8) * 1.5
          return (
            <Float key={i} speed={1.2} rotationIntensity={0.3} floatIntensity={0.4}>
              <mesh
                position={[
                  Math.cos(angle) * radius,
                  height,
                  Math.sin(angle) * radius
                ]}
              >
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial 
                  color="#00ff88" 
                  emissive="#00ff88"
                  emissiveIntensity={0.3}
                />
              </mesh>
            </Float>
          )
        })}

        {/* Connection lines */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          const radius = 2.5
          const height = Math.sin(i * 0.8) * 1.5
          return (
            <Cylinder
              key={i}
              position={[
                Math.cos(angle) * radius * 0.5,
                height * 0.5,
                Math.sin(angle) * radius * 0.5
              ]}
              args={[0.02, 0.02, Math.sqrt(radius * radius + height * height)]}
              rotation={[0, angle, Math.atan2(height, radius)]}
            >
              <meshStandardMaterial 
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.2}
              />
            </Cylinder>
          )
        })}
      </group>

      {/* Multi-layered Security Shield */}
      <group>
        {/* Inner shield layer */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i / 24) * Math.PI * 2
          const radius = 3.5
          const height = Math.sin((i / 24) * Math.PI) * 2
          const opacity = shieldProgress > (i / 24) * 100 ? 0.7 : 0.1
          
          return (
            <mesh
              key={`inner-${i}`}
              position={[
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
              ]}
              rotation={[0, angle, 0]}
            >
              <planeGeometry args={[0.4, 0.4]} />
              <meshStandardMaterial
                color="#FFD700"
                emissive="#FFD700"
                emissiveIntensity={0.6}
                transparent
                opacity={opacity}
                side={THREE.DoubleSide}
              />
            </mesh>
          )
        })}

        {/* Outer shield layer */}
        {shieldProgress > 50 && Array.from({ length: 36 }).map((_, i) => {
          const angle = (i / 36) * Math.PI * 2
          const radius = 4.5
          const height = Math.sin((i / 36) * Math.PI) * 2.5
          const opacity = shieldProgress > 50 + (i / 36) * 50 ? 0.5 : 0.1
          
          return (
            <mesh
              key={`outer-${i}`}
              position={[
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
              ]}
              rotation={[0, angle, 0]}
            >
              <planeGeometry args={[0.3, 0.3]} />
              <meshStandardMaterial
                color="#4ecdc4"
                emissive="#4ecdc4"
                emissiveIntensity={0.4}
                transparent
                opacity={opacity}
                side={THREE.DoubleSide}
              />
            </mesh>
          )
        })}
      </group>

      {/* World ID Orb with Enhanced Branding */}
      {showWorldId && (
        <group position={[0, 4, 0]}>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh scale={worldIdPulse}>
              <sphereGeometry args={[0.8, 32, 32]} />
              <meshStandardMaterial
                color="#FFFFFF"
                emissive="#FFFFFF"
                emissiveIntensity={0.6}
                transparent
                opacity={0.9}
              />
            </mesh>
          </Float>
          
          {/* World ID logo rings */}
          {Array.from({ length: 3 }).map((_, i) => (
            <Float key={i} speed={1.5 + i * 0.3} rotationIntensity={0.4} floatIntensity={0.3}>
              <mesh rotation={[i * Math.PI / 3, 0, 0]}>
                <ringGeometry args={[1.2 + i * 0.2, 1.4 + i * 0.2, 32]} />
                <meshStandardMaterial
                  color="#FFFFFF"
                  emissive="#FFFFFF"
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.6 - i * 0.1}
                />
              </mesh>
            </Float>
          ))}
        </group>
      )}

      {/* Enhanced Protection Pulses */}
      <group>
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5 + i * 0.8, 2.7 + i * 0.8, 64]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.3}
              transparent
              opacity={0.4 - i * 0.08}
            />
          </mesh>
        ))}
      </group>

      {/* Security Status Text */}
      {shieldProgress > 40 && (
        <Text
          position={[0, -5, 0]}
          fontSize={0.4}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
        >
          🛡️ Your legacy is being secured...
        </Text>
      )}

      {/* World ID Branding */}
      {showWorldId && (
        <group position={[0, 6, 0]}>
          <Text
            fontSize={0.6}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
          >
            World ID
          </Text>
          <Text
            position={[0, -0.8, 0]}
            fontSize={0.3}
            color="#4ecdc4"
            anchorX="center"
            anchorY="middle"
          >
            Verify • Protect • Preserve
          </Text>
        </group>
      )}

      {/* Enhanced Interaction Button */}
      {shieldProgress > 90 && (
        <Html position={[0, -6, 0]} center>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-full shadow-2xl hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 transition-all duration-300 font-bold text-lg"
              onClick={handleAcknowledgeSecurity}
            >
              🛡️ Secure My Legacy with World ID
            </motion.button>
            <p className="text-xs text-gray-400 mt-2">
              Zero-knowledge proof of humanity
            </p>
          </motion.div>
        </Html>
      )}
    </group>
  )
}

// Step 6: Platform Tour
function PlatformTour({ onComplete, playFeedback }: { onComplete: () => void, playFeedback?: (type: string) => void }) {
  const [tourStep, setTourStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const groupRef = useRef<THREE.Group>(null)

  const tourPoints = [
    {
      title: "3D Family Tree",
      description: "Visualize your family connections in stunning 3D space with blockchain-verified relationships",
      emoji: "🌳",
      color: "#00ff88",
      position: [0, 0, 0] as [number, number, number]
    },
    {
      title: "DNA Visualization",
      description: "Explore your genetic heritage through interactive DNA helix with real base pair sequences",
      emoji: "🧬",
      color: "#ff6b9d",
      position: [6, 0, 0] as [number, number, number]
    },
    {
      title: "Blockchain Storage",
      description: "Your family data is stored forever on the blockchain, immutable and secure",
      emoji: "⛓️",
      color: "#4ecdc4",
      position: [-6, 0, 0] as [number, number, number]
    },
    {
      title: "Global Heritage Map",
      description: "Discover your family's journey across the world with interactive geographic mapping",
      emoji: "🗺️",
      color: "#ffd700",
      position: [0, 5, 0] as [number, number, number]
    },
    {
      title: "AI-Powered Insights",
      description: "Get personalized family insights and historical context powered by advanced AI",
      emoji: "🤖",
      color: "#ff9500",
      position: [0, -5, 0] as [number, number, number]
    }
  ]

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation for the entire tour
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    }
  })

  const nextTourStep = () => {
    console.log(`Platform Tour: ${tourPoints[tourStep].title} demonstrated`)
    playFeedback?.('step-complete')
    setIsAnimating(true)
    
    setTimeout(() => {
      if (tourStep < tourPoints.length - 1) {
        setTourStep(tourStep + 1)
      } else {
        console.log('Platform Tour: All features demonstrated, proceeding to family creation')
        onComplete()
      }
      setIsAnimating(false)
    }, 500)
  }

  const currentFeature = tourPoints[tourStep]

  return (
    <group ref={groupRef}>
      {/* Feature Demonstrations */}
      {tourPoints.map((feature, index) => {
        const isActive = index === tourStep
        const isVisible = index <= tourStep
        const scale = isActive ? 1.2 : isVisible ? 0.8 : 0.3
        const opacity = isActive ? 1 : isVisible ? 0.7 : 0.3

        return (
          <group key={index} position={feature.position}>
            {/* Feature Visualization */}
            {feature.title === "3D Family Tree" && (
              <group>
                {/* Genesis node */}
                <Float speed={isActive ? 2 : 1} rotationIntensity={0.3} floatIntensity={0.4}>
                  <Sphere args={[0.8, 16, 16]} scale={scale}>
                    <meshStandardMaterial 
                      color={feature.color}
                      emissive={feature.color}
                      emissiveIntensity={isActive ? 0.5 : 0.2}
                      transparent
                      opacity={opacity}
                    />
                  </Sphere>
                </Float>
                
                {/* Family members */}
                {Array.from({ length: 4 }).map((_, i) => {
                  const angle = (i / 4) * Math.PI * 2
                  const radius = 2
                  return (
                    <Float key={i} speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                      <Sphere 
                        position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                        args={[0.4, 16, 16]} 
                        scale={scale}
                      >
                        <meshStandardMaterial 
                          color={feature.color}
                          emissive={feature.color}
                          emissiveIntensity={isActive ? 0.3 : 0.1}
                          transparent
                          opacity={opacity}
                        />
                      </Sphere>
                    </Float>
                  )
                })}
              </group>
            )}

            {feature.title === "DNA Visualization" && (
              <group>
                {Array.from({ length: 16 }).map((_, i) => {
                  const y = (i - 8) * 0.3
                  const angle = (i / 16) * Math.PI * 4
                  const radius = 1.5
                  return (
                    <Float key={i} speed={isActive ? 2 : 1} rotationIntensity={0.1} floatIntensity={0.2}>
                      <Sphere
                        position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
                        args={[0.12, 8, 8]}
                        scale={scale}
                      >
                        <meshStandardMaterial 
                          color={feature.color}
                          emissive={feature.color}
                          emissiveIntensity={isActive ? 0.4 : 0.1}
                          transparent
                          opacity={opacity}
                        />
                      </Sphere>
                    </Float>
                  )
                })}
              </group>
            )}

            {feature.title === "Blockchain Storage" && (
              <group>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Float key={i} speed={isActive ? 1.5 : 1} rotationIntensity={0.2} floatIntensity={0.3}>
                    <mesh position={[0, i * 0.8 - 2, 0]} scale={scale}>
                      <boxGeometry args={[1, 0.6, 0.6]} />
                      <meshStandardMaterial 
                        color={feature.color}
                        emissive={feature.color}
                        emissiveIntensity={isActive ? 0.4 : 0.1}
                        transparent
                        opacity={opacity}
                      />
                    </mesh>
                  </Float>
                ))}
              </group>
            )}

            {feature.title === "Global Heritage Map" && (
              <group>
                {/* Globe representation */}
                <Float speed={isActive ? 1.5 : 1} rotationIntensity={0.3} floatIntensity={0.4}>
                  <Sphere args={[1.2, 16, 16]} scale={scale}>
                    <meshStandardMaterial 
                      color={feature.color}
                      emissive={feature.color}
                      emissiveIntensity={isActive ? 0.3 : 0.1}
                      transparent
                      opacity={opacity}
                      wireframe
                    />
                  </Sphere>
                </Float>
                
                {/* Location markers */}
                {Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2
                  const radius = 1.5
                  return (
                    <Float key={i} speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
                      <Sphere 
                        position={[Math.cos(angle) * radius, Math.sin(i) * 0.5, Math.sin(angle) * radius]}
                        args={[0.1, 8, 8]} 
                        scale={scale}
                      >
                        <meshStandardMaterial 
                          color="#ffffff"
                          emissive="#ffffff"
                          emissiveIntensity={isActive ? 0.6 : 0.2}
                          transparent
                          opacity={opacity}
                        />
                      </Sphere>
                    </Float>
                  )
                })}
              </group>
            )}

            {feature.title === "AI-Powered Insights" && (
              <group>
                {/* AI brain representation */}
                <Float speed={isActive ? 2 : 1} rotationIntensity={0.4} floatIntensity={0.5}>
                  <Sphere args={[0.8, 16, 16]} scale={scale}>
                    <meshStandardMaterial 
                      color={feature.color}
                      emissive={feature.color}
                      emissiveIntensity={isActive ? 0.5 : 0.2}
                      transparent
                      opacity={opacity}
                    />
                  </Sphere>
                </Float>
                
                {/* Neural network connections */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i / 12) * Math.PI * 2
                  const radius = 1.8
                  return (
                    <Float key={i} speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
                      <Sphere 
                        position={[Math.cos(angle) * radius, Math.sin(i * 0.5) * 0.3, Math.sin(angle) * radius]}
                        args={[0.08, 8, 8]} 
                        scale={scale}
                      >
                        <meshStandardMaterial 
                          color={feature.color}
                          emissive={feature.color}
                          emissiveIntensity={isActive ? 0.4 : 0.1}
                          transparent
                          opacity={opacity}
                        />
                      </Sphere>
                    </Float>
                  )
                })}
              </group>
            )}

            {/* Feature highlight effect */}
            {isActive && (
              <mesh position={[0, 0, 0]}>
                <ringGeometry args={[2, 2.5, 32]} />
                <meshStandardMaterial 
                  color={feature.color}
                  emissive={feature.color}
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            )}
          </group>
        )
      })}

      {/* Enhanced Tour UI */}
      <Html position={[0, -7, 0]} center>
        <motion.div
          key={tourStep}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="bg-black bg-opacity-90 p-6 rounded-lg border border-cyan-400">
            <div className="text-4xl mb-3">{currentFeature.emoji}</div>
            <h3 className="text-2xl font-bold text-white mb-3">{currentFeature.title}</h3>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">{currentFeature.description}</p>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {tourStep + 1} of {tourPoints.length}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextTourStep}
                disabled={isAnimating}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300 font-semibold disabled:opacity-50"
              >
                {tourStep < tourPoints.length - 1 ? 'Next Feature →' : 'Start Building 🚀'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Html>
    </group>
  )
}

// Step 7: Family Creation
function FamilyCreation({ onComplete, playFeedback }: { onComplete: () => void, playFeedback?: (type: string) => void }) {
  const [newNodePosition, setNewNodePosition] = useState<[number, number, number] | null>(null)
  const [isGrowing, setIsGrowing] = useState(false)

  const createFirstMember = () => {
    console.log('Family Creation: Genesis node created')
    playFeedback?.('genesis-create')
    setNewNodePosition([0, 0, 0])
    setIsGrowing(true)
    setTimeout(() => {
      onComplete()
    }, 3000)
  }

  return (
    <group>
      {/* Genesis node */}
      {newNodePosition && (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
          <Sphere
            position={newNodePosition}
            args={[1.5, 16, 16]}
            scale={isGrowing ? [1, 1, 1] : [0, 0, 0]}
          >
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFA500"
              emissiveIntensity={0.5}
            />
          </Sphere>
        </Float>
      )}

      {/* Growing branches */}
      {isGrowing && (
        <>
          {Array.from({ length: 4 }).map((_, i) => {
            const angle = (i / 4) * Math.PI * 2
            const delay = i * 0.5

            return (
              <group key={i}>
                <Sphere
                  position={[
                    Math.cos(angle) * 3,
                    Math.sin(i) * 2,
                    Math.sin(angle) * 3
                  ]}
                  args={[0.8, 16, 16]}
                  scale={isGrowing ? [1, 1, 1] : [0, 0, 0]}
                >
                  <meshStandardMaterial 
                    color="#00ff88" 
                    emissive="#00aa55"
                    emissiveIntensity={0.3}
                  />
                </Sphere>
              </group>
            )
          })}
        </>
      )}

      {/* Creation button */}
      {!newNodePosition && (
        <Html position={[0, -5, 0]} center>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Create Your Genesis Block
            </h2>
            <button
              onClick={createFirstMember}
              className="px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full text-lg font-semibold hover:from-green-500 hover:to-blue-600 transition-all duration-300"
            >
              🌱 Plant Your Family Tree
            </button>
          </div>
        </Html>
      )}
    </group>
  )
}

// UI Overlay Component
function OnboardingUI({ 
  currentStep, 
  totalSteps, 
  text, 
  isInteractive, 
  onNext, 
  onSkip 
}: {
  currentStep: number
  totalSteps: number
  text: string
  isInteractive?: boolean
  onNext: () => void
  onSkip: () => void
}) {
  return (
    <>
      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="flex justify-between items-center mb-4">
          <div className="text-white text-sm">
            {currentStep + 1} / {totalSteps}
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-white text-sm"
          >
            Skip Tour
          </button>
        </div>
        
        <div className="w-full bg-gray-800 rounded-full h-1">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-1 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Main Text */}
      <div className="absolute bottom-20 left-4 right-4 z-20">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {text}
          </h2>
          
          {isInteractive && (
            <p className="text-gray-300 text-sm">
              Interact with the scene above to continue
            </p>
          )}
        </motion.div>
      </div>

      {/* Manual progression for interactive steps */}
      {isInteractive && (
        <div className="absolute bottom-6 right-6 z-20">
          <button
            onClick={onNext}
            className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          >
            Continue →
          </button>
        </div>
      )}
    </>
  )
}

// Utility Components
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