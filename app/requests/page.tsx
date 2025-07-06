'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, MessageSquare, CheckCircle, XCircle, Clock, Shield, Zap, Link, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorldTree } from '../../contexts/WorldTreeContext';

interface FamilyRequest {
  id: string;
  type: 'incoming' | 'outgoing';
  name?: string; // Optional for anonymous incoming requests
  relationship: string;
  avatar?: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined';
  dnaMatch?: number; // DNA match percentage
  zkProof?: string; // ZK proof of relativeness
  isAnonymous?: boolean;
}

interface PotentialConnection {
  id: string;
  relationship: string;
  dnaMatch: number;
  sharedAncestors: number;
  confidence: number;
  location?: string;
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [isVerifyingProof, setIsVerifyingProof] = useState(false);
  const [isPublishingOnchain, setIsPublishingOnchain] = useState(false);
  const [isHandshaking, setIsHandshaking] = useState(false);
  const { state, actions } = useWorldTree();
  
  // Mock data - anonymous incoming requests
  const [requests, setRequests] = useState<FamilyRequest[]>([
    {
      id: '1',
      type: 'incoming',
      relationship: 'Potential Sister',
      message: 'Hi! I think we might be related. Our DNA shows a 25% match.',
      timestamp: new Date('2024-01-15'),
      status: 'pending',
      dnaMatch: 25,
      isAnonymous: true,
    },
    {
      id: '2',
      type: 'incoming',
      relationship: 'Potential 2nd Cousin',
      message: 'I found your profile while researching family connections.',
      timestamp: new Date('2024-01-14'),
      status: 'pending',
      dnaMatch: 12,
      isAnonymous: true,
    },
    {
      id: '3',
      type: 'outgoing',
      name: 'Emma Rodriguez',
      relationship: 'Potential Aunt',
      message: 'Hello! I believe you might be my father\'s sister.',
      timestamp: new Date('2024-01-13'),
      status: 'pending',
      dnaMatch: 50,
    },
  ]);

  // Mock potential connections for outgoing tab
  const [potentialConnections, setPotentialConnections] = useState<PotentialConnection[]>([
    {
      id: 'pc1',
      relationship: 'Potential Sister',
      dnaMatch: 25,
      sharedAncestors: 2,
      confidence: 85,
      location: 'New York, USA',
    },
    {
      id: 'pc2',
      relationship: 'Potential 2nd Cousin',
      dnaMatch: 12,
      sharedAncestors: 4,
      confidence: 72,
      location: 'California, USA',
    },
    {
      id: 'pc3',
      relationship: 'Potential Uncle',
      dnaMatch: 50,
      sharedAncestors: 1,
      confidence: 95,
      location: 'Texas, USA',
    },
  ]);

  const filteredRequests = requests.filter(req => req.type === activeTab);

  // Add to tree functionality
  const addToTree = async (relationship: string, dnaMatch: number) => {
    console.log('🌳 Adding to family tree:', relationship, `(${dnaMatch}% match)`);
    
    try {
      // Generate unique ID for the new member
      const newMemberId = `accepted_${Date.now()}`;
      
      // Create a new family member from the accepted request
      const newMember = {
        name: relationship, // Use relationship as name since it's anonymous
        gender: undefined, // No gender info for anonymous connections
        birth: new Date().getFullYear().toString(),
        location: 'Connected via DNA Match',
        occupation: `DNA Match: ${dnaMatch}%`,
        generation: 1, // New generation
        parents: ['genesis'], // Connect to genesis block to ensure visibility
        children: [],
        spouse: undefined
      };
      
      console.log('📝 Creating new member:', newMember);
      await actions.addFamilyMember(newMember);
      
      // Update the genesis node to include this new member as a child
      const updatedFamilyData = state.familyData.map(member => {
        if (member.id === 'genesis') {
          return {
            ...member,
            children: [...(member.children || []), newMemberId]
          };
        }
        return member;
      });
      
      // Force a re-render by updating the context
      console.log('✅ Successfully added to family tree:', relationship);
      console.log('📊 Tree updated - new relative added');
      console.log('🔍 Current family data count:', state.familyData.length);
      console.log('🔗 Updated genesis children:', updatedFamilyData.find(m => m.id === 'genesis')?.children);
    } catch (error) {
      console.error('❌ Error adding to family tree:', error);
    }
  };

