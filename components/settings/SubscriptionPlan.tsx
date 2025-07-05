"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, CheckCircle, Zap, Star, Crown, AlertCircle, Plus, Edit2, Calendar } from 'lucide-react';
import { useUnifiedSession } from '@/hooks/useUnifiedSession';

interface SubscriptionData {
  id?: string;
  plan: 'FREE' | 'PRO' | 'TEAM' | 'ENTERPRISE';
  status: 'FREE' | 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  billingCycle?: 'MONTHLY' | 'YEARLY';
  amount?: number;
  startDate?: string;
  endDate?: string;
  renewalDate?: string;
}

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

const plans = [
  {
    name: 'FREE',
    displayName: 'Free',
    price: { monthly: 0, yearly: 0 },
    features: [
      'Basic AI tool access',
      'Limited challenges (5/month)',
      'Community support',
      'Basic analytics',
      '50 ProofPoints™ starter pack'
    ],
    icon: Star,
    color: 'text-yellow-500',
    bgColor: 'from-yellow-50 to-yellow-100'
  },
  {
    name: 'PRO',
    displayName: 'Pro',
    price: { monthly: 9.99, yearly: 99.99 },
    features: [
      'Full AI tool access',
      'Unlimited challenges',
      'Priority support',
      'Advanced analytics',
      'Custom rewards & badges',
      'Early access to new tools',
      '500 ProofPoints™ monthly bonus'
    ],
    icon: Zap,
    color: 'text-purple-500',
    bgColor: 'from-purple-50 to-purple-100',
    popular: true
  },
  {
    name: 'TEAM',
    displayName: 'Team',
    price: { monthly: 19.99, yearly: 199.99 },
    features: [
      'Everything in Pro',
      'Team management (up to 10 users)',
      'Collaborative challenges',
      'Team analytics dashboard',
      'Custom team badges',
      'Dedicated team support',
      '1000 ProofPoints™ team pool'
    ],
    icon: Crown,
    color: 'text-blue-500',
    bgColor: 'from-blue-50 to-blue-100'
  },
  {
    name: 'ENTERPRISE',
    displayName: 'Enterprise',
    price: { monthly: 49.99, yearly: 499.99 },
    features: [
      'Everything in Team',
      'Unlimited team members',
      'Custom integrations',
      'White-label options',
      'API access',
      'Dedicated success manager',
      'Custom ProofPoints™ system'
    ],
    icon: Crown,
    color: 'text-indigo-500',
    bgColor: 'from-indigo-50 to-indigo-100'
  }
];

