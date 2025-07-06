'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TabNavigation from '../../components/navigation/TabNavigation';
import { useWorldTree } from '../../contexts/WorldTreeContext';
import { WorldTreeProvider } from '../../contexts/WorldTreeContext';

function MapPageContent() {
  const { state } = useWorldTree();

  console.log('🗺️ MapPage: Loading map page with', state.familyData.length, 'members');

  return (
    <div className="relative h-screen">
      {/* Single TabNavigation component handles all rendering */}
      <TabNavigation />
    </div>
  );
}

export default function MapPage() {
  return (
    <WorldTreeProvider>
      <MapPageContent />
    </WorldTreeProvider>
  );
} 