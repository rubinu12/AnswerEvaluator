'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Tag } from 'lucide-react';
import SignUpModal from './SignUpModal';

export default function PricingAndCta() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const plans = [
    {
      name: 'Basic',
      price: { monthly: 9, yearly: 90 },
      description: 'Perfect for getting started and occasional use.',
      features: ['5 Evaluations/month', 'Standard AI Feedback', 'Community Insights'],
      cta: 'Choose Basic',
      popular: false,
    },
    {
      name: 'Pro',
      price: { monthly: 19, yearly: 190 },
      description: 'For dedicated aspirants who want to accelerate their growth.',
      features: ['25 Evaluations/month', 'Advanced AI Feedback', 'Topper Comparisons', 'Performance Analytics'],
      cta: 'Choose Pro',
      popular: true,
    },
    {
      name: 'Unlimited',
      price: { monthly: 49, yearly: 490 },
      description: 'For power users and institutions who need maximum capacity.',
      features: ['Unlimited Evaluations', 'All Pro Features', 'Dedicated Support'],
      cta: 'Contact Us',
      popular: false,
    },
  ];

  const discountDetails = {
    percentage: 25,
    planName: 'Pro Plan',
    price: 19,
    discountedPrice: 14,
  };

  return (
    <>
      {/* FIX: Removed the vertical padding (py-16) from this container to eliminate the gap */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 lg:gap-12">
          
          {/* --- Left Section: Standard Pricing --- */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-extrabold text-gray-900">Pricing</h1>
            <p className="mt-4 text-lg text-gray-600">
              Invest in your success. Choose a plan that scales with your ambition.
            </p>

            <div className="mt-8 flex items-center space-x-4">
              <span className={`font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={billingCycle === 'yearly'}
                  onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
              <span className={`font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </div>

            <div className="mt-8 space-y-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-white rounded-xl shadow-md p-6 border transition-all ${plan.popular ? 'border-emerald-500 border-2' : 'border-gray-200'}`}
                >
                  <div className="grid md:grid-cols-3 md:gap-6 items-center">
                    <div className="md:col-span-2">
                      <div className="flex items-center">
                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                        {plan.popular && (
                          <span className="ml-3 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                      <ul className="mt-4 space-y-2 text-sm">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center">
                            <Check className="flex-shrink-0 h-4 w-4 text-green-500" />
                            <span className="ml-2 text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-center mt-6 md:mt-0">
                      <p className="text-4xl font-extrabold text-gray-900">
                        ${plan.price[billingCycle]}
                        <span className="text-base font-medium text-gray-500">
                          /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      </p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className={`mt-4 w-full py-2.5 px-5 text-sm font-semibold rounded-lg shadow-sm ${
                          plan.popular
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-gray-800 text-white hover:bg-gray-900'
                        }`}
                      >
                        {plan.cta}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- Right Section: Personal Offer --- */}
          <div className="mt-12 lg:mt-0">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 text-center sticky top-24"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Tag className="w-10 h-10 mx-auto text-emerald-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Your Personal Offer</h2>
              <p className="mt-2 text-5xl font-extrabold text-emerald-600">
                {discountDetails.percentage}% OFF
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-700">
                on the {discountDetails.planName}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <p className="text-xl text-gray-400 line-through">${discountDetails.price}/mo</p>
                <p className="text-3xl font-bold text-gray-900">${discountDetails.discountedPrice}/mo</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-6 w-full py-3 text-base font-medium rounded-full text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg"
              >
                Claim Offer
              </button>
              <p className="mt-4 text-xs text-gray-500">
                Unlocked by completing the free trial.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
      <SignUpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}