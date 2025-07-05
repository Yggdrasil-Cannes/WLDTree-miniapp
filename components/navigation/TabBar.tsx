'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import NavigationBar from '@/components/ui/navigation/NavigationBar'

interface TabBarProps {
  className?: string
}

export function TabBar({ className }: TabBarProps) {
  const [activeTab, setActiveTab] = useState('tree')
  const router = useRouter()

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Navigate to the appropriate page based on the tab
    switch (tab) {
      case 'tree':
        router.push('/tree')
        break
      case 'chat':
        router.push('/guide')
        break
      case 'request':
        router.push('/requests')
        break
    }
  }

  return (
    <div className={cn(className)}>
      <NavigationBar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
    </div>
  )
} 