  // Mock ZK proof generation
  const generateZKProof = async (requestId: string) => {
    console.log('Generating ZK proof for request:', requestId);
    setIsGeneratingProof(true);
    
    // Simulate ZK proof generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('ZK proof generated successfully');
    setIsGeneratingProof(false);
    return 'zk_proof_hash_' + requestId;
  };

  // Mock ZK proof verification
  const verifyZKProof = async (proof: string) => {
    console.log('Verifying ZK proof:', proof);
    setIsVerifyingProof(true);
    
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('ZK proof verified successfully');
    setIsVerifyingProof(false);
    return true;
  };

  // Mock onchain publishing
  const publishProofOnchain = async (proof: string) => {
    console.log('Publishing proof onchain:', proof);
    setIsPublishingOnchain(true);
    
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Proof published onchain successfully');
    setIsPublishingOnchain(false);
    return 'tx_hash_' + Date.now();
  };

  // Mock confidential handshake
  const performConfidentialHandshake = async (connectionId: string) => {
    console.log('Performing confidential handshake with:', connectionId);
    setIsHandshaking(true);
    
    // Simulate cryptographic handshake
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    console.log('Confidential handshake completed');
    setIsHandshaking(false);
    return true;
  };

  const handleAcceptRequest = async (id: string) => {
    console.log('=== ACCEPTING REQUEST FLOW ===');
    console.log('Step 1: Starting ZK proof generation for request:', id);
    
    try {
      // Step 1: Generate ZK proof
      const proof = await generateZKProof(id);
      console.log('Step 2: ZK proof generated, starting verification');
      
      // Step 2: Verify the proof
      const isVerified = await verifyZKProof(proof);
      console.log('Step 3: ZK proof verified, publishing onchain');
      
      if (isVerified) {
        // Step 3: Publish proof onchain
        const txHash = await publishProofOnchain(proof);
        console.log('Step 4: Proof published onchain, performing handshake');
        
        // Step 4: Perform confidential handshake
        await performConfidentialHandshake(id);
        
        // Step 5: Add to tree and remove from requests
        const request = requests.find(r => r.id === id);
        if (request) {
          await addToTree(request.relationship, request.dnaMatch || 0);
          setRequests(prev => prev.filter(r => r.id !== id));
        }
        
        console.log('✅ Connection established successfully!');
        console.log('📋 Transaction Hash:', txHash);
        console.log('🔐 Confidential handshake completed');
        console.log('🌳 Added to family tree');
      }
    } catch (error) {
      console.error('❌ Error establishing connection:', error);
    }
  };

