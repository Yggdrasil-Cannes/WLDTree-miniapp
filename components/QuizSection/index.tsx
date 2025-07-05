"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MiniKit } from '@worldcoin/minikit-js';
import { useUnifiedSession } from '@/hooks/useUnifiedSession';


// Quiz step definitions
const quizSteps: QuizStep[] = [
  {
    key: 'heritage_interests',
    title: "What aspects of your heritage intrigue you most?",
    subtitle: "(Choose up to 3)",
    type: 'multi',
    max: 3,
    options: [
      { label: "DNA & Genetics", icon: "🧬" },
      { label: "Family Stories", icon: "📖" },
      { label: "Historical Records", icon: "📜" },
      { label: "Geographic Origins", icon: "🌍" },
      { label: "Cultural Traditions", icon: "🎭" },
      { label: "Military History", icon: "🎖️" },
      { label: "Other", icon: "✨", isOther: true },
    ],
  },
  {
    key: 'location',
    title: "Where do you currently live?",
    subtitle: "This helps us find regional records and connections",
    type: 'dropdown',
    options: [
      // Sort all countries alphabetically
      { label: "Afghanistan", tribe: "Asian" },
      { label: "Albania", tribe: "European" },
      { label: "Algeria", tribe: "African" },
      { label: "Andorra", tribe: "European" },
      { label: "Angola", tribe: "African" },
      { label: "Antigua and Barbuda", tribe: "North American" },
      { label: "Argentina", tribe: "LATAM" },
      { label: "Armenia", tribe: "European" },
      { label: "Australia", tribe: "Oceanic" },
      { label: "Austria", tribe: "European" },
      { label: "Azerbaijan", tribe: "European" },
      { label: "Bahamas", tribe: "North American" },
      { label: "Bahrain", tribe: "Middle Eastern" },
      { label: "Bangladesh", tribe: "Asian" },
      { label: "Barbados", tribe: "North American" },
      { label: "Belarus", tribe: "European" },
      { label: "Belgium", tribe: "European" },
      { label: "Belize", tribe: "North American" },
      { label: "Benin", tribe: "African" },
      { label: "Bhutan", tribe: "Asian" },
      { label: "Bolivia", tribe: "LATAM" },
      { label: "Bosnia and Herzegovina", tribe: "European" },
      { label: "Botswana", tribe: "African" },
      { label: "Brazil", tribe: "LATAM" },
      { label: "Brunei", tribe: "Asian" },
      { label: "Bulgaria", tribe: "European" },
      { label: "Burkina Faso", tribe: "African" },
      { label: "Burundi", tribe: "African" },
      { label: "Cabo Verde", tribe: "African" },
      { label: "Cambodia", tribe: "Asian" },
      { label: "Cameroon", tribe: "African" },
      { label: "Canada", tribe: "North American" },
      { label: "Central African Republic", tribe: "African" },
      { label: "Chad", tribe: "African" },
      { label: "Chile", tribe: "LATAM" },
      { label: "China", tribe: "Asian" },
      { label: "Colombia", tribe: "LATAM" },
      { label: "Comoros", tribe: "African" },
      { label: "Congo", tribe: "African" },
      { label: "Costa Rica", tribe: "North American" },
      { label: "Croatia", tribe: "European" },
      { label: "Cuba", tribe: "North American" },
      { label: "Cyprus", tribe: "European" },
      { label: "Czech Republic", tribe: "European" },
      { label: "Democratic Republic of the Congo", tribe: "African" },
      { label: "Denmark", tribe: "European" },
      { label: "Djibouti", tribe: "African" },
      { label: "Dominica", tribe: "North American" },
      { label: "Dominican Republic", tribe: "North American" },
      { label: "Ecuador", tribe: "LATAM" },
      { label: "Egypt", tribe: "African" },
      { label: "El Salvador", tribe: "North American" },
      { label: "Equatorial Guinea", tribe: "African" },
      { label: "Eritrea", tribe: "African" },
      { label: "Estonia", tribe: "European" },
      { label: "Eswatini", tribe: "African" },
      { label: "Ethiopia", tribe: "African" },
      { label: "Fiji", tribe: "Oceanic" },
      { label: "Finland", tribe: "European" },
      { label: "France", tribe: "European" },
      { label: "Gabon", tribe: "African" },
      { label: "Gambia", tribe: "African" },
      { label: "Georgia", tribe: "European" },
      { label: "Germany", tribe: "European" },
      { label: "Ghana", tribe: "African" },
      { label: "Greece", tribe: "European" },
      { label: "Grenada", tribe: "North American" },
      { label: "Guatemala", tribe: "North American" },
      { label: "Guinea", tribe: "African" },
      { label: "Guinea-Bissau", tribe: "African" },
      { label: "Guyana", tribe: "LATAM" },
      { label: "Haiti", tribe: "North American" },
      { label: "Honduras", tribe: "North American" },
      { label: "Hungary", tribe: "European" },
      { label: "Iceland", tribe: "European" },
      { label: "India", tribe: "Asian" },
      { label: "Indonesia", tribe: "Asian" },
      { label: "Iran", tribe: "Middle Eastern" },
      { label: "Iraq", tribe: "Middle Eastern" },
      { label: "Ireland", tribe: "European" },
      { label: "Israel", tribe: "Middle Eastern" },
      { label: "Italy", tribe: "European" },
      { label: "Ivory Coast", tribe: "African" },
      { label: "Jamaica", tribe: "North American" },
      { label: "Japan", tribe: "Asian" },
      { label: "Jordan", tribe: "Middle Eastern" },
      { label: "Kazakhstan", tribe: "Asian" },
      { label: "Kenya", tribe: "African" },
      { label: "Kiribati", tribe: "Oceanic" },
      { label: "Kuwait", tribe: "Middle Eastern" },
      { label: "Kyrgyzstan", tribe: "Asian" },
      { label: "Laos", tribe: "Asian" },
      { label: "Latvia", tribe: "European" },
      { label: "Lebanon", tribe: "Middle Eastern" },
      { label: "Lesotho", tribe: "African" },
      { label: "Liberia", tribe: "African" },
      { label: "Libya", tribe: "African" },
      { label: "Liechtenstein", tribe: "European" },
      { label: "Lithuania", tribe: "European" },
      { label: "Luxembourg", tribe: "European" },
      { label: "Madagascar", tribe: "African" },
      { label: "Malawi", tribe: "African" },
      { label: "Malaysia", tribe: "Asian" },
      { label: "Maldives", tribe: "Asian" },
      { label: "Mali", tribe: "African" },
      { label: "Malta", tribe: "European" },
      { label: "Marshall Islands", tribe: "Oceanic" },
      { label: "Mauritania", tribe: "African" },
      { label: "Mauritius", tribe: "African" },
      { label: "Mexico", tribe: "North American" },
      { label: "Micronesia", tribe: "Oceanic" },
      { label: "Moldova", tribe: "European" },
      { label: "Monaco", tribe: "European" },
      { label: "Mongolia", tribe: "Asian" },
      { label: "Montenegro", tribe: "European" },
      { label: "Morocco", tribe: "African" },
      { label: "Mozambique", tribe: "African" },
      { label: "Myanmar", tribe: "Asian" },
      { label: "Namibia", tribe: "African" },
      { label: "Nauru", tribe: "Oceanic" },
      { label: "Nepal", tribe: "Asian" },
      { label: "Netherlands", tribe: "European" },
      { label: "New Zealand", tribe: "Oceanic" },
      { label: "Nicaragua", tribe: "North American" },
      { label: "Niger", tribe: "African" },
      { label: "Nigeria", tribe: "African" },
      { label: "North Korea", tribe: "Asian" },
      { label: "North Macedonia", tribe: "European" },
      { label: "Norway", tribe: "European" },
      { label: "Oman", tribe: "Middle Eastern" },
      { label: "Pakistan", tribe: "Asian" },
      { label: "Palau", tribe: "Oceanic" },
      { label: "Palestine", tribe: "Middle Eastern" },
      { label: "Panama", tribe: "North American" },
      { label: "Papua New Guinea", tribe: "Oceanic" },
      { label: "Paraguay", tribe: "LATAM" },
      { label: "Peru", tribe: "LATAM" },
      { label: "Philippines", tribe: "Asian" },
      { label: "Poland", tribe: "European" },
      { label: "Portugal", tribe: "European" },
      { label: "Qatar", tribe: "Middle Eastern" },
      { label: "Romania", tribe: "European" },
      { label: "Russia", tribe: "European" },
      { label: "Rwanda", tribe: "African" },
      { label: "Saint Kitts and Nevis", tribe: "North American" },
      { label: "Saint Lucia", tribe: "North American" },
      { label: "Saint Vincent and the Grenadines", tribe: "North American" },
      { label: "Samoa", tribe: "Oceanic" },
      { label: "San Marino", tribe: "European" },
      { label: "São Tomé and Príncipe", tribe: "African" },
      { label: "Saudi Arabia", tribe: "Middle Eastern" },
      { label: "Senegal", tribe: "African" },
      { label: "Serbia", tribe: "European" },
      { label: "Seychelles", tribe: "African" },
      { label: "Sierra Leone", tribe: "African" },
      { label: "Singapore", tribe: "Asian" },
      { label: "Slovakia", tribe: "European" },
      { label: "Slovenia", tribe: "European" },
      { label: "Solomon Islands", tribe: "Oceanic" },
      { label: "Somalia", tribe: "African" },
      { label: "South Africa", tribe: "African" },
      { label: "South Korea", tribe: "Asian" },
      { label: "South Sudan", tribe: "African" },
      { label: "Spain", tribe: "European" },
      { label: "Sri Lanka", tribe: "Asian" },
      { label: "Sudan", tribe: "African" },
      { label: "Suriname", tribe: "LATAM" },
      { label: "Sweden", tribe: "European" },
      { label: "Switzerland", tribe: "European" },
      { label: "Syria", tribe: "Middle Eastern" },
      { label: "Tajikistan", tribe: "Asian" },
      { label: "Tanzania", tribe: "African" },
      { label: "Thailand", tribe: "Asian" },
      { label: "Timor-Leste", tribe: "Asian" },
      { label: "Togo", tribe: "African" },
      { label: "Tonga", tribe: "Oceanic" },
      { label: "Trinidad and Tobago", tribe: "North American" },
      { label: "Tunisia", tribe: "African" },
      { label: "Turkey", tribe: "European" },
      { label: "Turkmenistan", tribe: "Asian" },
      { label: "Tuvalu", tribe: "Oceanic" },
      { label: "Uganda", tribe: "African" },
      { label: "Ukraine", tribe: "European" },
      { label: "United Arab Emirates", tribe: "Middle Eastern" },
      { label: "United Kingdom", tribe: "European" },
      { label: "United States", tribe: "North American" },
      { label: "Uruguay", tribe: "LATAM" },
      { label: "Uzbekistan", tribe: "Asian" },
      { label: "Vanuatu", tribe: "Oceanic" },
      { label: "Vatican City", tribe: "European" },
      { label: "Venezuela", tribe: "LATAM" },
      { label: "Vietnam", tribe: "SEA" },
      { label: "Yemen", tribe: "Middle Eastern" },
      { label: "Zambia", tribe: "African" },
      { label: "Zimbabwe", tribe: "African" },
    ],
  },
  {
    key: 'age',
    title: "How old are you?",
    type: 'radio',
    options: [
      { label: "13–17" },
      { label: "18–24" },
      { label: "25–34" },
      { label: "35–44" },
      { label: "45–60" },
      { label: "60+" },
    ],
  },
  {
    key: 'genealogy_platforms',
    title: "Which genealogy platforms have you used?",
    subtitle: "(Choose up to 3)",
    type: 'multi',
    max: 3,
    options: [
      { label: "Ancestry.com", icon: "🌳" },
      { label: "MyHeritage", icon: "🧬" },
      { label: "FamilySearch", icon: "⛪" },
      { label: "23andMe", icon: "🧪" },
      { label: "AncestryDNA", icon: "🔬" },
      { label: "FindMyPast", icon: "📋" },
      { label: "None yet", icon: "🌱" },
      { label: "Other", icon: "✨", isOther: true },
    ],
  },
  {
    key: 'genealogy_goals',
    title: "What family tree goals do you have?",
    subtitle: "(Choose up to 5)",
    type: 'multi',
    max: 5,
    options: [
      { label: "Build complete family tree", icon: "🌳" },
      { label: "Find living relatives", icon: "👥" },
      { label: "Trace ethnic origins", icon: "🌍" },
      { label: "Research family stories", icon: "📚" },
      { label: "DNA analysis & matching", icon: "🧬" },
      { label: "Historical record research", icon: "📜" },
      { label: "Preserve family photos", icon: "📸" },
      { label: "Connect with distant cousins", icon: "🤝" },
      { label: "Military service research", icon: "🎖️" },
      { label: "Other", icon: "🧩", isOther: true },
    ],
  },
  {
    key: 'genealogy_experience',
    title: "What's your genealogy research experience?",
    subtitle: "Let's Personalize Your Heritage Journey",
    type: 'single',
    options: [
      { label: "Complete Beginner", icon: "🌱", desc: "Just getting started" },
      { label: "Some Experience", icon: "📖", desc: "Done basic research" },
      { label: "Intermediate", icon: "🔍", desc: "Regular researcher" },
      { label: "Advanced", icon: "🏆", desc: "Experienced genealogist" },
      { label: "DNA Expert", icon: "🧬", desc: "Genetics specialist" },
    ],
  },
  {
    key: 'genealogy_budget',
    title: "What's your monthly budget for genealogy research?",
    subtitle: "Help us recommend the right heritage tools for you",
    type: 'single',
    options: [
      { label: "Free only", icon: "💰", desc: "I prefer free resources" },
      { label: "$1 - $25", icon: "💵", desc: "Basic genealogy tools" },
      { label: "$26 - $50", icon: "💳", desc: "DNA tests & records" },
      { label: "$51 - $100", icon: "🏦", desc: "Professional research" },
      { label: "$100+", icon: "💎", desc: "Expert genealogy services" },
      { label: "Not sure yet", icon: "🤔", desc: "Still exploring" },
    ],
  },
];

