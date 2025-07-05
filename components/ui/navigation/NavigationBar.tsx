'use client'

import { motion } from 'framer-motion'

interface NavigationBarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function NavigationBar({ activeTab, onTabChange }: NavigationBarProps) {
  const tabs = [
    { id: 'tree', label: 'Tree', icon: '🌳' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'request', label: 'Request', icon: '🤝' }
  ]

  return (
    <motion.div 
      className="absolute bottom-0 left-0 right-0 z-20"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="bg-black bg-opacity-80 backdrop-blur-sm border-t border-gray-800">
        <div className="flex justify-around items-center py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-2xl mb-1">{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
              
              {activeTab === tab.id && (
                <motion.div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full"
                  layoutId="activeIndicator"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
} 