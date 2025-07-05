"use client";
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Twitter, 
  Linkedin, 
  User, 
  MapPin, 
  Globe,
  Camera,
  Edit3,
  Star,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Coins
} from 'lucide-react';
import { useUnifiedSession } from '@/hooks/useUnifiedSession';
import { useProfileData } from '@/hooks/useProfileData';

interface QuizProfile {
  userInterests?: string[];
  userLocation?: string;
  userAge?: string;
  preferredPlatforms?: string[];
  aiTasks?: string[];
  aiComfortLevel?: string;
  aiBudget?: string;
}

interface UserStats {
  totalSessions: number;
  totalBadges: number;
  quizCompleted: boolean;
  joinDate: string;
  lastActive: string;
}

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  avatar: string | null;
  bio: string | null;
  isVerified: boolean;
  worldcoinId: string | null;
  region: string | null;
  interests: string[];
  experienceLevel: string;
  proofPoints: number;
  level: number;
  preferences: {
    language?: string;
    socials?: {
      twitter?: string;
      linkedin?: string;
    };
  } | null;
  quizProfile: QuizProfile;
  profileCompletion: number;
  stats: UserStats;
}

export default function ProfileInfo() {
  const router = useRouter();
  const unifiedSession = useUnifiedSession();
  const { data: user, isLoading, error: fetchError, refetch } = useProfileData(unifiedSession.user?.id);
  
  const [edit, setEdit] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('/avatars/default.png');
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setForm(user);
      setAvatarPreview(user.avatar || '/avatars/default.png');
    }
  }, [user]);

  // Set fetch error as component error
  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('preferences.socials.')) {
      const social = name.split('.')[2];
      setForm(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          socials: {
            ...prev.preferences?.socials,
            [social]: value
          }
        }
      }));
    } else if (name.startsWith('preferences.')) {
      const pref = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [pref]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setUploadingAvatar(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('userId', unifiedSession.user?.id || '');

        const response = await fetch('/api/user/upload-avatar', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload avatar');
        }

        const result = await response.json();
        setAvatarPreview(result.avatarUrl);
        setForm(prev => ({ ...prev, avatar: result.avatarUrl }));
        setSuccess('Profile picture updated successfully!');
        
        // Refetch profile data to sync with dashboard
        await refetch();
        
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        console.error('Error uploading avatar:', error);
        setError(error instanceof Error ? error.message : 'Failed to upload avatar');
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

  const handleEdit = () => {
    setEdit(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEdit(false);
    setForm(user || {});
    setAvatarPreview(user?.avatar || '/avatars/default.png');
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      const userId = unifiedSession.user?.id;
      if (!userId) {
        throw new Error('No user ID found');
      }

      const response = await fetch(`/api/user/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      setForm(updatedUser);
      setEdit(false);
      setSuccess('Profile updated successfully!');
      
      // Invalidate cache and refetch fresh data
      refetch();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Failed to load user data</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  const isChanged = JSON.stringify(form) !== JSON.stringify(user) || avatarPreview !== user.avatar;

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
        <ArrowLeft className="w-5 h-5" /> Go Back
      </motion.button>

      <motion.h1
        className="text-2xl font-bold mb-2 text-indigo-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        Profile Information
      </motion.h1>

      {/* Error/Success Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded"
        >
          {success}
        </motion.div>
      )}

      {/* Profile Completion Widget */}
      <motion.div
        className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow px-5 py-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-indigo-500" />
            <div>
              <div className="text-xs text-gray-500">Profile Completion</div>
              <div className={`text-xl font-bold ${getCompletionColor(user.profileCompletion)}`}>
                {user.profileCompletion}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Image src="/badges/coin.PNG" alt="ProofPoints" width={28} height={28} />
            <div>
              <div className="text-xs text-gray-500">ProofPoints™</div>
              <div className="text-xl font-bold text-orange-700">{user.proofPoints}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-7 h-7 text-green-500" />
            <div>
              <div className="text-xs text-gray-500">Level</div>
              <div className="text-xl font-bold text-green-700">{user.level}</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Avatar & Name Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="relative w-32 h-32">
                <Image
                  src={avatarPreview}
                  alt="Avatar"
                  fill
                  className="object-cover rounded-full border-4 border-indigo-200 shadow-lg"
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <button
                className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transition"
                onClick={() => fileInputRef.current?.click()}
                type="button"
                aria-label="Change avatar"
                disabled={uploadingAvatar}
              >
                <Camera className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {edit ? (
              <div className="w-full space-y-3">
                <input
                  className="w-full font-semibold text-lg text-center border border-gray-200 focus:border-indigo-400 outline-none rounded-lg px-4 py-2 bg-gray-50 transition"
                  name="name"
                  value={form.name || ''}
                  onChange={handleChange}
                  placeholder="Full Name"
                />
                <input
                  className="w-full text-gray-500 text-center border border-gray-200 focus:border-indigo-400 outline-none rounded-lg px-4 py-2 bg-gray-50 transition"
                  name="username"
                  value={form.username || ''}
                  onChange={handleChange}
                  placeholder="Username"
                />
                <textarea
                  className="w-full text-center border border-gray-200 focus:border-indigo-400 outline-none rounded-lg px-4 py-2 bg-gray-50 transition resize-none"
                  name="bio"
                  value={form.bio || ''}
                  onChange={handleChange}
                  placeholder="Bio (optional)"
                  rows={3}
                />
              </div>
            ) : (
              <div className="text-center">
                <div className="font-semibold text-xl">{user.name || 'Anonymous'}</div>
                <div className="text-gray-500">@{user.username || 'user'}</div>
                {user.bio && (
                  <div className="text-gray-600 mt-2 max-w-md">{user.bio}</div>
                )}
              </div>
            )}
          </div>

          {/* Verification & Status Section */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {user.isVerified ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" /> Verified World ID
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  <XCircle className="w-4 h-4" /> Not Verified
                </span>
              )}
              
              {user.stats.quizCompleted && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  <Award className="w-4 h-4" /> Quiz Completed
                </span>
              )}
            </div>
          </div>

          {/* Quiz-Derived Information */}
          {user.quizProfile && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Quiz Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.quizProfile.userInterests && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Interests</div>
                    <div className="flex flex-wrap gap-1">
                      {user.quizProfile.userInterests.map((interest, idx) => (
                        <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.quizProfile.userLocation && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Location</div>
                    <div className="font-semibold">{user.quizProfile.userLocation}</div>
                  </div>
                )}

                {user.quizProfile.aiComfortLevel && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">AI Experience</div>
                    <div className="font-semibold">{user.quizProfile.aiComfortLevel}</div>
                  </div>
                )}

                {user.quizProfile.aiBudget && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">AI Tools Budget</div>
                    <div className="font-semibold">{user.quizProfile.aiBudget}</div>
                  </div>
                )}
              </div>

              {user.quizProfile.aiTasks && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">AI Use Cases</div>
                  <div className="flex flex-wrap gap-1">
                    {user.quizProfile.aiTasks.map((task, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {task}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preferences Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Preferences</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Globe className="w-5 h-5 text-indigo-500" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500">Language</div>
                  {edit ? (
                    <select
                      className="w-full font-semibold border border-gray-200 focus:border-indigo-400 outline-none rounded-lg px-3 py-1 bg-white transition"
                      name="preferences.language"
                      value={form.preferences?.language || ''}
                      onChange={handleChange}
                    >
                      <option value="">Select Language</option>
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Arabic">Arabic</option>
                    </select>
                  ) : (
                    <div className="font-semibold">{user.preferences?.language || 'English'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Social Media</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Twitter className="w-5 h-5 text-sky-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500">Twitter</div>
                  {edit ? (
                    <input
                      className="w-full font-semibold border border-gray-200 focus:border-indigo-400 outline-none rounded-lg px-3 py-1 bg-white transition"
                      name="preferences.socials.twitter"
                      value={form.preferences?.socials?.twitter || ''}
                      onChange={handleChange}
                      placeholder="@username"
                    />
                  ) : (
                    <div className="font-semibold">
                      {user.preferences?.socials?.twitter ? `@${user.preferences.socials.twitter}` : 'Not set'}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Linkedin className="w-5 h-5 text-blue-700" />
                <div className="flex-1">
                  <div className="text-sm text-gray-500">LinkedIn</div>
                  {edit ? (
                    <input
                      className="w-full font-semibold border border-gray-200 focus:border-indigo-400 outline-none rounded-lg px-3 py-1 bg-white transition"
                      name="preferences.socials.linkedin"
                      value={form.preferences?.socials?.linkedin || ''}
                      onChange={handleChange}
                      placeholder="linkedin.com/in/username"
                    />
                  ) : (
                    <div className="font-semibold">{user.preferences?.socials?.linkedin || 'Not set'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {edit ? (
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 focus:ring-2 focus:ring-indigo-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
                onClick={handleSave}
                disabled={!isChanged || isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          ) : (
            <button
              className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 focus:ring-2 focus:ring-indigo-300 transition flex items-center justify-center gap-2"
              onClick={handleEdit}
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </motion.div>

        {/* Stats Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Account Stats */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Stats
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Agent Sessions</span>
                <span className="font-semibold">{user.stats.totalSessions}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Badges Earned</span>
                <span className="font-semibold">{user.stats.totalBadges}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="font-semibold text-xs">{formatDate(user.stats.joinDate)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Active</span>
                <span className="font-semibold text-xs">{formatDate(user.stats.lastActive)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 