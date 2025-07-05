'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bluetooth, Upload, FileText, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function DNAPage() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'connecting' | 'uploading' | 'success' | 'error'>('idle');
  const [bluetoothConnected, setBluetoothConnected] = useState(false);

  const handleBluetoothConnect = async () => {
    setUploadStatus('connecting');
    
    // Mock Bluetooth connection
    setTimeout(() => {
      setBluetoothConnected(true);
      setUploadStatus('idle');
    }, 2000);
  };

  const handleFileUpload = async () => {
    setUploadStatus('uploading');
    
    // Mock file upload
    setTimeout(() => {
      setUploadStatus('success');
    }, 3000);
  };

  const DNAHelix = () => (
    <div className="relative w-32 h-48 mx-auto mb-8">
      <svg 
        viewBox="0 0 100 150" 
        className="w-full h-full"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))',
        }}
      >
        {/* DNA Helix Structure */}
        <motion.path
          d="M30 10 Q50 25 70 40 Q50 55 30 70 Q50 85 70 100 Q50 115 30 130"
          stroke="#3B82F6"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
        />
        <motion.path
          d="M70 10 Q50 25 30 40 Q50 55 70 70 Q50 85 30 100 Q50 115 70 130"
          stroke="#EC4899"
          strokeWidth="3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'loop', delay: 0.5 }}
        />
        
        {/* Base Pairs */}
        {[...Array(12)].map((_, i) => {
          const y = 15 + i * 10;
          const offset = Math.sin(i * 0.8) * 20;
          return (
            <motion.line
              key={i}
              x1={30 + offset}
              y1={y}
              x2={70 - offset}
              y2={y}
              stroke="#10B981"
              strokeWidth="2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            />
          );
        })}
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.circle
            key={i}
            cx={20 + Math.random() * 60}
            cy={20 + Math.random() * 110}
            r="2"
            fill="#F59E0B"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">DNA Analysis</h1>
            <p className="text-sm text-gray-600">Upload your DNA data to find relatives</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-8">
        {/* DNA Helix Visualization */}
        <div className="text-center mb-8">
          <DNAHelix />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connect with Bluetooth
          </h2>
          <h3 className="text-xl text-gray-700 mb-4">
            to upload DNA Data.
          </h3>
        </div>

        {/* Connection Status */}
        {bluetoothConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-3 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Bluetooth Connected</span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Upload Options */}
        <div className="space-y-4 mb-8">
          {/* Bluetooth Upload */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Bluetooth className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Bluetooth Transfer</h3>
                <p className="text-sm text-gray-600">Connect your DNA testing device</p>
              </div>
            </div>
            
            <Button 
              onClick={handleBluetoothConnect}
              disabled={uploadStatus === 'connecting' || bluetoothConnected}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white disabled:opacity-50"
            >
              {uploadStatus === 'connecting' ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 mr-2"
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                  Connecting...
                </>
              ) : bluetoothConnected ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Connected
                </>
              ) : (
                <>
                  <Bluetooth className="w-4 h-4 mr-2" />
                  Connect Bluetooth
                </>
              )}
            </Button>
          </Card>

          {/* File Upload */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">File Upload</h3>
                <p className="text-sm text-gray-600">Upload raw DNA data file</p>
              </div>
            </div>
            
            <Button 
              onClick={handleFileUpload}
              disabled={uploadStatus === 'uploading'}
              variant="outline"
              className="w-full border-gray-300 hover:border-gray-400"
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 mr-2"
                  >
                    <Upload className="w-4 h-4" />
                  </motion.div>
                  Uploading...
                </>
              ) : uploadStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Upload Complete
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Data
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Upload Status */}
        {uploadStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-800 mb-2">Upload Successful!</h3>
                <p className="text-sm text-green-700">
                  Your DNA data has been processed. We&apos;ll notify you when new matches are found.
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Supported Formats */}
        <Card className="p-4 bg-gray-50 border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Supported Formats</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• 23andMe raw data (.txt)</p>
            <p>• AncestryDNA raw data (.txt)</p>
            <p>• MyHeritage raw data (.csv)</p>
            <p>• FamilyTreeDNA raw data (.csv)</p>
          </div>
        </Card>
      </div>
    </div>
  );
} 