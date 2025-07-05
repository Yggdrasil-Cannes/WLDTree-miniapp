'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DataImportModalProps {
  onClose: () => void
  onImport: (data: any[], type: string) => void
}

export default function DataImportModal({ onClose, onImport }: DataImportModalProps) {
  const [importType, setImportType] = useState<'dna' | 'gedcom' | 'csv' | 'manual'>('dna')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Process file based on type
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      // Process different file types
      onImport([], importType)
      onClose()
    }
    reader.readAsText(file)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-900 rounded-2xl p-6 w-96 max-w-[90vw]"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Import Family Data</h2>
        
        {/* Import Type Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { id: 'dna', label: 'DNA Data', icon: '🧬', desc: 'Upload genetic data' },
            { id: 'gedcom', label: 'GEDCOM', icon: '📄', desc: 'Standard genealogy format' },
            { id: 'csv', label: 'CSV File', icon: '📊', desc: 'Spreadsheet data' },
            { id: 'manual', label: 'Manual Entry', icon: '✏️', desc: 'Add manually' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setImportType(type.id as any)}
              className={`p-4 rounded-xl border-2 transition-all ${
                importType === type.id
                  ? 'border-green-500 bg-green-500 bg-opacity-20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="text-sm font-medium text-white">{type.label}</div>
              <div className="text-xs text-gray-400">{type.desc}</div>
            </button>
          ))}
        </div>

        {/* Upload Area */}
        {importType !== 'manual' && (
          <div className="mb-6">
            <label className="block w-full">
              <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center hover:border-green-500 transition-colors cursor-pointer">
                <div className="text-4xl mb-2">📁</div>
                <div className="text-white font-medium mb-1">
                  Drop your {importType.toUpperCase()} file here
                </div>
                <div className="text-gray-400 text-sm">
                  or click to browse
                </div>
              </div>
              <input
                type="file"
                accept={importType === 'csv' ? '.csv' : importType === 'gedcom' ? '.ged' : '*'}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Upload Progress */}
        {isProcessing && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Processing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-green-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Manual Entry Option */}
        {importType === 'manual' && (
          <div className="mb-6">
            <button
              onClick={() => {
                onImport([], 'manual')
                onClose()
              }}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Manual Entry
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={isProcessing}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Import'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
} 