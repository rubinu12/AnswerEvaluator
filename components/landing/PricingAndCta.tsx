'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

// --- [NEW] Comprehensive & Corrected Pricing Data Structure ---
const pricingData = {
    unified: {
        monthly: [
            { name: 'Essential', price: '₹249', perks: '/month', features: ['60 Evaluations/month', 'Mains & Prelims Analytics', 'Study Streak Tracker'], popular: false },
            { name: 'Premium', price: '₹499', perks: '/month', features: ['150 Evaluations/month', 'All Essential Features', 'Full PYQ Bank Access', 'Daily Mains Practice', 'All Study Resources'], popular: true },
        ],
        quarterly: [
            { name: 'Essential', price: '₹649', perks: '/quarter', features: ['60 Evaluations/month', 'Mains & Prelims Analytics', 'Study Streak Tracker', 'Save 13%'], popular: false },
            { name: 'Premium', price: '₹1299', perks: '/quarter', features: ['150 Evaluations/month', 'All Essential Features', 'Full PYQ Bank Access', 'Daily Mains Practice', 'All Study Resources', 'Save 13%'], popular: true },
        ],
        yearly: [
            { name: 'Essential', price: '₹2299', perks: '/year', features: ['60 Evaluations/month', 'Mains & Prelims Analytics', 'Study Streak Tracker', 'Save 23%'], popular: false },
            { name: 'Premium', price: '₹4499', perks: '/year', features: ['150 Evaluations/month', 'All Essential Features', 'Full PYQ Bank Access', 'Daily Mains Practice', 'All Study Resources', 'Best Value - Save 25%'], popular: true },
        ]
    },
    prelims: {
         monthly: [
             { name: 'Prelims Pro', price: '₹199', perks: '/month', features: ['Unlimited PYQ Practice', 'Detailed Explanations', 'Performance Analytics', 'Bookmark Questions'], popular: true },
        ],
        quarterly: [
             { name: 'Prelims Pro', price: '₹499', perks: '/quarter', features: ['Unlimited PYQ Practice', 'Detailed Explanations', 'Performance Analytics', 'Bookmark Questions', 'Save 16%'], popular: true },
        ],
        yearly: [
             { name: 'Prelims Pro', price: '₹1499', perks: '/year', features: ['Unlimited PYQ Practice', 'Detailed Explanations', 'Performance Analytics', 'Bookmark Questions', 'Best Value - Save 37%'], popular: true },
        ]
    },
    packs: [
        { name: 'Starter Pack', price: '₹49', evaluations: '10 Evaluations', description: "Perfect for a single subject." },
        { name: 'Full Paper Pack', price: '₹99', evaluations: '25 Evaluations', description: "Ideal for a full mock paper." },
    ]
};

type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
type PlanType = 'unified' | 'prelims' | 'packs';

