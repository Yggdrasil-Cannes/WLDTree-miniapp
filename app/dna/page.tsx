'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DNAPage() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedData, setUploadedData] = useState<{
    hash: string;
    snpCount: number;
    fileName: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      // Read file content locally first
      const content = await file.text();
      
      // Store in IndexedDB (simulated for now)
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Upload to validate and get hash
      const formData = new FormData();
      formData.append('file', file);
      formData.append('worldId', session?.user?.name || 'demo-user');

      setUploadStatus('processing');

      const response = await fetch('/api/genetic/upload-snp', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Simulate storing in IndexedDB
      if (typeof window !== 'undefined') {
        localStorage.setItem(`snp_${session?.user?.name || 'demo-user'}`, JSON.stringify({
          hash: result.hash,
          uploadTime: new Date().toISOString(),
          fileName: result.fileName,
          snpCount: result.snpCount
        }));
      }

      setUploadedData({
        hash: result.hash,
        snpCount: result.snpCount,
        fileName: result.fileName
      });

      setUploadStatus('success');

      // Register on blockchain after 2 seconds
      setTimeout(async () => {
        await registerOnBlockchain(result.hash);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      setUploadStatus('error');
    }
  };

  const registerOnBlockchain = async (snpDataHash: string) => {
    try {
      const response = await fetch('/api/genetic/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldId: session?.user?.name || 'demo-user',
          worldIdProof: { dummy: 'proof' }, // In production, get real World ID proof
          snpDataHash
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Registration failed:', result.error);
        return;
      }

      console.log('Registered on blockchain:', result);
    } catch (error) {
      console.error('Blockchain registration error:', error);
    }
  };

  const useMockData = async () => {
    setUploadStatus('processing');
    setErrorMessage('');

    try {
      // Generate mock SNP data
      const mockSNPs = [];
      const bases = ['A', 'T', 'G', 'C'];
      
      // Generate 1000 mock SNPs
      for (let i = 0; i < 1000; i++) {
        const rsid = `rs${1000000 + Math.floor(Math.random() * 9000000)}`;
        const chromosome = Math.floor(Math.random() * 22) + 1;
        const position = Math.floor(Math.random() * 100000000);
        const genotype = bases[Math.floor(Math.random() * 4)] + bases[Math.floor(Math.random() * 4)];
        
        mockSNPs.push({
          rsid,
          chromosome: chromosome.toString(),
          position,
          genotype
        });
      }

      // Create mock file content
      const mockContent = mockSNPs.map(snp => 
        `${snp.rsid}\t${snp.chromosome}\t${snp.position}\t${snp.genotype}`
      ).join('\n');

      // Calculate hash
      const encoder = new TextEncoder();
      const data = encoder.encode(mockContent);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Store mock data locally
      const mockData = {
        hash,
        uploadTime: new Date().toISOString(),
        fileName: 'existing_genetic_data.txt',
        snpCount: mockSNPs.length,
        snps: mockSNPs
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(`snp_${session?.user?.name || 'demo-user'}`, JSON.stringify(mockData));
        localStorage.setItem(`snp_data_${hash}`, JSON.stringify(mockSNPs));
      }

      setUploadedData({
        hash,
        snpCount: mockSNPs.length,
        fileName: 'existing_genetic_data.txt'
      });

      setUploadStatus('success');

      // Register on blockchain immediately
      console.log('Registering hash on blockchain:', hash);
      await registerOnBlockchain(hash);
      
      // Also register a few other test users with mock data for demo purposes
      console.log('Creating test users for demo...');
      for (let i = 0; i < 3; i++) {
        const testUserWorldId = `test-user-${i + 1}`;
        const testUserHash = '0x' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0')).join('');
        
        try {
          const response = await fetch('/api/genetic/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              worldId: testUserWorldId,
              worldIdProof: { dummy: 'proof' },
              snpDataHash: testUserHash
            }),
          });
          
          if (response.ok) {
            console.log(`Test user ${testUserWorldId} registered with hash ${testUserHash.slice(0, 10)}...`);
          }
        } catch (error) {
          console.error(`Failed to register test user ${i + 1}:`, error);
        }
      }
      
      console.log('Data registered on blockchain. You can now create analysis requests with other test users.');

    } catch (error) {
      console.error('Mock data generation error:', error);
      setErrorMessage('Failed to generate mock data');
      setUploadStatus('error');
    }
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
            <h1 className="text-xl font-bold text-gray-900">Genetic Analysis</h1>
            <p className="text-sm text-gray-600">Upload your DNA data for privacy-preserving analysis</p>
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-8">
        {/* DNA Helix Visualization */}
        <div className="text-center mb-8">
          <DNAHelix />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Secure Genetic Analysis
          </h2>
          <h3 className="text-lg text-gray-700 mb-4">
            Powered by ROFL TEE Technology
          </h3>
        </div>

        {/* Privacy Notice */}
        <Card className="p-4 bg-blue-50 border-blue-200 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Your Privacy is Protected</p>
              <p>• Data stored locally on your device</p>
              <p>• Only hashes are stored on-chain</p>
              <p>• Analysis runs in secure TEE environment</p>
            </div>
          </div>
        </Card>

        {/* Upload Status */}
        {uploadStatus === 'success' && uploadedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-800 mb-2">Upload Successful!</h3>
                <p className="text-sm text-green-700 mb-4">
                  {uploadedData.fileName} • {uploadedData.snpCount.toLocaleString()} SNPs detected
                </p>
                <p className="text-xs text-green-600 font-mono break-all">
                  Hash: {uploadedData.hash.slice(0, 20)}...{uploadedData.hash.slice(-20)}
                </p>
                <Button 
                  onClick={() => router.push('/requests')}
                  className="mt-4"
                  variant="outline"
                >
                  Find Genetic Matches
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Error Status */}
        {uploadStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-3 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* File Upload */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Upload DNA Data</h3>
              <p className="text-sm text-gray-600">Upload your raw genetic data file</p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="space-y-3">
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              variant="outline"
              className="w-full border-gray-300 hover:border-gray-400"
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reading File...
                </>
              ) : uploadStatus === 'processing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Data...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <Button 
              onClick={useMockData}
              disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              variant="secondary"
              className="w-full"
            >
              {uploadStatus === 'processing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Mock Data...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Use Existing Data
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Supported Formats */}
        <Card className="p-4 bg-gray-50 border-gray-200 mt-6">
          <h4 className="font-medium text-gray-900 mb-2">Supported Formats</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• 23andMe raw data (.txt)</p>
            <p>• AncestryDNA raw data (.txt)</p>
            <p>• MyHeritage raw data (.csv)</p>
            <p>• FamilyTreeDNA raw data (.csv)</p>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Minimum 100 SNPs required for analysis
          </p>
        </Card>

        {/* Check Existing Data */}
        {session && (
          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => {
                const stored = localStorage.getItem(`snp_${session.user?.name || 'demo-user'}`);
                if (stored) {
                  const data = JSON.parse(stored);
                  setUploadedData({
                    hash: data.hash,
                    snpCount: data.snpCount,
                    fileName: data.fileName
                  });
                  setUploadStatus('success');
                }
              }}
              className="text-sm"
            >
              Check for existing data
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}