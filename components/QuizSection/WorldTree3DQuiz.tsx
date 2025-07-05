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
        
        <QuizVisualizer 
          question={currentQuestion}
          currentAnswer={currentAnswer}
          questionIndex={currentQuestionIndex}
          totalQuestions={quizQuestions.length}
        />

        <FloatingParticles count={80} color="#ffffff" />

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

// 3D Quiz Visualizer Component
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
      // Base rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
      
      // Animate phase changes
      const phase = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5
      setAnimationPhase(phase)
    }
  })

  // Create DNA-like helix for current question
  const helixElements = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const y = (i - 15) * 0.4
      const angle = (i / 30) * Math.PI * 4
      const radius = 3
      const isSelected = currentAnswer?.selectedOptions?.includes(question.options[i % question.options.length]?.id) || false
      
      return {
        position: [
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ] as [number, number, number],
        isSelected,
        index: i
      }
    })
  }, [question, currentAnswer])

  return (
    <group ref={groupRef}>
      {/* Central core representing the question */}
      <Sphere args={[1.5, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#00ff88" 
          emissive="#00aa55"
          emissiveIntensity={0.3 + animationPhase * 0.2}
        />
      </Sphere>

      {/* DNA-like helix structure */}
      {helixElements.map((element, i) => (
        <group key={i}>
          <Sphere
            position={element.position}
            args={[0.15, 12, 12]}
          >
            <meshStandardMaterial 
              color={element.isSelected ? "#FFD700" : "#ff6b9d"}
              emissive={element.isSelected ? "#FFD700" : "#ff6b9d"}
              emissiveIntensity={element.isSelected ? 0.6 : 0.3}
              transparent
              opacity={0.8}
            />
          </Sphere>

          {/* Connection lines */}
          {i < helixElements.length - 1 && (
            <Cylinder
              position={[
                (element.position[0] + helixElements[i + 1].position[0]) / 2,
                (element.position[1] + helixElements[i + 1].position[1]) / 2,
                (element.position[2] + helixElements[i + 1].position[2]) / 2
              ]}
              args={[0.02, 0.02, 0.4]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial 
                color="#4ecdc4" 
                emissive="#4ecdc4"
                emissiveIntensity={0.2}
                transparent
                opacity={0.6}
              />
            </Cylinder>
          )}
        </group>
      ))}

      {/* Progress indicator */}
      <Text
        position={[0, -8, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {questionIndex + 1} / {totalQuestions}
      </Text>
    </group>
  )
}

// Quiz UI Overlay Component
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
      <div className="absolute top-4 left-4 right-4 z-20">
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
      <div className="absolute inset-0 flex flex-col justify-center items-center p-4 z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {question.question}
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              {question.subtitle}
            </p>
          </motion.div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8 max-h-96 overflow-y-auto">
            {question.options.map((option, index) => {
              const isSelected = currentAnswer?.selectedOptions?.includes(option.id) || false
              const isDisabled = 
                !isSelected && 
                (currentAnswer?.selectedOptions?.length || 0) >= question.maxSelections &&
                question.type === 'multiple'

              return (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => !isDisabled && onOptionSelect(option.id)}
                  disabled={isDisabled}
                  className={`
                    p-4 rounded-xl text-left transition-all duration-300 border-2
                    ${isSelected 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 border-green-400 text-white' 
                      : isDisabled
                        ? 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-800 border-gray-600 text-white hover:border-green-400 hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center max-w-md mx-auto">
            <button
              onClick={onBack}
              disabled={!canGoBack}
              className={`
                px-6 py-3 rounded-full font-medium transition-all duration-300
                ${canGoBack 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              ← Back
            </button>

            <div className="text-gray-400 text-sm">
              {question.type === 'multiple' && (
                <span>
                  {currentAnswer?.selectedOptions?.length || 0} / {question.maxSelections} selected
                </span>
              )}
            </div>

            <button
              onClick={onNext}
              disabled={!canGoNext || isSubmitting}
              className={`
                px-6 py-3 rounded-full font-medium transition-all duration-300
                ${canGoNext && !isSubmitting
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
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
            </button>
          </div>
        </div>
      </div>
    </>
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