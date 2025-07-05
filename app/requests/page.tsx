'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FamilyRequest {
  id: string;
  type: 'incoming' | 'outgoing';
  name: string;
  relationship: string;
  avatar?: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined';
}

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  
  // Mock data - in real app, this would come from API
  const [requests] = useState<FamilyRequest[]>([
    {
      id: '1',
      type: 'incoming',
      name: 'Sarah Johnson',
      relationship: 'Potential Sister',
      message: 'Hi! I think we might be related. Our DNA shows a 25% match.',
      timestamp: new Date('2024-01-15'),
      status: 'pending',
    },
    {
      id: '2',
      type: 'incoming',
      name: 'Michael Chen',
      relationship: 'Potential 2nd Cousin',
      message: 'I found your profile while researching the Chen family line.',
      timestamp: new Date('2024-01-14'),
      status: 'pending',
    },
    {
      id: '3',
      type: 'outgoing',
      name: 'Emma Rodriguez',
      relationship: 'Potential Aunt',
      message: 'Hello! I believe you might be my father\'s sister.',
      timestamp: new Date('2024-01-13'),
      status: 'pending',
    },
  ]);

  const filteredRequests = requests.filter(req => req.type === activeTab);

  const handleAcceptRequest = (id: string) => {
    console.log('Accept request:', id);
    // In real app, make API call to accept
  };

  const handleDeclineRequest = (id: string) => {
    console.log('Decline request:', id);
    // In real app, make API call to decline
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Family Requests</h1>
              <p className="text-sm text-gray-600">Connect with your relatives</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'incoming'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Incoming ({requests.filter(r => r.type === 'incoming').length})
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'outgoing'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Outgoing ({requests.filter(r => r.type === 'outgoing').length})
          </button>
        </div>

        {/* Request List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} requests
              </h3>
              <p className="text-gray-500">
                {activeTab === 'incoming' 
                  ? 'You haven\'t received any connection requests yet.'
                  : 'You haven\'t sent any connection requests yet.'
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
                <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {request.name.charAt(0)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{request.name}</h3>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {request.relationship}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{request.message}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {request.timestamp.toLocaleDateString()}
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col items-end gap-2">
                      {request.status === 'pending' && activeTab === 'incoming' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            className="bg-green-500 hover:bg-green-600 text-white h-8 px-3"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 h-8 px-3"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}
                      
                      {request.status === 'pending' && activeTab === 'outgoing' && (
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Send Request Button */}
        <div className="mt-8">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg">
            <UserPlus className="w-4 h-4 mr-2" />
            Send Connection Request
          </Button>
        </div>
      </div>
    </div>
  );
} 