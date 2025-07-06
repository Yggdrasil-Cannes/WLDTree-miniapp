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
import { useRouter } from 'next/navigation'

// Quiz questions with max 5 options each
const quizQuestions = [
  {
    id: 'heritage_interests',
    question: "What aspects of your heritage intrigue you most?",
    subtitle: "Choose up to 3 that resonate with you",
    type: 'multiple' as const,
    maxSelections: 3,
    options: [
      { id: 'dna', label: "DNA & Genetics", icon: "🧬" },
      { id: 'stories', label: "Family Stories", icon: "📖" },
      { id: 'records', label: "Historical Records", icon: "📜" },
      { id: 'geography', label: "Geographic Origins", icon: "🌍" },
      { id: 'culture', label: "Cultural Traditions", icon: "🎭" }
    ]
  },
  {
    id: 'genealogy_experience',
    question: "How would you describe your genealogy experience?",
    subtitle: "This helps us personalize your journey",
    type: 'single' as const,
    maxSelections: 1,
    options: [
      { id: 'complete_beginner', label: "Complete Beginner", icon: "🌱" },
      { id: 'some_research', label: "Done Some Research", icon: "🔍" },
      { id: 'family_historian', label: "Family Historian", icon: "📚" },
      { id: 'professional', label: "Professional Researcher", icon: "🎓" },
      { id: 'dna_expert', label: "DNA Analysis Expert", icon: "🧬" }
    ]
  },
  {
    id: 'research_goals',
    question: "What are your main research goals?",
    subtitle: "Select your top priorities",
    type: 'multiple' as const,
    maxSelections: 3,
    options: [
      { id: 'find_ancestors', label: "Find Unknown Ancestors", icon: "🔍" },
      { id: 'dna_matches', label: "Connect with DNA Matches", icon: "🧬" },
      { id: 'family_tree', label: "Build Complete Family Tree", icon: "🌳" },
      { id: 'preserve_stories', label: "Preserve Family Stories", icon: "📖" },
      { id: 'ethnic_origins', label: "Discover Ethnic Origins", icon: "🌍" }
    ]
  },
  {
    id: 'time_commitment',
    question: "How much time can you dedicate to genealogy research?",
    subtitle: "Be realistic about your availability",
    type: 'single' as const,
    maxSelections: 1,
    options: [
      { id: 'casual', label: "Casual (Few hours a month)", icon: "🕐" },
      { id: 'regular', label: "Regular (Few hours a week)", icon: "📅" },
      { id: 'dedicated', label: "Dedicated (Daily research)", icon: "⏰" },
      { id: 'intensive', label: "Intensive (Major project)", icon: "💪" },
      { id: 'flexible', label: "Flexible (As needed)", icon: "🔄" }
    ]
  },
  {
    id: 'family_knowledge',
    question: "How much do you know about your family history?",
    subtitle: "This helps us guide your research approach",
    type: 'single' as const,
    maxSelections: 1,
    options: [
      { id: 'very_little', label: "Very Little", icon: "❓" },
      { id: 'some_stories', label: "Some Family Stories", icon: "📝" },
      { id: 'few_generations', label: "Few Generations Back", icon: "👥" },
      { id: 'extensive', label: "Extensive Knowledge", icon: "📚" },
      { id: 'professional_level', label: "Professional Level", icon: "🏆" }
    ]
  }
]

interface QuizAnswer {
  questionId: string
  selectedOptions: string[]
}

interface QuizProps {
  onComplete?: (answers: QuizAnswer[]) => void
}

