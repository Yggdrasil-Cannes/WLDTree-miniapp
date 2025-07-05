'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, MapPin, Search, Filter, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface HistoricalRecord {
  id: string;
  type: 'birth' | 'death' | 'marriage' | 'census' | 'military' | 'immigration';
  title: string;
  person: string;
  date: string;
  location: string;
  description: string;
  source: string;
  confidence: number;
}

export default function RecordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  
  const records: HistoricalRecord[] = [
    {
      id: '1',
      type: 'birth',
      title: 'Birth Certificate',
      person: 'Benjamin Verrier',
      date: '1854-03-15',
      location: 'Paris, France',
      description: 'Birth record found in Paris municipal archives',
      source: 'Paris Municipal Archives',
      confidence: 95,
    },
    {
      id: '2',
      type: 'census',
      title: '1901 Census Record',
      person: 'Joseph Verrier',
      date: '1901-04-31',
      location: 'Lyon, France',
      description: 'Family listed as residing at 42 Rue de la République',
      source: 'French National Archives',
      confidence: 88,
    },
    {
      id: '3',
      type: 'marriage',
      title: 'Marriage Certificate',
      person: 'Marie A.B. Rossignol',
      date: '1925-06-12',
      location: 'Marseille, France',
      description: 'Marriage to Marcel Verrier at Saint-Victor Church',
      source: 'Marseille Church Records',
      confidence: 92,
    },
    {
      id: '4',
      type: 'military',
      title: 'Military Service Record',
      person: 'Jean Rossignol',
      date: '1872-09-01',
      location: 'Strasbourg, France',
      description: 'Service in the 15th Infantry Regiment',
      source: 'French Military Archives',
      confidence: 85,
    },
    {
      id: '5',
      type: 'immigration',
      title: 'Ship Passenger List',
      person: 'Gabriel Reymond',
      date: '1889-07-22',
      location: 'Le Havre, France',
      description: 'Departure on SS Normandie to New York',
      source: 'Le Havre Port Authority',
      confidence: 78,
    },
  ];

  const recordTypes = [
    { id: 'all', name: 'All Records', icon: FileText },
    { id: 'birth', name: 'Birth', icon: Calendar },
    { id: 'death', name: 'Death', icon: Calendar },
    { id: 'marriage', name: 'Marriage', icon: Calendar },
    { id: 'census', name: 'Census', icon: FileText },
    { id: 'military', name: 'Military', icon: FileText },
    { id: 'immigration', name: 'Immigration', icon: FileText },
  ];

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || record.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'birth': return '👶';
      case 'death': return '⚰️';
      case 'marriage': return '💒';
      case 'census': return '📊';
      case 'military': return '🎖️';
      case 'immigration': return '🚢';
      default: return '📄';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 pb-20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-screen-sm mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Historical Records</h1>
              <p className="text-sm text-gray-600">Discover your family history</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search records, names, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {recordTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedFilter === type.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter(type.id)}
              className="whitespace-nowrap"
            >
              <type.icon className="w-3 h-3 mr-1" />
              {type.name}
            </Button>
          ))}
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </motion.div>
          ) : (
            filteredRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {getRecordIcon(record.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{record.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(record.confidence)}`}>
                          {record.confidence}%
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">{record.person}</div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {record.location}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                      
                      <div className="text-xs text-gray-500">
                        Source: {record.source}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-1">
                      <Button size="sm" variant="outline" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Add Record Button */}
        <div className="mt-8">
          <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
            <FileText className="w-4 h-4 mr-2" />
            Add New Record
          </Button>
        </div>
      </div>
    </div>
  );
} 