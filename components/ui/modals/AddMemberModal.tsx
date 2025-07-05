'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface AddMemberModalProps {
  onClose: () => void
  onSubmit: (memberData: any) => void
}

export default function AddMemberModal({ onClose, onSubmit }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    birth: '',
    death: '',
    location: '',
    occupation: '',
    parentId: '',
    relationship: 'child'
  })

  const [step, setStep] = useState(1)
  const totalSteps = 3

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-2xl p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add Family Member</h2>
          <div className="text-sm text-gray-400">
            Step {step} of {totalSteps}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
          <motion.div
            className="bg-green-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'male', label: 'Male', icon: '♂️' },
                    { value: 'female', label: 'Female', icon: '♀️' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.gender === option.value
                          ? 'border-green-500 bg-green-500 bg-opacity-20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div className="text-sm text-white mt-1">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Dates & Location */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={formData.birth}
                    onChange={(e) => setFormData({ ...formData, birth: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Death Date
                  </label>
                  <input
                    type="date"
                    value={formData.death}
                    onChange={(e) => setFormData({ ...formData, death: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Birth place or residence"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="Profession or occupation"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Relationships */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Relationship Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'child', label: 'Child', icon: '👶' },
                    { value: 'parent', label: 'Parent', icon: '👨‍👩‍👧‍👦' },
                    { value: 'spouse', label: 'Spouse', icon: '💑' },
                    { value: 'sibling', label: 'Sibling', icon: '👫' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, relationship: option.value })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.relationship === option.value
                          ? 'border-green-500 bg-green-500 bg-opacity-20'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div className="text-sm text-white mt-1">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Connect to Existing Member
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500"
                >
                  <option value="">Select existing member</option>
                  <option value="root">Genesis Block (Root)</option>
                  {/* Add dynamic options from existing family members */}
                </select>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Previous
              </button>
            )}
            
            <button
              onClick={onClose}
              type="button"
              className="flex-1 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={step === 1 && !formData.name}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Add Member
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
} 