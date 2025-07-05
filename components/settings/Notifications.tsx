"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bell, Mail, Smartphone, Award, Zap, TrendingUp, Users, CheckCircle, AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { useUnifiedSession } from '@/hooks/useUnifiedSession';

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  challengeUpdates: boolean;
  rewardNotifications: boolean;
  socialNotifications: boolean;
  levelUpNotifications: boolean;
  newToolAlerts: boolean;
  weeklyDigest: boolean;
}

const notificationCategories = [
  {
    id: 'dna_matches',
    name: 'DNA Matches',
    description: 'New genetic matches and connections',
    enabled: true,
  },
  {
    id: 'family_requests',
    name: 'Family Requests',
    description: 'Connection requests from potential relatives',
    enabled: true,
  },
  {
    id: 'heritage_points',
    name: 'Heritage Points',
    description: 'Heritage Points earned and TREE token updates',
    enabled: true,
  },
  {
    id: 'tree_updates',
    name: 'Tree Updates',
    description: 'Changes to your family tree',
    enabled: false,
  },
  {
    id: 'historical_records',
    name: 'Historical Records',
    description: 'New historical records found for your family',
    enabled: true,
  },
];

export default function Notifications() {
  const router = useRouter();
  const unifiedSession = useUnifiedSession();
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: false,
    challengeUpdates: true,
    rewardNotifications: true,
    socialNotifications: false,
    levelUpNotifications: true,
    newToolAlerts: true,
    weeklyDigest: true
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Load notification preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!unifiedSession.user?.id) return;
      
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/user/${unifiedSession.user.id}/notifications`);
        if (response.ok) {
          const data = await response.json();
          setPreferences({ ...preferences, ...data.preferences });
        }
        
        // Initialize all categories as expanded
        const expanded = notificationCategories.reduce((acc, category) => {
          acc[category.id] = true;
          return acc;
        }, {} as Record<string, boolean>);
        setExpandedCategories(expanded);
        
      } catch (error) {
        console.error('Error loading notification preferences:', error);
        setError('Failed to load notification preferences');
      } finally {
        setLoading(false);
      }
    };

    if (unifiedSession.status !== 'loading') {
      loadPreferences();
    }
  }, [unifiedSession.status, unifiedSession.user?.id]);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newPreferences = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  const savePreferences = async (prefs: NotificationPreferences) => {
    if (!unifiedSession.user?.id) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/user/${unifiedSession.user.id}/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences: prefs }),
      });

      if (response.ok) {
        setSuccess('Preferences saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId]
    });
  };

  const getEnabledCount = () => {
    return Object.values(preferences).filter(Boolean).length;
  };

  const ToggleSwitch = ({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: () => void; disabled?: boolean }) => (
    <motion.div
      className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
        enabled ? 'bg-indigo-500' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onChange}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
        animate={{
          x: enabled ? 24 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      />
    </motion.div>
  );

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600">Loading notifications...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 max-w-2xl mx-auto"
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
        <ArrowLeft className="w-5 h-5" /> Go Back
      </motion.button>

      <motion.h1
        className="text-2xl font-bold mb-6 text-indigo-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        Notification Preferences
      </motion.h1>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Widget */}
      <motion.div
        className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow px-6 py-4 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Bell className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Active Notifications</div>
            <div className="text-2xl font-bold text-indigo-700">{getEnabledCount()}</div>
          </div>
        </div>

        {saving && (
          <div className="flex items-center gap-2 text-indigo-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Saving...</span>
          </div>
        )}
      </motion.div>

      {/* Notification Categories */}
      {notificationCategories.map((category, index) => {
        const isExpanded = expandedCategories[category.id];
        const IconComponent = Bell;

        return (
          <motion.div
            key={category.id}
            className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
          >
            <motion.button
              onClick={() => toggleCategory(category.id)}
              className={`w-full p-6 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between hover:shadow-md transition-all`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
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
                  <div className="p-6">
                    <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-indigo-500`}>
                          <Bell className="w-5 h-5" />
                        </div>
                        <div className="font-semibold text-gray-900">{category.name} Notifications</div>
                      </div>
                      
                      <ToggleSwitch
                        enabled={category.enabled}
                        onChange={() => {}}
                        disabled={saving}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
} 