export default function SubscriptionPlan() {
  const router = useRouter();
  const unifiedSession = useUnifiedSession();
  
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('FREE');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [upgrading, setUpgrading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });

  // Load subscription data
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!unifiedSession.user?.id) return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch user subscription data
        const response = await fetch(`/api/user/${unifiedSession.user.id}/subscription`);
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
          setPaymentMethods(data.paymentMethods || []);
          setSelectedPlan(data.subscription?.plan || 'FREE');
          setBillingCycle(data.subscription?.billingCycle || 'MONTHLY');
        } else {
          // Set default free subscription
          setSubscription({
            plan: 'FREE',
            status: 'FREE',
          });
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
        setError('Failed to load subscription information');
        // Set default free subscription on error
        setSubscription({
          plan: 'FREE',
          status: 'FREE',
        });
      } finally {
        setLoading(false);
      }
    };

    if (unifiedSession.status !== 'loading') {
      loadSubscriptionData();
    }
  }, [unifiedSession.status, unifiedSession.user?.id]);

  const handlePlanUpgrade = async (planName: string) => {
    if (!unifiedSession.user?.id || planName === subscription?.plan) return;
    
    // Only FREE plan is working, show coming soon for others
    if (planName !== 'FREE') {
      setShowComingSoon(true);
      return;
    }
    
    setUpgrading(true);
    setError(null);
    
    try {
      setSuccess(`Plan upgrade to ${planName} initiated! (Demo mode - no actual billing)`);
      
      // Simulate upgrade - in production this would integrate with payment processor
      setTimeout(() => {
        setSubscription({
          ...subscription,
          plan: planName as any,
          status: 'ACTIVE',
          billingCycle: billingCycle,
          amount: plans.find(p => p.name === planName)?.price[billingCycle === 'MONTHLY' ? 'monthly' : 'yearly'] || 0
        });
        setSelectedPlan(planName);
      }, 1000);
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subscription');
    } finally {
      setTimeout(() => setUpgrading(false), 1000);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!unifiedSession.user?.id) return;
    
    // Validate form
    if (!paymentForm.cardNumber || !paymentForm.expiryMonth || !paymentForm.expiryYear || !paymentForm.cvv || !paymentForm.cardholderName) {
      setError('Please fill in all payment method fields');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/payment/add-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: unifiedSession.user.id,
          ...paymentForm,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add payment method');
      }

      const result = await response.json();
      setPaymentMethods([...paymentMethods, result.paymentMethod]);
      setShowAddPayment(false);
      setPaymentForm({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: ''
      });
      setSuccess('Payment method added successfully!');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error adding payment method:', error);
      setError(error instanceof Error ? error.message : 'Failed to add payment method');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600';
      case 'TRIAL': return 'text-blue-600';
      case 'PAST_DUE': return 'text-red-600';
      case 'CANCELED': return 'text-gray-600';
      case 'EXPIRED': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-7 h-7 text-green-500" />;
      case 'TRIAL': return <Zap className="w-7 h-7 text-blue-500" />;
      case 'PAST_DUE': return <AlertCircle className="w-7 h-7 text-red-500" />;
      case 'CANCELED': return <AlertCircle className="w-7 h-7 text-gray-500" />;
      case 'EXPIRED': return <AlertCircle className="w-7 h-7 text-red-500" />;
      default: return <Star className="w-7 h-7 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        <p className="mt-4 text-gray-600">Loading subscription...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 max-w-4xl mx-auto"
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
        Subscription Plan
      </motion.h1>

      {/* Error/Success Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded"
        >
          {success}
        </motion.div>
      )}

      {/* Current Subscription Status */}
      <motion.div
        className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow px-5 py-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-indigo-500" />
          <div>
            <div className="text-xs text-gray-500">Current Plan</div>
            <div className="text-xl font-bold text-indigo-700">
              {subscription?.plan || 'FREE'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusIcon(subscription?.status || 'FREE')}
          <div>
            <div className="text-xs text-gray-500">Status</div>
            <div className={`text-xl font-bold ${getStatusColor(subscription?.status || 'FREE')}`}>
              {subscription?.status || 'FREE'}
            </div>
          </div>
        </div>
        {subscription?.renewalDate && (
          <div className="flex items-center gap-3">
            <Calendar className="w-7 h-7 text-purple-500" />
            <div>
              <div className="text-xs text-gray-500">Next Billing</div>
              <div className="text-sm font-bold text-purple-700">
                {new Date(subscription.renewalDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Billing Cycle Toggle */}
      <motion.div
        className="flex justify-center mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            className={`px-4 py-2 rounded-md transition ${
              billingCycle === 'MONTHLY'
                ? 'bg-white text-indigo-600 shadow'
                : 'text-gray-600'
            }`}
            onClick={() => setBillingCycle('MONTHLY')}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-md transition ${
              billingCycle === 'YEARLY'
                ? 'bg-white text-indigo-600 shadow'
                : 'text-gray-600'
            }`}
            onClick={() => setBillingCycle('YEARLY')}
          >
            Yearly <span className="text-green-600 text-xs font-semibold">Save 20%</span>
          </button>
        </div>
      </motion.div>

      {/* Plans Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {plans.map((plan, index) => {
          const isCurrentPlan = subscription?.plan === plan.name;
          const price = billingCycle === 'MONTHLY' ? plan.price.monthly : plan.price.yearly;
          
          return (
            <motion.div
              key={plan.name}
              className={`relative bg-white rounded-xl shadow-lg p-6 ${
                isCurrentPlan ? 'ring-2 ring-indigo-500' : 'hover:shadow-xl'
              } transition-all`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Current
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.bgColor} flex items-center justify-center ${plan.color}`}>
                  <plan.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{plan.displayName}</h3>
                  <div className="text-2xl font-bold text-gray-900">
                    ${price}
                    <span className="text-sm text-gray-500 font-normal">
                      /{billingCycle === 'MONTHLY' ? 'month' : 'year'}
                    </span>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2 rounded-lg font-medium transition ${
                  isCurrentPlan
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                }`}
                onClick={() => !isCurrentPlan && handlePlanUpgrade(plan.name)}
                disabled={isCurrentPlan || upgrading}
              >
                {isCurrentPlan ? 'Current Plan' : upgrading ? 'Upgrading...' : 'Select Plan'}
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        className="bg-white rounded-xl shadow-lg p-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Payment Methods</h3>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition text-sm"
            onClick={() => setShowAddPayment(true)}
          >
            <Plus className="w-4 h-4" />
            Add Payment Method
          </button>
        </div>

        {paymentMethods.length > 0 ? (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
                  <div>
                    <div className="font-semibold text-sm">
                      {method.brand.toUpperCase()} •••• {method.last4}
                    </div>
                    <div className="text-xs text-gray-500">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <button className="text-indigo-600 hover:text-indigo-700">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No payment methods added</p>
            <p className="text-sm">Add a payment method to upgrade your plan</p>
          </div>
        )}
      </motion.div>

      {/* Add Payment Method Modal */}
      <AnimatePresence>
        {showAddPayment && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Payment Method</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={paymentForm.cardholderName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <select
                      value={paymentForm.expiryMonth}
                      onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">MM</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select
                      value={paymentForm.expiryYear}
                      onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">YYYY</option>
                      {[...Array(10)].map((_, i) => (
                        <option key={i} value={new Date().getFullYear() + i}>
                          {new Date().getFullYear() + i}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddPayment(false);
                    setPaymentForm({
                      cardNumber: '',
                      expiryMonth: '',
                      expiryYear: '',
                      cvv: '',
                      cardholderName: ''
                    });
                  }}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPaymentMethod}
                  className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 focus:ring-2 focus:ring-indigo-300 transition disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Adding...' : 'Add Card'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-indigo-500" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon!</h3>
              <p className="text-gray-600 mb-6">
                Premium plan upgrades are coming soon. Stay tuned for exciting new features and benefits!
              </p>
              
              <button
                onClick={() => setShowComingSoon(false)}
                className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 