// Main Quiz Component
export default function WorldTree3DQuiz({ onComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1

  const handleOptionSelect = (optionId: string) => {
    const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)
    
    if (currentQuestion.type === 'single') {
      // Single selection - replace existing answer
      const newAnswers = answers.filter(a => a.questionId !== currentQuestion.id)
      newAnswers.push({
        questionId: currentQuestion.id,
        selectedOptions: [optionId]
      })
      setAnswers(newAnswers)
    } else {
      // Multiple selection
      if (currentAnswer) {
        const isSelected = currentAnswer.selectedOptions.includes(optionId)
        if (isSelected) {
          // Remove selection
          const newOptions = currentAnswer.selectedOptions.filter(id => id !== optionId)
          if (newOptions.length === 0) {
            setAnswers(answers.filter(a => a.questionId !== currentQuestion.id))
          } else {
            const newAnswers = answers.map(a => 
              a.questionId === currentQuestion.id 
                ? { ...a, selectedOptions: newOptions }
                : a
            )
            setAnswers(newAnswers)
          }
        } else {
          // Add selection if under max limit
          if (currentAnswer.selectedOptions.length < currentQuestion.maxSelections) {
            const newAnswers = answers.map(a => 
              a.questionId === currentQuestion.id 
                ? { ...a, selectedOptions: [...a.selectedOptions, optionId] }
                : a
            )
            setAnswers(newAnswers)
          }
        }
      } else {
        // First selection for this question
        setAnswers([...answers, {
          questionId: currentQuestion.id,
          selectedOptions: [optionId]
        }])
      }
    }
  }

  const handleNext = () => {
    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Process quiz answers
      console.log('WorldTree Quiz: Submitting answers', answers)
      
      // Set quiz completion flag so main app doesn't redirect back to quiz
      localStorage.setItem('worldtree_quiz_completed', 'true');
      console.log('✅ 3D Quiz completion flag set in localStorage');
      
      // Call API to save answers
      // await saveQuizAnswers(answers)
      
      if (onComplete) {
        onComplete(answers)
      } else {
        // Default behavior - redirect to tree page
        router.push('/tree')
      }
    } catch (error) {
      console.error('WorldTree Quiz: Error submitting answers', error)
      // Handle error - maybe show error message
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)
  const hasSelection = Boolean(currentAnswer?.selectedOptions?.length && currentAnswer.selectedOptions.length > 0)

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-blue-900 to-black overflow-hidden">
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#00ff88" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#4ecdc4" />
        
        <QuizVisualizer 
          question={currentQuestion}
          currentAnswer={currentAnswer}
          questionIndex={currentQuestionIndex}
          totalQuestions={quizQuestions.length}
        />

        <FloatingParticles count={40} color="#00ff88" radius={8} />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.2} />
        </EffectComposer>
      </Canvas>

      {/* Quiz UI Overlay */}
      <QuizUI 
        question={currentQuestion}
        currentAnswer={currentAnswer}
        onOptionSelect={handleOptionSelect}
        onNext={handleNext}
        onBack={handleBack}
        canGoNext={hasSelection}
        canGoBack={currentQuestionIndex > 0}
        isLastQuestion={isLastQuestion}
        isSubmitting={isSubmitting}
        progress={(currentQuestionIndex + 1) / quizQuestions.length}
      />
    </div>
  )
}

// Enhanced 3D Quiz Visualizer Component
function QuizVisualizer({ 
  question, 
  currentAnswer, 
  questionIndex, 
  totalQuestions 
}: {
  question: typeof quizQuestions[0]
  currentAnswer?: QuizAnswer
  questionIndex: number
  totalQuestions: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [animationPhase, setAnimationPhase] = useState(0)

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
      
      // Subtle animation phase
      const phase = Math.sin(state.clock.elapsedTime * 1.5) * 0.3 + 0.7
      setAnimationPhase(phase)
    }
  })

  // Create organized DNA structure representing the question
  const dnaElements = useMemo(() => {
    return Array.from({ length: question.options.length }).map((_, i) => {
      const angle = (i / question.options.length) * Math.PI * 2
      const radius = 2.5
      const height = Math.sin(i * 0.8) * 1.5
      const isSelected = currentAnswer?.selectedOptions?.includes(question.options[i]?.id) || false
      
      return {
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ] as [number, number, number],
        isSelected,
        index: i,
        option: question.options[i]
      }
    })
  }, [question, currentAnswer])

  return (
    <group ref={groupRef}>
      {/* Central question core */}
      <group position={[0, 0, 0]}>
        <Sphere args={[1.2, 32, 32]}>
        <meshStandardMaterial 
          color="#00ff88" 
          emissive="#00aa55"
            emissiveIntensity={0.4}
            transparent
            opacity={0.9}
        />
      </Sphere>

        {/* Question indicator */}
        <Text
          position={[0, 0, 1.5]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Q{questionIndex + 1}
        </Text>
      </group>

      {/* DNA-like structure with question options */}
      {dnaElements.map((element, i) => (
        <group key={i}>
          {/* Option node */}
          <Sphere
            position={element.position}
            args={[0.2, 16, 16]}
          >
            <meshStandardMaterial 
              color={element.isSelected ? "#FFD700" : "#4ecdc4"}
              emissive={element.isSelected ? "#FFD700" : "#4ecdc4"}
              emissiveIntensity={element.isSelected ? 0.6 : 0.3}
              transparent
              opacity={0.9}
            />
          </Sphere>

          {/* Connection to center */}
          <Line
            points={[
              [0, 0, 0],
              element.position
            ]}
            color={element.isSelected ? "#FFD700" : "#4ecdc4"}
            lineWidth={element.isSelected ? 3 : 1}
                transparent
                opacity={0.6}
              />

          {/* Option label */}
          <Text
            position={[
              element.position[0] * 1.3,
              element.position[1],
              element.position[2] * 1.3
            ]}
            fontSize={0.15}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {element.option.icon}
          </Text>
        </group>
      ))}

      {/* Progress indicator */}
      <group position={[0, -6, 0]}>
      <Text
          fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
          {questionIndex + 1} of {totalQuestions}
      </Text>
        
        {/* Progress dots */}
        <group position={[0, -0.8, 0]}>
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <Sphere
              key={i}
              position={[(i - (totalQuestions - 1) / 2) * 0.4, 0, 0]}
              args={[0.08, 16, 16]}
            >
              <meshStandardMaterial 
                color={i <= questionIndex ? "#00ff88" : "#333333"}
                emissive={i <= questionIndex ? "#00ff88" : "#333333"}
                emissiveIntensity={i <= questionIndex ? 0.3 : 0}
              />
            </Sphere>
          ))}
        </group>
      </group>
    </group>
  )
}

