'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Twitter, Linkedin, Facebook, Globe, Copy, X } from 'lucide-react';
import Image from 'next/image';

interface ShareMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (platform: 'twitter' | 'linkedin' | 'facebook' | 'world' | 'warpcast' | 'bluesky' | 'copy') => void;
}

interface ShareOption {
  id: 'twitter' | 'linkedin' | 'facebook' | 'world' | 'warpcast' | 'bluesky' | 'copy';
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  customIcon?: string;
  color: string;
}

const shareOptions: ShareOption[] = [
  {
    id: 'twitter',
    label: 'Twitter',
    icon: Twitter,
    color: 'bg-[#1DA1F2]'
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-[#0A66C2]'
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    color: 'bg-[#1877F2]'
  },
  {
    id: 'warpcast',
    label: 'Warpcast',
    customIcon: 'https://warpcast.com/og-logo.png',
    color: 'bg-[#8A2BE2]'
  },
  {
    id: 'bluesky',
    label: 'Bluesky',
    customIcon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Bluesky_Logo.svg/1200px-Bluesky_Logo.svg.png',
    color: 'bg-[#0085FF]'
  },
  {
    id: 'world',
    label: 'Share to World',
    icon: Globe,
    color: 'bg-blue-600'
  },
  {
    id: 'copy',
    label: 'Copy Link',
    icon: Copy,
    color: 'bg-gray-600'
  }
];

export function ShareMenu({ isOpen, onClose, onShare }: ShareMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 z-50"
          >
            <div className="max-w-screen-sm mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Share Review</h3>
                <button onClick={onClose} className="p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {shareOptions.map(({ id, label, icon: Icon, customIcon, color }) => (
                  <button
                    key={id}
                    onClick={() => {
                      onShare(id as any);
                      onClose();
                    }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white relative`}>
                      {customIcon ? (
                        <Image
                          src={customIcon}
                          alt={label}
                          width={20}
                          height={20}
                          className="w-5 h-5"
                        />
                      ) : Icon && (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs text-gray-600">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 