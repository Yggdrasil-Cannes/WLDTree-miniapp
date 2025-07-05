'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TreePine, Plus, Edit, MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import TabNavigation from '../../components/navigation/TabNavigation';
import DataImportModal from '../../components/ui/modals/DataImportModal';
import AddMemberModal from '../../components/ui/modals/AddMemberModal';
import { WorldTreeProvider, useWorldTree } from '../../contexts/WorldTreeContext';
import { TabBar } from "@/components/navigation/TabBar";

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  birthYear?: string;
  deathYear?: string;
  location?: string;
  photo?: string;
  x: number;
  y: number;
  gender: 'male' | 'female' | 'unknown';
  parentIds?: string[];
  spouseId?: string;
}

function TreePageContent() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const { state, actions } = useWorldTree();

  return (
    <div className="relative h-screen">
      <TabNavigation />

      {/* Modals */}
      <AnimatePresence>
        {showImportModal && (
          <DataImportModal 
            onClose={() => setShowImportModal(false)}
            onImport={actions.importFamilyData}
          />
        )}
        
        {showAddModal && (
          <AddMemberModal
            onClose={() => setShowAddModal(false)}
            onSubmit={actions.addFamilyMember}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TreePage() {
  console.log('🌳 TreePage: Loading tree page');
  
  return (
    <WorldTreeProvider>
      <TreePageContent />
    </WorldTreeProvider>
  );
} 