  const handleDeclineRequest = (id: string) => {
    console.log('Decline request:', id);
    // Remove from requests list
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleCreateConnection = async (connection: PotentialConnection) => {
    console.log('=== CREATING CONNECTION FLOW ===');
    console.log('Target connection:', connection.relationship, `(${connection.dnaMatch}% match)`);
    
    try {
      // Step 1: Generate ZK proof
      const proof = await generateZKProof(connection.id);
      console.log('Step 2: ZK proof generated, starting verification');
      
      // Step 2: Verify the proof
      const isVerified = await verifyZKProof(proof);
      console.log('Step 3: ZK proof verified, publishing onchain');
      
      if (isVerified) {
        // Step 3: Publish proof onchain
        const txHash = await publishProofOnchain(proof);
        
        // Step 4: Remove from potential connections
        setPotentialConnections(prev => prev.filter(c => c.id !== connection.id));
        
        console.log('✅ Connection request sent successfully!');
        console.log('📋 Transaction Hash:', txHash);
        console.log('🔍 Request is now visible to the target user');
      }
    } catch (error) {
      console.error('❌ Error creating connection:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Family Requests</h1>
              <p className="text-sm text-gray-400">Connect with your relatives</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-6">
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

        {/* Incoming Requests */}
        {activeTab === 'incoming' && (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-gray-400" />
              </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No incoming requests
              </h3>
                <p className="text-gray-400">
                  You haven&apos;t received any connection requests yet.
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
                      {/* Anonymous Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                        <EyeOff className="w-5 h-5" />
                    </div>
                    
                    {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white text-lg">{request.relationship}</h3>
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                              {request.dnaMatch}% DNA Match
                        </span>
                          </div>
                      </div>
                      
                        <p className="text-sm text-gray-300 mb-2">{request.message}</p>
                      
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {request.timestamp.toLocaleDateString()}
                      </div>
                    </div>

                    {/* Status */}
                      <div className="flex flex-col items-end gap-2 min-w-fit">
                        {request.status === 'pending' && (
                          <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                              disabled={isGeneratingProof || isVerifyingProof || isPublishingOnchain || isHandshaking}
                              className="bg-green-500 hover:bg-green-600 text-black h-8 px-3 text-xs sm:text-sm"
                          >
                              {isGeneratingProof || isVerifyingProof || isPublishingOnchain || isHandshaking ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              ) : (
                                <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accept
                                </>
                              )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                              className="border-red-500 text-red-400 hover:bg-red-900/20 h-8 px-3 text-xs sm:text-sm"
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
        )}

        {/* Outgoing Requests & Potential Connections */}
        {activeTab === 'outgoing' && (
          <div className="space-y-6">
            {/* Existing Outgoing Requests */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Your Requests</h3>
              <div className="space-y-4">
                {requests.filter(r => r.type === 'outgoing').map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {request.name?.charAt(0) || 'U'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white text-lg">{request.name}</h3>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                              {request.relationship}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-300 mb-2">{request.message}</p>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            {request.timestamp.toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 min-w-fit">
                          {request.status === 'pending' && (
                            <span className="text-xs px-2 py-1 bg-yellow-900/50 text-yellow-400 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
                ))}
              </div>
            </div>

            {/* Potential Connections */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Potential Connections</h3>
              <div className="space-y-4">
                {potentialConnections.map((connection, index) => (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 bg-gray-900/80 backdrop-blur-sm border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          <Link className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white text-lg">{connection.relationship}</h3>
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                                {connection.dnaMatch}% DNA Match
                              </span>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                                {connection.confidence}% Confidence
                              </span>
                            </div>
        </div>

                          <p className="text-sm text-gray-300 mb-2">
                            {connection.sharedAncestors} shared ancestors • {connection.location}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2 min-w-fit">
                          <Button
                            size="sm"
                            onClick={() => handleCreateConnection(connection)}
                            disabled={isGeneratingProof || isVerifyingProof || isPublishingOnchain}
                            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black h-8 px-3 text-xs sm:text-sm"
                          >
                            {isGeneratingProof || isVerifyingProof || isPublishingOnchain ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <Shield className="w-3 h-3 mr-1" />
                                Create
                              </>
                            )}
          </Button>
        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Status Indicators */}
        {(isGeneratingProof || isVerifyingProof || isPublishingOnchain || isHandshaking) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              <div>
                <p className="text-sm font-medium text-blue-300">
                  {isGeneratingProof && 'Generating ZK proof...'}
                  {isVerifyingProof && 'Verifying ZK proof...'}
                  {isPublishingOnchain && 'Publishing proof onchain...'}
                  {isHandshaking && 'Performing confidential handshake...'}
                </p>
                <p className="text-xs text-blue-400">
                  This may take a few moments
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 