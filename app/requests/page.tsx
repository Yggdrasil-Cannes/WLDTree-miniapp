'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, CheckCircle, XCircle, Clock, AlertCircle, Dna, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface GeneticAnalysisRequest {
  id: string;
  type: 'incoming' | 'outgoing';
  requesterAddress: string;
  targetAddress: string;
  status: 'pending_consent' | 'pending_analysis' | 'completed' | 'failed';
  result?: {
    relationship: string;
    confidence: number;
    similarity: number;
    shared_markers: number;
  };
  timestamp: Date;
  worldId?: string;
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [requests, setRequests] = useState<GeneticAnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      loadRequests();
    }
  }, [session]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Check if user has uploaded data
      const userData = localStorage.getItem(`snp_${session?.user?.name || 'demo-user'}`);
      const hasData = userData !== null;
      
      // For demo purposes, create mock requests
      // In production, this would fetch from the blockchain
      let mockRequests: GeneticAnalysisRequest[] = [
        {
          id: '1',
          type: 'incoming',
          requesterAddress: '0x1234...5678',
          targetAddress: '0xabcd...efgh',
          status: 'pending_consent',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          worldId: 'user-123'
        },
        {
          id: '2',
          type: 'outgoing',
          requesterAddress: '0xabcd...efgh',
          targetAddress: '0x9876...5432',
          status: 'pending_analysis',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          worldId: session?.user?.name || 'demo-user'
        },
        {
          id: '3',
          type: 'incoming',
          requesterAddress: '0x5555...6666',
          targetAddress: '0xabcd...efgh',
          status: 'completed',
          result: {
            relationship: 'Second Cousin',
            confidence: 85,
            similarity: 12,
            shared_markers: 456
          },
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          worldId: 'user-456'
        }
      ];

      // If user has data, add more relevant requests
      if (hasData) {
        mockRequests = [
          ...mockRequests,
          {
            id: '4',
            type: 'incoming',
            requesterAddress: '0x7777...8888',
            targetAddress: '0xabcd...efgh',
            status: 'pending_consent',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            worldId: 'mock-relative-1'
          },
          {
            id: '5',
            type: 'outgoing',
            requesterAddress: '0xabcd...efgh',
            targetAddress: '0x9999...0000',
            status: 'pending_consent',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            worldId: session?.user?.name || 'demo-user'
          }
        ];
      }

      setRequests(mockRequests);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantConsent = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);

      // Always make real API call
      const response = await fetch('/api/genetic/grant-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worldId: session?.user?.name || 'demo-user',
          requestId,
          method: 'direct'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to grant consent');
      }

      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'pending_analysis' as const }
          : req
      ));

      console.log('Consent granted:', result);
    } catch (error) {
      console.error('Consent error:', error);
      alert(error instanceof Error ? error.message : 'Failed to grant consent');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    // In production, this would update the blockchain
    setRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const handleCreateRequest = () => {
    const hasData = localStorage.getItem(`snp_${session?.user?.name || 'demo-user'}`);
    if (!hasData) {
      router.push('/dna');
    } else {
      // Create a new request
      const userData = JSON.parse(hasData);
      if (userData) {
        // Create a new mock outgoing request
        const newRequest: GeneticAnalysisRequest = {
          id: `mock-${Date.now()}`,
          type: 'outgoing',
          requesterAddress: '0xabcd...efgh',
          targetAddress: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
          status: 'pending_consent',
          timestamp: new Date(),
          worldId: session?.user?.name || 'demo-user'
        };
        
        setRequests(prev => [newRequest, ...prev]);
        
        // Simulate the other user accepting after 5 seconds
        setTimeout(() => {
          setRequests(prev => prev.map(req => 
            req.id === newRequest.id 
              ? { ...req, status: 'pending_analysis' as const }
              : req
          ));
          
          // Simulate analysis completion after another 5 seconds
          setTimeout(() => {
            const relationships = ['Parent', 'Sibling', 'First Cousin', 'Second Cousin', 'Third Cousin', 'Distant Relative'];
            const relationship = relationships[Math.floor(Math.random() * relationships.length)];
            const confidence = 70 + Math.floor(Math.random() * 30);
            const similarity = relationship === 'Parent' ? 50 + Math.random() * 10 :
                              relationship === 'Sibling' ? 40 + Math.random() * 10 :
                              relationship === 'First Cousin' ? 10 + Math.random() * 15 :
                              5 + Math.random() * 10;
            
            setRequests(prev => prev.map(req => 
              req.id === newRequest.id 
                ? { 
                    ...req, 
                    status: 'completed' as const,
                    result: {
                      relationship,
                      confidence,
                      similarity: Math.round(similarity * 10) / 10,
                      shared_markers: Math.floor(300 + Math.random() * 700)
                    }
                  }
                : req
            ));
          }, 5000);
        }, 5000);
        
        alert('Created a new analysis request! The other user will respond automatically.');
        
        // Also create the request on the blockchain
        (async () => {
          try {
            // Use one of the test users we created
            const testUserIndex = Math.floor(Math.random() * 3) + 1;
            const targetWorldId = `test-user-${testUserIndex}`;
            
            const response = await fetch('/api/genetic/request-analysis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                worldId: session?.user?.name || 'demo-user',
                targetWorldId: targetWorldId,
                worldIdProof: { dummy: 'proof' }
              }),
            });
            
            if (response.ok) {
              const result = await response.json();
              console.log('Blockchain request created:', result);
              console.log(`Analysis request created with ${targetWorldId}`);
              
              // Update the request with the blockchain request ID
              if (result.requestId) {
                setRequests(prev => prev.map(req => 
                  req.id === newRequest.id 
                    ? { ...req, id: result.requestId }
                    : req
                ));
              }
            }
          } catch (error) {
            console.error('Failed to create blockchain request:', error);
          }
        })();
      } else {
        // Open modal to select target user
        alert('Feature coming soon: Search for users to request analysis');
      }
    }
  };

  const filteredRequests = requests.filter(req => req.type === activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_consent':
        return <span className="text-xs px-2 py-1 bg-yellow-900/50 text-yellow-400 rounded-full">Awaiting Consent</span>;
      case 'pending_analysis':
        return <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-400 rounded-full">Processing</span>;
      case 'completed':
        return <span className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded-full">Completed</span>;
      case 'failed':
        return <span className="text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded-full">Failed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Genetic Analysis Requests</h1>
              <p className="text-sm text-gray-400">Find genetic relatives securely</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-6">
        {/* Privacy Notice */}
        <Card className="p-3 bg-blue-900/20 border-blue-800 mb-6">
          <div className="flex items-center gap-2 text-sm text-blue-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Your genetic data remains private. Only consented analyses are processed in TEE.</span>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'incoming'
                ? 'bg-green-500 text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Incoming ({requests.filter(r => r.type === 'incoming').length})
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'outgoing'
                ? 'bg-green-500 text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Outgoing ({requests.filter(r => r.type === 'outgoing').length})
          </button>
        </div>

        {/* Request List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No {activeTab} requests
              </h3>
              <p className="text-gray-400">
                {activeTab === 'incoming' 
                  ? 'You haven\'t received any analysis requests yet.'
                  : 'You haven\'t sent any analysis requests yet.'
                }
              </p>
            </motion.div>
          ) : (
            filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                      <Dna className="w-6 h-6" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">
                          {request.type === 'incoming' ? 'Analysis Request' : 'Your Request'}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-2">
                        {request.type === 'incoming' 
                          ? `User ${request.requesterAddress} wants to analyze genetic relationship`
                          : `Requested analysis with ${request.targetAddress}`
                        }
                      </p>

                      {request.result && (
                        <div className="bg-gray-800/50 rounded-lg p-3 mb-2">
                          <p className="text-sm font-medium text-green-400 mb-1">
                            {request.result.relationship}
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Confidence:</span>
                              <span className="text-white ml-1">{request.result.confidence}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Similarity:</span>
                              <span className="text-white ml-1">{request.result.similarity}%</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Markers:</span>
                              <span className="text-white ml-1">{request.result.shared_markers}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {request.timestamp.toLocaleDateString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      {request.status === 'pending_consent' && activeTab === 'incoming' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleGrantConsent(request.id)}
                            disabled={processingRequest === request.id}
                            className="bg-green-500 hover:bg-green-600 text-black h-8 px-3"
                          >
                            {processingRequest === request.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black" />
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Grant Consent
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                            className="border-red-500 text-red-400 hover:bg-red-900/20 h-8 px-3"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Create Request Button */}
        <div className="mt-8">
          <Button 
            onClick={handleCreateRequest}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black shadow-lg"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Request Genetic Analysis
          </Button>
        </div>

        {/* Info Card */}
        <Card className="p-4 bg-gray-900/50 border-gray-800 mt-6">
          <h4 className="font-medium text-white mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400" />
            How it Works
          </h4>
          <div className="text-sm text-gray-400 space-y-1">
            <p>1. Upload your genetic data (stays on your device)</p>
            <p>2. Request analysis with another user</p>
            <p>3. Both users must consent to the analysis</p>
            <p>4. ROFL processes data in secure TEE environment</p>
            <p>5. Only the relationship result is stored on-chain</p>
          </div>
        </Card>
      </div>
    </div>
  );
}