// Enhanced Quiz UI Overlay Component
function QuizUI({
  question,
  currentAnswer,
  onOptionSelect,
  onNext,
  onBack,
  canGoNext,
  canGoBack,
  isLastQuestion,
  isSubmitting,
  progress
}: {
  question: typeof quizQuestions[0]
  currentAnswer?: QuizAnswer
  onOptionSelect: (optionId: string) => void
  onNext: () => void
  onBack: () => void
  canGoNext: boolean
  canGoBack: boolean
  isLastQuestion: boolean
  isSubmitting: boolean
  progress: number
}) {
  return (
    <>
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 pt-4 md:pt-8">
        <div className="flex justify-between items-center mb-2 md:mb-3">
          <div className="text-white text-xs md:text-sm font-medium">
            Question {Math.floor(progress * 5)} of 5
          </div>
          <div className="text-gray-400 text-xs md:text-sm">
            {Math.round(progress * 100)}% Complete
          </div>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="absolute top-16 md:top-24 left-0 right-0 flex flex-col items-center z-20 px-4">
        <div className="max-w-2xl w-full mx-auto text-center">
          {/* Question Header */}
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-4 md:mb-8"
          >
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4 leading-tight break-words">
              {question.question}
            </h2>
            <p className="text-base md:text-xl text-gray-300 max-w-xl mx-auto">
              {question.subtitle}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Options Grid */}
      <div className="absolute left-0 right-0 top-[32vh] md:top-[34vh] z-20 flex flex-col items-center px-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="grid grid-cols-1 gap-4 mb-6">
            {question.options.map((option, index) => {
              const isSelected = currentAnswer?.selectedOptions?.includes(option.id) || false
              const isDisabled = 
                !isSelected && 
                (currentAnswer?.selectedOptions?.length || 0) >= question.maxSelections &&
                question.type === 'multiple'

              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => !isDisabled && onOptionSelect(option.id)}
                  disabled={isDisabled}
                  className={`
                    relative p-5 md:p-6 rounded-2xl text-left transition-all duration-300 border-2 backdrop-blur-sm w-full
                    ${isSelected 
                      ? 'bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-400 text-white shadow-lg shadow-green-500/25' 
                      : isDisabled
                        ? 'bg-gray-800/50 border-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-800/30 border-gray-600 text-white hover:border-green-400 hover:bg-gray-700/50 hover:shadow-lg'
                    }
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl md:text-3xl">{option.icon}</span>
                    <span className="font-medium text-base md:text-lg">{option.label}</span>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-sm">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Selection Counter */}
          {question.type === 'multiple' && (
            <div className="text-center mb-4">
              <div className="inline-block bg-gray-800/50 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-gray-300">
                  {currentAnswer?.selectedOptions?.length || 0} of {question.maxSelections} selected
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center max-w-2xl mx-auto mt-2 mb-4">
            <motion.button
              onClick={onBack}
              disabled={!canGoBack}
              className={`
                px-8 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-sm
                ${canGoBack 
                  ? 'bg-gray-700/50 text-white hover:bg-gray-600/50 border border-gray-600' 
                  : 'bg-gray-800/30 text-gray-500 cursor-not-allowed border border-gray-700'
                }
              `}
            >
              ← Back
            </motion.button>
            <motion.button
              onClick={onNext}
              disabled={!canGoNext || isSubmitting}
              className={`
                px-8 py-3 rounded-full font-medium transition-all duration-300 backdrop-blur-sm
                ${canGoNext && !isSubmitting
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 shadow-lg' 
                  : 'bg-gray-800/30 text-gray-500 cursor-not-allowed border border-gray-700'
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </span>
              ) : isLastQuestion ? (
                'Complete Quiz →'
              ) : (
                'Next →'
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </>
  )
}

// Enhanced Floating Particles Component
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
        size={0.04}
        transparent
        opacity={0.5}
        sizeAttenuation={true}
      />
    </Points>
  )
} 