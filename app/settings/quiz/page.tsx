"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Edit2, Check, X, Brain, User, Globe, Sparkles, Heart, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useUnifiedSession } from '@/hooks/useUnifiedSession';

interface QuizAnswer {
  questionId: string;
  answer: string;
  answeredAt: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  type: string;
  options?: string[];
  category: string;
}

export default function QuizEditPage() {
  const router = useRouter();
  const unifiedSession = useUnifiedSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, QuizAnswer>>({});
  const [questions, setQuestions] = useState<Record<string, QuizQuestion>>({});
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load user's quiz answers
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const userId = unifiedSession.user?.id;
        if (!userId) {
          router.push('/landing');
          return;
        }

        setLoading(true);
        setError(null);

        // Fetch all quiz questions first
        console.log('Fetching quiz questions...');
        const questionsResponse = await fetch('/api/quiz');
        if (!questionsResponse.ok) {
          throw new Error(`Failed to fetch questions: ${questionsResponse.status} ${questionsResponse.statusText}`);
        }
        const questionsData = await questionsResponse.json();
        console.log('Questions data:', questionsData);
        
        // Fetch user's quiz results
        console.log('Fetching user quiz results...');
        const userResponse = await fetch(`/api/user/quiz-results?userId=${userId}`);
        let userData = { results: [] };
        if (userResponse.ok) {
          userData = await userResponse.json();
          console.log('User data:', userData);
        } else {
          console.warn('Failed to fetch user quiz results:', userResponse.status);
        }
        
        const answersMap: Record<string, QuizAnswer> = {};
        const questionsMap: Record<string, QuizQuestion> = {};
        
        // Map all available questions
        if (questionsData?.questions) {
          questionsData.questions.forEach((question: any) => {
            questionsMap[question.id] = {
              id: question.id,
              question: question.question,
              type: question.type,
              options: question.options,
              category: question.category
            };
          });
          console.log('Mapped questions:', Object.keys(questionsMap).length);
        } else {
          console.warn('No questions found in response');
        }
        
        // Map user answers
        if (userData?.results) {
          userData.results.forEach((result: any) => {
            // Handle JSON answers - convert to string if needed
            let answerValue = result.answer;
            if (typeof answerValue === 'object' && answerValue !== null) {
              answerValue = Array.isArray(answerValue) ? answerValue.join(', ') : String(answerValue);
            }
            
            answersMap[result.questionId] = {
              questionId: result.questionId,
              answer: answerValue,
              answeredAt: result.answeredAt
            };
          });
          console.log('Mapped answers:', Object.keys(answersMap).length);
        }
        
        setUserAnswers(answersMap);
        setQuestions(questionsMap);
        
        // Initialize expanded categories
        const categories = Object.values(questionsMap).reduce((acc, q) => {
          acc[q.category] = true; // Start with all expanded
          return acc;
        }, {} as Record<string, boolean>);
        setExpandedCategories(categories);
        
        console.log('Quiz data loaded successfully');
        
      } catch (error) {
        console.error('Error loading quiz data:', error);
        setError(`Failed to load quiz data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (unifiedSession.status !== 'loading') {
      loadQuizData();
    }
  }, [unifiedSession.status, unifiedSession.user?.id, router]);

  const handleEdit = (questionId: string) => {
    setEditingQuestion(questionId);
    setEditValues({ ...editValues, [questionId]: userAnswers[questionId]?.answer || '' });
  };

  const handleSave = async (questionId: string) => {
    setSaving(true);
    setError(null);
    
    try {
      const userId = unifiedSession.user?.id;
      if (!userId) return;

      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          answers: [{
            questionId,
            answer: editValues[questionId],
            score: 1
          }]
        }),
      });

      if (response.ok) {
        // Update local state
        setUserAnswers({
          ...userAnswers,
          [questionId]: {
            questionId,
            answer: editValues[questionId],
            answeredAt: new Date().toISOString()
          }
        });
        setEditingQuestion(null);
        setSuccess('Answer updated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to save answer');
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      setError('Failed to save answer');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (questionId: string) => {
    setEditingQuestion(null);
    setEditValues({ ...editValues, [questionId]: userAnswers[questionId]?.answer || '' });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  const renderAnswerInput = (question: QuizQuestion, currentAnswer: string) => {
    const questionId = question.id;
    
    if (question.type === 'MULTIPLE_CHOICE') {
      return (
        <select
          value={editValues[questionId] || currentAnswer}
          onChange={(e) => setEditValues({ ...editValues, [questionId]: e.target.value })}
          className="w-full p-4 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 bg-white shadow-sm transition-all"
        >
          <option value="">Select an option</option>
          {question.options?.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (question.type === 'MULTI_SELECT') {
      const selectedOptions = (editValues[questionId] || currentAnswer).split(', ').filter(Boolean);
      
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <motion.label
              key={option}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer border border-gray-200"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(option)}
                onChange={(e) => {
                  let newSelected = [...selectedOptions];
                  if (e.target.checked) {
                    newSelected.push(option);
                  } else {
                    newSelected = newSelected.filter(item => item !== option);
                  }
                  setEditValues({ ...editValues, [questionId]: newSelected.join(', ') });
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">{option}</span>
            </motion.label>
          ))}
        </div>
      );
    }

    if (question.type === 'SCALE') {
      const scaleValue = parseInt(editValues[questionId] || currentAnswer || '1');
      return (
        <div className="space-y-3">
          <input
            type="range"
            min="1"
            max="10"
            value={scaleValue}
            onChange={(e) => setEditValues({ ...editValues, [questionId]: e.target.value })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">1 (Low)</span>
            <span className="text-lg font-bold text-indigo-600">{scaleValue}</span>
            <span className="text-sm text-gray-500">10 (High)</span>
          </div>
        </div>
      );
    }

    if (question.type === 'BOOLEAN') {
      return (
        <div className="flex gap-4">
          {['Yes', 'No'].map((option) => (
            <button
              key={option}
              onClick={() => setEditValues({ ...editValues, [questionId]: option })}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                (editValues[questionId] || currentAnswer) === option
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      );
    }

    // Default to text input
    return (
      <textarea
        value={editValues[questionId] || currentAnswer}
        onChange={(e) => setEditValues({ ...editValues, [questionId]: e.target.value })}
        className="w-full p-4 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none h-24 shadow-sm transition-all"
        placeholder="Enter your answer"
      />
    );
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600">Loading your quiz responses...</p>
      </div>
    );
  }

  const questionCategories = {
    'preferences': {
      name: 'Interests & Preferences',
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'from-pink-50 to-pink-100'
    },
    'demographics': {
      name: 'Personal Information',
      icon: User,
      color: 'text-blue-500',
      bgColor: 'from-blue-50 to-blue-100'
    },
    'social': {
      name: 'Social Platforms',
      icon: Globe,
      color: 'text-green-500',
      bgColor: 'from-green-50 to-green-100'
    },
    'use_cases': {
      name: 'AI Use Cases',
      icon: Brain,
      color: 'text-purple-500',
      bgColor: 'from-purple-50 to-purple-100'
    },
    'experience': {
      name: 'Experience Level',
      icon: Sparkles,
      color: 'text-indigo-500',
      bgColor: 'from-indigo-50 to-indigo-100'
    },
    'learning': {
      name: 'Learning Preferences',
      icon: BookOpen,
      color: 'text-orange-500',
      bgColor: 'from-orange-50 to-orange-100'
    }
  };

  return (
    <motion.div
      className="p-4 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded hover:bg-indigo-200 focus:ring-2 focus:ring-indigo-400 transition flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
      >
        <ArrowLeft className="w-5 h-5" /> Back to Settings
      </motion.button>

      <motion.h1
        className="text-3xl font-bold mb-2 text-indigo-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        Edit Quiz Responses
      </motion.h1>

      <motion.p
        className="text-gray-600 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        Update your preferences to get better AI tool recommendations tailored to your needs
      </motion.p>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-xl"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {Object.entries(questionCategories).map(([category, categoryInfo]) => {
        const categoryQuestions = Object.values(questions).filter(q => q.category === category);
        
        if (categoryQuestions.length === 0) return null;

        const isExpanded = expandedCategories[category];
        const IconComponent = categoryInfo.icon;

        return (
          <motion.div
            key={category}
            className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.button
              onClick={() => toggleCategory(category)}
              className={`w-full p-6 bg-gradient-to-r ${categoryInfo.bgColor} flex items-center justify-between hover:shadow-md transition-all`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center ${categoryInfo.color} shadow-sm`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-bold text-gray-900">{categoryInfo.name}</h2>
                  <p className="text-sm text-gray-600">{categoryQuestions.length} questions</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-6 h-6 text-gray-500" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="p-6 space-y-6">
                    {categoryQuestions.map((question, index) => {
                      const answer = userAnswers[question.id];
                      const isEditing = editingQuestion === question.id;
                      
                      return (
                        <motion.div
                          key={question.id}
                          className="border-2 border-gray-100 rounded-xl p-5 hover:border-indigo-200 transition-all"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold text-gray-900 text-lg leading-relaxed">
                              {question.question}
                            </h3>
                            {!isEditing && (
                              <motion.button
                                onClick={() => handleEdit(question.id)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Edit2 className="w-5 h-5" />
                              </motion.button>
                            )}
                          </div>

                          <AnimatePresence>
                            {isEditing ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                              >
                                {renderAnswerInput(question, answer?.answer || '')}
                                
                                <div className="flex gap-3">
                                  <motion.button
                                    onClick={() => handleSave(question.id)}
                                    disabled={saving}
                                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    {saving ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                    Save
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleCancel(question.id)}
                                    className="px-6 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all flex items-center gap-2"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <X className="w-4 h-4" />
                                    Cancel
                                  </motion.button>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4"
                              >
                                <p className="text-gray-700 font-medium">
                                  {answer?.answer || (
                                    <span className="text-gray-500 italic">No answer provided yet</span>
                                  )}
                                </p>
                                {answer?.answeredAt && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Last updated: {new Date(answer.answeredAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {Object.keys(questions).length === 0 && (
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
            <Brain className="w-10 h-10 text-indigo-500" />
          </div>
          <p className="text-gray-600 mb-4 text-lg">No quiz responses found.</p>
          <p className="text-gray-500 mb-6">Take our AI preferences quiz to get personalized recommendations.</p>
          <motion.button
            onClick={() => router.push('/quiz')}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all font-semibold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Take the Quiz
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
} 