// --- Main Component ---
export default function PricingAndCta() {
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('yearly');
    const [activeTab, setActiveTab] = useState<PlanType>('unified');

    const renderContent = () => {
        switch (activeTab) {
            case 'unified':
            case 'prelims':
                const plans = pricingData[activeTab][billingCycle];
                return (
                    <motion.div 
                        key={activeTab + billingCycle}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
                    >
                        {plans.map((plan: any) => (
                            <PricingCard key={plan.name} {...plan} />
                        ))}
                    </motion.div>
                );
            case 'packs':
                return (
                     <motion.div 
                        key="packs"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
                    >
                        {pricingData.packs.map(pack => (
                           <PackCard key={pack.name} {...pack} />
                        ))}
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <section className="bg-slate-50 py-20 sm:py-32">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl font-serif">
                        Flexible Plans for Every Aspirant
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        From single paper practice to a full-fledged subscription. No hidden fees, cancel anytime.
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="mt-10 flex justify-center">
                    <div className="bg-gray-200/70 rounded-full p-1 flex items-center space-x-1">
                        <TabButton id="unified" activeTab={activeTab} setActiveTab={setActiveTab} label="Unified Plans" />
                        <TabButton id="prelims" activeTab={activeTab} setActiveTab={setActiveTab} label="Prelims Only" />
                        <TabButton id="packs" activeTab={activeTab} setActiveTab={setActiveTab} label="Answer Packs" />
                    </div>
                </div>

                {/* Billing Cycle Toggle */}
                <AnimatePresence>
                    {(activeTab === 'unified' || activeTab === 'prelims') && (
                         <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-8 flex justify-center items-center"
                        >
                            <div className="bg-white rounded-full p-1 flex items-center space-x-1 shadow-md border">
                                <BillingToggle cycle="monthly" activeCycle={billingCycle} setCycle={setBillingCycle} />
                                <BillingToggle cycle="quarterly" activeCycle={billingCycle} setCycle={setBillingCycle} />
                                <BillingToggle cycle="yearly" activeCycle={billingCycle} setCycle={setBillingCycle} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </div>
        </section>
    );
}

// --- Sub-components for better organization ---

const TabButton = ({ id, activeTab, setActiveTab, label }: { id: PlanType, activeTab: PlanType, setActiveTab: (id: PlanType) => void, label: string }) => (
    <button onClick={() => setActiveTab(id)} className="relative px-3 xs:px-4 sm:px-6 py-2 text-xs xs:text-sm sm:text-base font-semibold text-gray-700 rounded-full transition-colors">
        {activeTab === id && (
            <motion.div layoutId="active-pricing-pill" className="absolute inset-0 bg-white rounded-full shadow-md" />
        )}
        <span className="relative z-10">{label}</span>
    </button>
);

const BillingToggle = ({ cycle, activeCycle, setCycle }: { cycle: BillingCycle, activeCycle: BillingCycle, setCycle: (cycle: BillingCycle) => void }) => (
    <button onClick={() => setCycle(cycle)} className="relative capitalize px-3 xs:px-4 sm:px-6 py-2 text-xs xs:text-sm sm:text-base font-semibold text-gray-700 rounded-full transition-colors">
        {activeCycle === cycle && (
            <motion.div layoutId="active-billing-pill" className="absolute inset-0 bg-emerald-500 rounded-full" />
        )}
        <span className={clsx("relative z-10", activeCycle === cycle ? "text-white" : "text-gray-500")}>{cycle}</span>
    </button>
);

const PricingCard = ({ name, price, perks, description, features, popular }: any) => (
    <motion.div 
        className={clsx("rounded-2xl p-8 flex flex-col border", popular ? 'bg-gray-900 text-white border-emerald-500 ring-2 ring-emerald-400' : 'bg-white text-gray-900 border-gray-200')}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
        {popular && <div className="text-center mb-4"><span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">Best Value</span></div>}
        <h3 className="text-2xl font-bold text-center">{name}</h3>
        <p className={clsx("mt-2 text-center text-sm", popular ? 'text-gray-300' : 'text-gray-500')}>{description}</p>
        <div className="mt-6 text-center"><span className="text-5xl font-extrabold">{price}</span><span className={clsx("text-base font-medium", popular ? 'text-gray-400' : 'text-gray-500')}>{perks}</span></div>
        <ul className="mt-8 space-y-4 text-sm flex-grow">
            {features.map((feature: string) => (
                <li key={feature} className="flex items-start">
                    <Check className={clsx("flex-shrink-0 h-5 w-5", popular ? 'text-emerald-400' : 'text-emerald-500')} />
                    <span className={clsx("ml-3", popular ? 'text-gray-300' : 'text-gray-700')}>{feature}</span>
                </li>
            ))}
        </ul>
        <div className="mt-auto pt-8">
            <Link href="/auth" className={clsx('btn block w-full py-3 px-6 text-center text-base font-semibold rounded-lg shadow-md transition-transform hover:scale-105', popular ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-800 text-white hover:bg-gray-900')}>
                Choose Plan
            </Link>
        </div>
    </motion.div>
);

const PackCard = ({ name, price, evaluations, description }: any) => (
     <motion.div 
        className="bg-white rounded-2xl p-8 flex flex-col border border-gray-200"
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
    >
        <h3 className="text-2xl font-bold text-center text-gray-900">{name}</h3>
        <p className="mt-2 text-center text-sm text-gray-500">{description}</p>
        <div className="my-8 text-center">
            <p className="text-5xl font-extrabold text-gray-900">{price}</p>
            <p className="text-base font-semibold text-emerald-600 mt-1">{evaluations}</p>
        </div>
        <div className="mt-auto">
             <Link href="/auth" className="btn block w-full py-3 px-6 text-center text-base font-semibold rounded-lg shadow-md transition-transform hover:scale-105 bg-blue-600 text-white hover:bg-blue-700">
                Purchase Pack
            </Link>
        </div>
    </motion.div>
);