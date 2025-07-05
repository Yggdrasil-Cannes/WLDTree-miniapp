"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, Lock, Eye, Download } from 'lucide-react';

const legalDocs = [
  {
    title: 'Terms of Service',
    description: 'Our terms and conditions for using WorldTree',
    icon: FileText,
    color: 'text-indigo-500'
  },
  {
    title: 'Privacy Policy',
    description: 'How we handle and protect your data',
    icon: Lock,
    color: 'text-purple-500'
  },
  {
    title: 'Cookie Policy',
    description: 'Information about our use of cookies',
    icon: Eye,
    color: 'text-pink-500'
  }
];

export default function LegalPrivacy() {
  const router = useRouter();
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  return (
    <motion.div
      className="p-4 max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <motion.button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded hover:bg-indigo-200 focus:ring-2 focus:ring-indigo-400 transition flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05, duration: 0.4 }}
      >
        <ArrowLeft className="w-5 h-5" /> Go Back
      </motion.button>

      <motion.h1
        className="text-2xl font-bold mb-2 text-indigo-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        Legal & Privacy
      </motion.h1>

      {/* Stats Widget */}
      <motion.div
        className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow px-5 py-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <Shield className="w-7 h-7 text-indigo-500" />
          <div>
            <div className="text-xs text-gray-500">Data Protection</div>
            <div className="text-xl font-bold text-indigo-700">GDPR Compliant</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Lock className="w-7 h-7 text-purple-500" />
          <div>
            <div className="text-xs text-gray-500">Privacy Level</div>
            <div className="text-xl font-bold text-purple-700">High</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Legal Documents */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Legal Documents</h3>
          <div className="space-y-4">
            {legalDocs.map((doc, index) => (
              <motion.div
                key={doc.title}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                onClick={() => setSelectedDoc(doc.title)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ${doc.color}`}>
                    <doc.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{doc.title}</div>
                    <div className="text-sm text-gray-500">{doc.description}</div>
                  </div>
                </div>
                <Download className="w-5 h-5 text-gray-400" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Data Collection</div>
                  <div className="text-sm text-gray-500">Control what data we collect</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 focus:ring-2 focus:ring-indigo-300 transition">
                Manage
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Data Sharing</div>
                  <div className="text-sm text-gray-500">Control how your data is shared</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 focus:ring-2 focus:ring-indigo-300 transition">
                Manage
              </button>
            </div>
          </div>
        </div>

        {/* Data Rights */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Data Rights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">Right to Access</div>
              <p className="text-sm text-gray-600 mb-3">
                You have the right to request a copy of your personal data that we hold.
              </p>
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 focus:ring-2 focus:ring-indigo-300 transition">
                Request Data
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">Right to Deletion</div>
              <p className="text-sm text-gray-600 mb-3">
                You can request the deletion of your personal data from our systems.
              </p>
              <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 focus:ring-2 focus:ring-indigo-300 transition">
                Delete Data
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{selectedDoc}</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <div className="prose prose-indigo max-w-none">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <p>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedDoc(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 focus:ring-2 focus:ring-indigo-300 transition">
                Download PDF
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
} 