// Add types for quiz steps and options
interface QuizOption {
  label: string;
  icon?: string;
  desc?: string;
  isOther?: boolean;
  tribe?: string;
}
interface QuizStep {
  key: string;
  title: string;
  subtitle?: string;
  type: 'multi' | 'dropdown' | 'radio' | 'single' | 'country_grid';
  max?: number;
  options: QuizOption[];
}

export function QuizSection({ onQuizComplete }: { onQuizComplete?: () => void } = {}) {
  const unifiedSession = useUnifiedSession();

  const [showIntro, setShowIntro] = useState(true); // NEW: Show intro page first
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [otherInputs, setOtherInputs] = useState<Record<string, any>>({});
  const [selectedTribe, setSelectedTribe] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [showMintSuccess, setShowMintSuccess] = useState(false);
  const [showAlreadyMinted, setShowAlreadyMinted] = useState(false);
  const [mintResult, setMintResult] = useState<any>(null);
  const [badgeStatus, setBadgeStatus] = useState<any>(null);
  const [showEmailCollection, setShowEmailCollection] = useState(false); // NEW: Show email collection after quiz
  const [userEmail, setUserEmail] = useState(''); // NEW: Store user email

  const router = useRouter();

  // Get user ID from session, localStorage, or generate guest ID
  const getUserId = () => {
    const userId = unifiedSession.user?.id || localStorage.getItem('worldcoin_user_id');
    if (!userId) {
      // Generate a guest ID for users who continue as guest
      const guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      console.log('Generated guest ID:', guestId);
      return guestId;
    }
    return userId;
  };

  // Check badge status
  const checkBadgeStatus = async () => {
    try {
      const worldcoinId = unifiedSession.user?.worldcoinId;
      if (!worldcoinId) return null;

      const response = await fetch(`/api/user/badge-status?worldcoinId=${worldcoinId}`);
      if (response.ok) {
        const status = await response.json();
        setBadgeStatus(status);
        return status;
      }
    } catch (error) {
      console.error('Error checking badge status:', error);
    }
    return null;
  };

  // Country grid selection handler
  const handleCountrySelect = (option: QuizOption, step: QuizStep) => {
    setAnswers({ ...answers, [step.key]: option.label });
    if (option.tribe) {
      setSelectedTribe(option.tribe);
    }
  };

  // --- Refactored 'Other' logic for all step types ---
  // Multi-select
  const handleMultiSelect = (option: QuizOption, step: QuizStep) => {
    let prev = (answers[step.key] as string[]) || [];
    let updated;
    if (option.isOther) {
      // If already selected, deselect and clear input
      if (prev.some(v => v === otherInputs[step.key] || v === 'Other')) {
        updated = prev.filter((l: string) => l !== otherInputs[step.key] && l !== 'Other');
        setOtherInputs({ ...otherInputs, [step.key]: '' });
      } else {
        updated = [...prev, 'Other'];
      }
    } else {
      if (prev.includes(option.label)) {
        updated = prev.filter((l: string) => l !== option.label);
      } else if (prev.length < (step.max || 1)) {
        updated = [...prev, option.label];
      } else {
        updated = prev;
      }
    }
    setAnswers({ ...answers, [step.key]: updated });
  };

  // Single select (radio or single card)
  const handleSingleSelect = (option: QuizOption, step: QuizStep) => {
    if (option.isOther) {
      setAnswers({ ...answers, [step.key]: 'Other' });
    } else {
      setAnswers({ ...answers, [step.key]: option.label });
    }
  };

  // Dropdown
  const handleDropdown = (e: React.ChangeEvent<HTMLSelectElement>, step: QuizStep) => {
    const value = e.target.value;
    setAnswers({ ...answers, [step.key]: value });
  };

  // 'Other' input for all types
  const handleOtherInput = (e: React.ChangeEvent<HTMLInputElement>, step: QuizStep) => {
    setOtherInputs({ ...otherInputs, [step.key]: e.target.value });
    if (step.type === 'multi') {
      let prev = (answers[step.key] as string[]) || [];
      // Replace any previous custom value for 'Other' with the new value
      let filtered = prev.filter((l: string) => l !== otherInputs[step.key] && l !== 'Other');
      if (e.target.value) {
        setAnswers({ ...answers, [step.key]: [...filtered, e.target.value] });
      } else {
        setAnswers({ ...answers, [step.key]: filtered });
      }
    } else {
      setAnswers({ ...answers, [step.key]: e.target.value });
    }
  };

  // --- Progress indicator (step dots) ---
  const renderProgress = () => (
    <div className="flex justify-center gap-2 mb-4">
      {quizSteps.map((_, idx) => (
        <span
          key={idx}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentStep ? 'bg-gradient-to-r from-indigo-500 to-purple-400 shadow-lg scale-125' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );

  // --- UI for each step ---
  const renderStep = (step: QuizStep, idx: number) => {
    if (step.key === 'location') {
      const value = answers[step.key] || '';
      const city = answers['city'] || '';
      const selectedOption = step.options.find(opt => opt.label === value);
      const tribe = selectedOption?.tribe || '';
      
        return (
        <div className="space-y-4">
            <select
            className="w-full p-3 border-2 border-indigo-300 rounded-xl text-lg focus:ring-2 focus:ring-indigo-400 bg-white"
            value={value}
            onChange={(e) => {
              const selected = step.options.find(opt => opt.label === e.target.value);
              setAnswers({ ...answers, [step.key]: e.target.value });
              if (selected?.tribe) {
                setSelectedTribe(selected.tribe);
              }
            }}
            >
            <option value="" disabled>Select your country</option>
            {step.options.map((option) => (
              <option key={option.label} value={option.label}>{option.label}</option>
              ))}
            </select>
          
                  <input
                    type="text"
            className="w-full p-3 border-2 border-indigo-300 rounded-xl text-lg focus:ring-2 focus:ring-indigo-400"
            placeholder="Enter your city"
            value={city || ''}
            onChange={(e) => setAnswers({ ...answers, city: e.target.value })}
          />
          
          {selectedTribe && value && city && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 border border-green-200 rounded-xl text-center"
            >
              <p className="text-green-800 font-semibold">
                Welcome to the {selectedTribe} Heritage Community! 🎉
              </p>
            </motion.div>
          )}
          </div>
        );
    }
    if (step.type === 'multi') {
      const selected: string[] = answers[step.key] || [];
      const isDisabled = step.max !== undefined ? (selected.length >= step.max) : false;
      const otherSelected = selected.includes('Other') || selected.some(v => v === otherInputs[step.key]);
        return (
          <div className="space-y-2">
          {step.options.map((option: QuizOption) => (
              <motion.button
              key={option.label}
                type="button"
                whileTap={{ scale: 0.97 }}
              onClick={() => handleMultiSelect(option, step)}
              className={`w-full p-4 text-left text-gray-700 bg-white border rounded-xl transition-colors font-semibold text-lg shadow-sm ${selected.includes(option.label) || (option.isOther && otherSelected) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'}`}
              disabled={isDisabled && !selected.includes(option.label) && !option.isOther}
              style={{ cursor: isDisabled && !selected.includes(option.label) && !option.isOther ? 'not-allowed' : 'pointer' }}
              >
              <div className="flex items-center gap-3">
                  {option.icon && <span className="text-2xl">{option.icon}</span>}
                <div className="flex-1">
                  <span>{option.label}</span>
                  {option.desc && <div className="text-xs text-gray-500 mt-1">{option.desc}</div>}
                </div>
                {(selected.includes(option.label) || (option.isOther && otherSelected)) && <span className="ml-auto text-indigo-600 font-bold">✓</span>}
              </div>
            </motion.button>
          ))}
          {/* Show input if 'Other' is selected */}
          {step.options.some((o: QuizOption) => o.isOther) && otherSelected && (
            <motion.input
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
                    type="text"
              className="w-full mt-2 p-3 border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
                    placeholder="Please specify..."
              value={otherInputs[step.key] || ''}
              onChange={e => handleOtherInput(e, step)}
            />
          )}
        </div>
      );
    }
    if (step.type === 'dropdown') {
      const value = answers[step.key] || '';
      const otherSelected = value === 'Other' || value === otherInputs[step.key];
      return (
        <div>
          <select
            className="w-full p-3 border-2 border-indigo-300 rounded-xl text-lg focus:ring-2 focus:ring-indigo-400 bg-white"
            value={otherSelected ? 'Other' : value}
            onChange={e => handleDropdown(e, step)}
          >
            <option value="" disabled>Select your country</option>
            {step.options.map((option: QuizOption) => (
              <option key={option.label} value={option.label}>{option.label}</option>
            ))}
          </select>
          {/* Show input if 'Other' is selected */}
          {otherSelected && (
            <motion.input
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              type="text"
              className="w-full mt-2 p-3 border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
              placeholder="Please specify..."
              value={otherInputs[step.key] || ''}
              onChange={e => handleOtherInput(e, step)}
            />
          )}
          </div>
        );
      }
    if (step.type === 'radio') {
      const value = answers[step.key] || '';
      const otherSelected = value === 'Other' || value === otherInputs[step.key];
        return (
          <div className="space-y-2">
          {step.options.map((option: QuizOption) => (
            <motion.label
              key={option.label}
                whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer text-lg font-semibold transition-colors ${value === option.label || (option.isOther && otherSelected) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'}`}
              >
                  <input
                type="radio"
                name={step.key}
                value={option.label}
                checked={value === option.label || (option.isOther && otherSelected)}
                onChange={() => handleSingleSelect(option, step)}
                className="accent-indigo-500 w-5 h-5"
              />
              <span>{option.label}</span>
            </motion.label>
          ))}
          {/* Show input if 'Other' is selected */}
          {otherSelected && (
            <motion.input
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
                    type="text"
              className="w-full mt-2 p-3 border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
                    placeholder="Please specify..."
              value={otherInputs[step.key] || ''}
              onChange={e => handleOtherInput(e, step)}
                  />
                )}
          </div>
        );
      }
    if (step.type === 'single') {
      const value = answers[step.key] || '';
      const otherSelected = value === 'Other' || value === otherInputs[step.key];
        return (
        <div className="space-y-2">
          {step.options.map((option: QuizOption) => (
            <motion.button
              key={option.label}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSingleSelect(option, step)}
              className={`w-full p-4 text-left text-gray-700 bg-white border-2 rounded-xl flex items-center gap-3 transition-colors font-semibold text-lg shadow-sm ${value === option.label || (option.isOther && otherSelected) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50'}`}
            >
              {option.icon && <span className="text-2xl">{option.icon}</span>}
              <span className="flex-1">{option.label}</span>
              {option.desc && <span className="text-xs text-gray-500">{option.desc}</span>}
              {(value === option.label || (option.isOther && otherSelected)) && <span className="ml-auto text-indigo-600 font-bold">✓</span>}
            </motion.button>
          ))}
          {/* Show input if 'Other' is selected */}
          {otherSelected && (
            <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              type="text"
              className="w-full mt-2 p-3 border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-400 text-lg"
              placeholder="Please specify..."
              value={otherInputs[step.key] || ''}
              onChange={e => handleOtherInput(e, step)}
            />
            )}
          </div>
        );
      }
        return null;
  };

  // --- Validation for next button ---
  const canProceed = () => {
    const step = quizSteps[currentStep];
    const currentAnswers = answers[step.key];

    if (!currentAnswers) return false;

    switch (step.type) {
      case 'multi':
        return currentAnswers.length > 0;
      case 'dropdown':
        // Make city required for location step
    if (step.key === 'location') {
          return currentAnswers && answers.city && currentAnswers.trim() !== '' && answers.city.trim() !== '';
    }
        return currentAnswers;
      case 'radio':
      case 'single':
        return currentAnswers.length > 0;
      default:
    return false;
    }
  };

  // Previous step - NEW: Add back navigation
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Next step
  const handleNext = async () => {
    if (currentStep === quizSteps.length - 1) {
      // NEW: Show email collection page instead of reveal screen
      setShowEmailCollection(true);
      
      // Save quiz answers to database in the background
      try {
        const userId = getUserId();
        console.log('User ID:', userId);

        if (userId) {
        // Format answers for database
        const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
            answer: Array.isArray(answer) ? answer.join(', ') : String(answer),
            score: 1
        }));

          console.log('Formatted answers:', formattedAnswers);

        // Save to database
        const response = await fetch('/api/quiz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            answers: formattedAnswers
          }),
        });

          if (response.ok) {
            console.log('Quiz answers saved successfully');
          } else {
            const errorData = await response.text();
            console.error('Failed to save quiz answers:', errorData);
        }
        } else {
          console.log('No user ID found - skipping database save');
        }
      } catch (error) {
        console.error('Error saving quiz:', error);
        // Continue anyway - user experience should not be blocked by save errors
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleMintNFT = async () => {
    setIsMinting(true);
    setMintError(null);
    
    try {
      // First check if user has already minted
      const status = await checkBadgeStatus();
      if (status?.hasMintedBadge && status?.badgeDetails) {
        console.log('User has already minted badge:', status.badgeDetails);
        setBadgeStatus(status);
        setShowReveal(false);
        setShowAlreadyMinted(true);
        setIsMinting(false);
        setShowConfetti(false);
        setShowMintSuccess(true);
        return;
      }

      // Check if MiniKit is installed
      if (!MiniKit.isInstalled()) {
        throw new Error('Please install World App to mint your badge');
      }

      // Get user's wallet address from multiple sources
      let userAddress = null;
      
      // First try to get from unified session
      if (unifiedSession.user?.worldcoinId) {
        userAddress = unifiedSession.user.worldcoinId;
      }
      
      // Then try localStorage (where SIWE stores the wallet info)
      if (!userAddress && typeof window !== 'undefined') {
        const storedAddress = localStorage.getItem('worldcoin_wallet_address');
        if (storedAddress) {
          userAddress = storedAddress;
        }
      }
      
      // Finally try MiniKit directly
      if (!userAddress && MiniKit.isInstalled() && (MiniKit as any).walletAddress) {
        userAddress = (MiniKit as any).walletAddress;
      }
      
      // Log for debugging
      console.log('🔍 Checking wallet addresses:', {
        fromSession: unifiedSession.user?.worldcoinId,
        fromLocalStorage: typeof window !== 'undefined' ? localStorage.getItem('worldcoin_wallet_address') : null,
        fromMiniKit: MiniKit.isInstalled() ? (MiniKit as any).walletAddress : null,
        finalAddress: userAddress
      });
      
      if (!userAddress) {
        throw new Error('No wallet address found. Please make sure you\'re signed in with World App.');
      }

      // Generate a nullifier hash (in production, this would come from World ID verification)
      const nullifierData = `${userAddress}-${Date.now()}-${Math.random()}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(nullifierData);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const nullifierHash = `0x${hashArray.map(b => b.toString(16).padStart(2, '0')).join('')}`;

      console.log('🎯 Minting Heritage Explorer badge...', { userAddress, nullifierHash });

      // Call simplified badge mint API
      const result = await fetch('/api/badge/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          worldcoinId: unifiedSession.user?.worldcoinId,
          userAddress,
          nullifierHash,
          badgeName: 'Heritage Explorer Badge'
        }),
      });

      const mintData = await result.json();
      
      if (!result.ok || !mintData.success) {
        throw new Error(mintData.error || 'Failed to mint badge');
      }

      console.log('✅ Badge minted successfully!', mintData);
      
      // Store result for success popup
      setMintResult({
        ...mintData,
        userAddress,
        nullifierHash,
        badgeName: 'Heritage Explorer Badge',
        timestamp: new Date().toISOString()
      });
      
      // Store mint result in localStorage for wallet display
      localStorage.setItem('lastMintResult', JSON.stringify({
        ...mintData,
        userAddress,
        nullifierHash,
        badgeName: 'Heritage Explorer Badge',
        timestamp: new Date().toISOString()
      }));
      
      // Show success after minting
      setIsMinting(false);
      setShowReveal(false);
      setShowConfetti(false);
      setShowMintSuccess(true);

    } catch (error) {
      console.error('❌ Minting failed:', error);
      setMintError(error instanceof Error ? error.message : 'Failed to mint badge');
      setIsMinting(false);
    }
  };

  const handleViewWallet = () => {
    // Reset all quiz states to avoid showing quiz briefly
    setShowMintSuccess(false);
    setShowReveal(false);
    setShowEmailCollection(false);
    setShowIntro(false);
    setShowAlreadyMinted(false);
    setShowConfetti(false);
    
    // Small delay to ensure state changes are processed
    setTimeout(() => {
      // Use replace instead of push to avoid navigation issues
      router.replace("/settings/wallet");
    }, 100);
  };

  // NEW: Render intro page
  const renderIntroPage = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col items-center justify-center text-center space-y-6"
    >
      {/* Hunt icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center"
      >
        <span className="text-3xl">🎯</span>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-2"
      >
        <h1 className="text-2xl font-bold text-gray-900">
          Start your Heritage Journey
        </h1>
        <p className="text-lg text-gray-600">
          Build your family tree profile and claim 50 Heritage Points™
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3 text-left max-w-xs"
      >
        <div className="flex items-center gap-3">
          <span className="text-indigo-500">🌳</span>
          <span>Discover your family heritage</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-indigo-500">🎁</span>
          <span>Earn 50 Heritage Points™ instantly</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-indigo-500">🏆</span>
          <span>Unlock exclusive genealogy badges</span>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowIntro(false)}
        className="w-full mt-8 px-6 py-4 text-white font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all"
      >
        Start Heritage Journey 🌳
      </motion.button>
    </motion.div>
  );

  // NEW: Render email collection page
  const renderEmailCollection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex flex-col items-center justify-center text-center space-y-6"
    >
      {/* Congratulations */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
      >
        <span className="text-3xl">🎉</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
                 <h1 className="text-2xl font-bold text-gray-900">
           Congratulations! 
         </h1>
         <p className="text-lg text-gray-600">
           You&apos;ve completed your Heritage Journey setup
         </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-green-600 font-bold">+ 50 Heritage Points™ earned!</span>
          </div>
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-blue-600 font-bold">🪙 + 3 Credits earned!</span>
          </div>
        </div>
      </motion.div>

      {/* Email input for Edge Esmeralda */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full space-y-4"
      >
        <p className="text-md text-gray-700 font-medium">
          Enter your email to continue and check eligibility for Heritage Tree NFT Badge
        </p>
        
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full p-3 border-2 border-indigo-300 rounded-xl text-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
        />

        <button
          onClick={handleEmailSubmit}
          disabled={!userEmail.includes('@')}
          className="w-full px-4 py-3 text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl font-bold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all"
        >
          Continue →
        </button>

        {/* Debug button for testing - only show in development or on test domains */}
        {(process.env.NODE_ENV === 'development' || 
          (typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' ||
            window.location.hostname.includes('vercel.app') ||
            window.location.hostname.includes('test')
          ))
        ) && (
          <button
            onClick={() => {
              console.log('🧪 Debug: Forcing minting page display');
              setShowEmailCollection(false);
              setShowReveal(true);
            }}
            className="w-full px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-sm transition-all"
          >
            🧪 Debug: Skip to Minting (Test Mode)
          </button>
        )}
      </motion.div>
    </motion.div>
  );

  // Handle email submission and proceed to tree page
  const handleEmailSubmit = async () => {
    if (!userEmail.includes('@')) return;
    
    console.log(`📧 Email ${userEmail} saved, proceeding to family tree`);
    
    // Save email to user profile if logged in
    if (unifiedSession.user) {
      try {
        const response = await fetch('/api/user/update-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: userEmail,
            userId: getUserId(),
            worldcoinId: unifiedSession.user?.worldcoinId
          })
        });

        if (response.ok) {
          console.log('✅ Email saved to user profile');
        }
      } catch (error) {
        console.error('❌ Error saving email:', error);
        // Continue anyway - this shouldn't block the user experience
      }
    }
    
    // Set quiz completion flag so main app doesn't redirect back to quiz
    localStorage.setItem('worldtree_quiz_completed', 'true');
    console.log('✅ Quiz completion flag set in localStorage');
    
    // Redirect to tree page to begin family tree building
    setShowEmailCollection(false);
    router.push('/tree');
  };

  // --- Main render ---
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f7f8fa]">
      <div className="screen-frame flex items-center justify-center">
        <div className="screen-1-container flex flex-col relative" style={{ position: 'relative', width: 400, minHeight: 600 }}>
          <div className="screen-1-content flex flex-col items-center justify-between w-full h-full" style={{ padding: '40px 24px 32px' }}>
            
            {/* NEW: Show intro page first */}
            {showIntro && renderIntroPage()}
            
            {/* NEW: Show email collection page after quiz completion */}
            {showEmailCollection && renderEmailCollection()}
            
            {/* Show quiz steps when not showing intro or email collection */}
            {!showIntro && !showEmailCollection && !showReveal && !showMintSuccess && !showAlreadyMinted && (
              <>
                {/* Header for all quiz screens */}
                <h1 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                  Build your Heritage Profile
                </h1>
                {renderProgress()}
                <motion.div
                  className="w-full"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
                    {quizSteps[currentStep].title}
                  </h2>
                  {quizSteps[currentStep].subtitle && (
                    <p className="text-sm text-gray-600 mb-4 text-center">
                      {quizSteps[currentStep].subtitle}
                    </p>
                  )}
                  {renderStep(quizSteps[currentStep], currentStep)}
                </motion.div>
                {/* Navigation Buttons */}
                <div className="w-full mt-8 flex gap-3">
                  {/* Back Button - only show if not on first step */}
                  {currentStep > 0 && (
                    <motion.button
                      className="px-6 py-3 text-gray-700 font-medium text-lg bg-gray-100 hover:bg-gray-200 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
                      whileTap={{ scale: 0.97 }}
                      onClick={handleBack}
                    >
                      ← Back
                    </motion.button>
                  )}
                  
                  {/* Next Button */}
                  <motion.button
                    className={`${currentStep > 0 ? 'flex-1' : 'w-full'} px-4 py-3 text-white font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 transition-all flex items-center justify-center gap-2`}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    disabled={!canProceed()}
                  >
                    {currentStep === quizSteps.length - 1 ? 'Continue' : 'Next →'}
                  </motion.button>
                </div>
              </>
            )}
          </div>
          {/* Confetti and Reveal/Minting UI */}
          <AnimatePresence mode="wait">
            {showReveal && (
              <>
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 p-4 sm:p-8 bg-white rounded-lg shadow-lg text-center flex flex-col items-center justify-center z-20 max-w-md mx-auto my-auto space-y-5"
                >
                  {/* Headline with confetti */}
                  <div className="w-full flex flex-col items-center mb-2">
                    <div className="text-2xl font-bold flex items-center justify-center gap-2">
                      <span role="img" aria-label="confetti">🎉</span>
                      Explorer Badge unlocked!
                      <span role="img" aria-label="confetti">🎉</span>
                    </div>
                  </div>
                  {/* Badge visual */}
                  <div className="relative w-full aspect-square max-w-[180px] mx-auto mb-2">
                  <Image
                      src="/badges/Edge_Badge.png"
                      alt="Explorer Badge"
                    fill
                      className="object-contain"
                      sizes="(max-width: 180px) 100vw, 180px"
                    priority
                  />
                  </div>
                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mt-2 mb-2">
                    You&apos;re officially part of the community!
                  </h2>
                  {/* Checklist */}
                  <div className="flex flex-col items-start gap-2 w-full max-w-xs mx-auto text-left mb-2">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 text-lg mt-0.5">✔</span>
                      <span><b>Mint your badge</b> now to keep forever.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 text-lg mt-0.5">✔</span>
                      <span>You just won <b>50 ProofPoints™</b> and <b>3 free credits</b></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 text-lg mt-0.5">✔</span>
                      <span>Time to <b>explore AI tools!</b></span>
                  </div>
                </div>
                  {/* CTA Button */}
                {mintError && (
                  <p className="text-sm text-red-600">{mintError}</p>
                )}
                <button
                  onClick={isMinting ? undefined : handleMintNFT}
                  disabled={isMinting}
                    className="w-full px-4 py-3 text-white bg-[#8b5cf6] hover:bg-[#7c3aed] font-bold text-lg rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
                    style={{ minHeight: 56 }}
                >
                  {isMinting ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Minting...
                    </span>
                  ) : (
                      'Mint Badge & Claim coins ->'
                  )}
                </button>
                  {/* Confetti celebration animation - only on minting page */}
                  <Confetti
                    width={typeof window !== 'undefined' ? window.innerWidth : 300}
                    height={typeof window !== 'undefined' ? window.innerHeight : 300}
                    recycle={false}
                    numberOfPieces={200}
                  />
              </motion.div>
              </>
            )}

            {/* Minting Success Popup */}
            {showMintSuccess && (
              <motion.div
                key="mint-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 p-4 sm:p-8 bg-white rounded-lg shadow-lg text-center flex flex-col items-center justify-center z-20 max-w-md mx-auto my-auto space-y-5"
              >
                {/* Headline */}
                <div className="w-full flex flex-col items-center mb-4">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    First Badge Minted!
                  </div>
                  {/* Visual: + 50 proofpoints */}
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-600 font-bold text-lg">+ 50 ProofPoints™</span>
                  </div>
                </div>

                {/* Badge visual */}
                <div className="relative w-full aspect-square max-w-[140px] mx-auto mb-4">
                  <Image
                    src="/badges/Edge_Badge.png"
                    alt="Explorer Badge"
                    fill
                    className="object-contain"
                    sizes="(max-width: 140px) 100vw, 140px"
                    priority
                  />
                </div>

                {/* Transaction Details Section */}
                <div className="w-full max-w-xs mx-auto mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🧾 Minting Details
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-left">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Badge:</span>  
                      <span className="text-sm font-medium">{mintResult?.badgeName || 'Heritage Explorer'}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Contract:</span>
                      <span className="text-sm font-medium">ERC1155</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Network:</span>
                      <span className="text-sm font-medium">World Chain</span>
                    </div>
                    {mintResult?.transactionId && (
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-600">TX ID:</span>
                        <span className="text-xs font-mono bg-white px-1 py-0.5 rounded border max-w-[120px] overflow-hidden text-ellipsis">
                          {mintResult.transactionId.slice(0, 10)}...{mintResult.transactionId.slice(-6)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Minted Successfully
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Your badge has been successfully minted to your wallet!
                  </p>
                  <p className="text-xs text-gray-500">
                    View transaction details and collectibles in your wallet
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="w-full space-y-3">
                  <button
                    onClick={handleViewWallet}
                    className="w-full px-4 py-3 text-white bg-[#8b5cf6] hover:bg-[#7c3aed] font-bold text-lg rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
                    style={{ minHeight: 56 }}
                  >
                    Go to Wallet 🎒
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowMintSuccess(false);
                      router.push("/challenge/start");
                    }}
                    className="w-full px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-all"
                  >
                    Start AI Hunt →
                  </button>
                </div>

                {/* Confetti celebration animation */}
                <Confetti
                  width={typeof window !== 'undefined' ? window.innerWidth : 300}
                  height={typeof window !== 'undefined' ? window.innerHeight : 300}
                  recycle={false}
                  numberOfPieces={150}
                />
              </motion.div>
            )}

            {/* Already Minted Popup */}
            {showAlreadyMinted && badgeStatus?.badgeDetails && (
              <motion.div
                key="already-minted"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 p-4 sm:p-8 bg-white rounded-lg shadow-lg text-center flex flex-col items-center justify-center z-20 max-w-md mx-auto my-auto space-y-5"
              >
                {/* Headline */}
                <div className="w-full flex flex-col items-center mb-4">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    Badge Already Minted! ✨
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-600 font-bold text-lg">You already own this badge!</span>
                  </div>
                </div>

                {/* Badge visual */}
                <div className="relative w-full aspect-square max-w-[140px] mx-auto mb-4">
                  <Image
                    src="/badges/Edge_Badge.png"
                    alt="Explorer Badge"
                    fill
                    className="object-contain"
                    sizes="(max-width: 140px) 100vw, 140px"
                    priority
                  />
                </div>

                {/* Badge Details Section */}
                <div className="w-full max-w-xs mx-auto mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🎯 Your Badge Details
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-left">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Badge:</span>  
                      <span className="text-sm font-medium">{badgeStatus.badgeDetails.badgeName}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Network:</span>
                      <span className="text-sm font-medium">{badgeStatus.badgeDetails.network}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Minted:</span>
                      <span className="text-sm font-medium">
                        {new Date(badgeStatus.badgeDetails.mintedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-600">TX ID:</span>
                      <span className="text-xs font-mono bg-white px-1 py-0.5 rounded border max-w-[120px] overflow-hidden text-ellipsis">
                        {badgeStatus.badgeDetails.transactionId.slice(0, 10)}...{badgeStatus.badgeDetails.transactionId.slice(-6)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Confirmed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    This badge is already in your wallet. You can view it and all your collectibles anytime!
                  </p>
                  <p className="text-xs text-gray-500">
                    Each user can only mint one Heritage Explorer badge
                  </p>
                </div>

                {/* CTA Button */}
                <div className="w-full">
                  <button
                    onClick={() => {
                      // Reset all quiz states to avoid showing quiz briefly
                      setShowAlreadyMinted(false);
                      setShowMintSuccess(false);
                      setShowReveal(false);
                      setShowEmailCollection(false);
                      setShowIntro(false);
                      setShowConfetti(false);
                      
                      // Use replace to avoid navigation issues
                      router.replace("/settings/wallet");
                    }}
                    className="w-full px-4 py-3 text-white bg-[#8b5cf6] hover:bg-[#7c3aed] font-bold text-lg rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
                    style={{ minHeight: 56 }}
                  >
                    View in Wallet 🎒
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {showConfetti && (
            <Confetti
              width={typeof window !== 'undefined' ? window.innerWidth : 300}
              height={typeof window !== 'undefined' ? window.innerHeight : 300}
              recycle={!showReveal}
              numberOfPieces={200}
            />
          )}
        </div>
      </div>
      <style jsx global>{`
        .screen-frame {
          /* Removed purple border for badge reveal */
          background: none;
          padding: 0;
          border-radius: 33px;
          box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2);
        }
        .screen-1-container {
          width: 400px;
          min-height: 600px;
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          border-radius: 30px;
          border: 1px solid #c7d2fe;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .screen-1-content {
          background: #f8fafc;
          min-height: 600px;
          padding: 40px 24px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
} 