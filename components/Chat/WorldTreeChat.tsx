'use client'

import { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  Text, 
  Sphere, 
  Html,
  Float,
  Points
} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { motion } from 'framer-motion'
import * as THREE from 'three'

export default function WorldTreeChat() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Welcome to WorldTree Chat! This feature is coming soon...",
      sender: 'system',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: 'user',
        timestamp: new Date()
      }
      setMessages([...messages, newMessage])
      setInputMessage('')
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: (Date.now() + 1).toString(),
          text: "Thank you for your message! Our AI chat assistant is under development and will be available soon.",
          sender: 'bot',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botResponse])
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D Scene Background */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ff88" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4ecdc4" />
        
        <ChatVisualizer />
        <FloatingParticles count={100} color="#ffffff" />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.0} />
        </EffectComposer>
      </Canvas>

      {/* Chat UI Overlay */}
      <div className="absolute inset-0 flex flex-col z-10">
        {/* Header */}
        <div className="p-4 bg-black/50 backdrop-blur-sm border-b border-gray-700">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-white mb-2">🌳 WorldTree Chat</h1>
            <p className="text-gray-400 text-sm">AI-powered genealogy assistant (Coming Soon)</p>
          </motion.div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-xs lg:max-w-md px-4 py-3 rounded-2xl
                    ${message.sender === 'user'
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                      : message.sender === 'system'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-700 text-white'
                    }
                  `}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/50 backdrop-blur-sm border-t border-gray-700">
          <div className="max-w-2xl mx-auto">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your genealogy question here..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className={`
                  px-6 py-3 rounded-2xl font-medium transition-all duration-300
                  ${inputMessage.trim()
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Send
              </button>
            </div>
            
            {/* Feature preview */}
            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">
                🚧 Chat assistant is under development. Soon you&apos;ll be able to:
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[
                  "Ask genealogy questions",
                  "Get research tips", 
                  "Find DNA matches",
                  "Explore family history"
                ].map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 3D Chat Visualizer Component
function ChatVisualizer() {
  const groupRef = useRef<THREE.Group>(null)
  const [messageCount, setMessageCount] = useState(3)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
      
      // Update message count based on time
      const newCount = Math.floor(Math.sin(state.clock.elapsedTime * 0.5) * 2) + 5
      setMessageCount(newCount)
    }
  })

  // Create floating message bubbles
  const messageBubbles = useMemo(() => {
    return Array.from({ length: messageCount }).map((_, i) => {
      const angle = (i / messageCount) * Math.PI * 2
      const radius = 4 + Math.sin(i) * 2
      const height = Math.sin(i * 2) * 3
      
      return {
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ] as [number, number, number],
        scale: 0.3 + Math.sin(i) * 0.2,
        index: i
      }
    })
  }, [messageCount])

  return (
    <group ref={groupRef}>
      {/* Central communication hub */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sphere args={[2, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#00ff88" 
            emissive="#00aa55"
            emissiveIntensity={0.3}
            wireframe={false}
          />
        </Sphere>
      </Float>

      {/* Message bubble network */}
      {messageBubbles.map((bubble, i) => (
        <group key={i}>
          <Float speed={1 + i * 0.1} rotationIntensity={0.3} floatIntensity={0.3}>
            <Sphere
              position={bubble.position}
              args={[bubble.scale, 12, 12]}
            >
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#4ecdc4" : "#ff6b9d"}
                emissive={i % 2 === 0 ? "#4ecdc4" : "#ff6b9d"}
                emissiveIntensity={0.4}
                transparent
                opacity={0.8}
              />
            </Sphere>
          </Float>

          {/* Connection lines to center */}
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 
              Math.sqrt(
                bubble.position[0] ** 2 + 
                bubble.position[1] ** 2 + 
                bubble.position[2] ** 2
              )
            ]} />
            <meshStandardMaterial 
              color="#00ff88"
              emissive="#00ff88"
              emissiveIntensity={0.2}
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>
      ))}

      {/* Chat title */}
      <Text
        position={[0, -6, 0]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"

      >
        WorldTree Chat
      </Text>

      <Text
        position={[0, -7.5, 0]}
        fontSize={0.5}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        Coming Soon
      </Text>
    </group>
  )
}

// Floating Particles Component
function FloatingParticles({ 
  count = 50, 
  color = "#ffffff", 
  radius = 8 
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
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.02
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
        size={0.03}
        transparent
        opacity={0.4}
        sizeAttenuation={true}
      />
    </Points>
  )
} 