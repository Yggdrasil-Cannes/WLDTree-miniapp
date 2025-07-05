"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, HelpCircle, MessageSquare, Mail, Phone, Send } from 'lucide-react';

const supportCategories = [
  {
    title: 'Technical Support',
    description: 'Get help with technical issues',
    icon: HelpCircle,
    color: 'text-indigo-500'
  },
  {
    title: 'Account Issues',
    description: 'Help with your account',
    icon: MessageSquare,
    color: 'text-purple-500'
  },
  {
    title: 'Billing Support',
    description: 'Questions about payments',
    icon: Mail,
    color: 'text-pink-500'
  }
];

export default function Support() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState('');

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
        Support & Help
      </motion.h1>

      {/* Stats Widget */}
      <motion.div
        className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow px-5 py-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <HelpCircle className="w-7 h-7 text-indigo-500" />
          <div>
            <div className="text-xs text-gray-500">Response Time</div>
            <div className="text-xl font-bold text-indigo-700">24h</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-purple-500" />
          <div>
            <div className="text-xs text-gray-500">Open Tickets</div>
            <div className="text-xl font-bold text-purple-700">2</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Support Categories */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">How can we help you?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {supportCategories.map((category, index) => (
              <motion.button
                key={category.title}
                className={`p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left ${
                  selectedCategory === category.title ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => setSelectedCategory(category.title)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center ${category.color} mb-3`}>
                  <category.icon className="w-5 h-5" />
                </div>
                <div className="font-medium text-gray-900">{category.title}</div>
                <div className="text-sm text-gray-500">{category.description}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        {selectedCategory && (
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="font-semibold text-gray-900 mb-4">Contact Support</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">{selectedCategory}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-lg focus:border-indigo-400 focus:ring-2 focus:ring-indigo-300 transition"
                  rows={4}
                  placeholder="Describe your issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 focus:ring-2 focus:ring-indigo-300 transition flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                Send Message
          </button>
            </div>
          </motion.div>
        )}

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Email Support</div>
                <div className="text-sm text-gray-500">support@worldtree.com</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Phone Support</div>
                <div className="text-sm text-gray-500">+1 (555) 123-4567</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">How do I reset my password?</div>
              <p className="text-sm text-gray-600">
                You can reset your password by clicking on the &quot;Forgot Password&quot; link on the login page.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">How do I update my subscription?</div>
              <p className="text-sm text-gray-600">
                You can update your subscription plan in the Subscription section of your settings.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-900 mb-2">What payment methods do you accept?</div>
              <p className="text-sm text-gray-600">
                We accept all major credit cards, PayPal, and cryptocurrency payments.
              </p>
        </div>
      </div>
    </div>
      </motion.div>
    </motion.div>
  );
} 