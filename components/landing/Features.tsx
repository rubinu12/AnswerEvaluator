'use client';

import { FileCheck2, Bot, BarChart3, History, BrainCircuit, BookOpen, Repeat, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

// --- [NEW] Updated features for accuracy and to include new offerings ---
const features = [
  { 
    icon: <BrainCircuit size={28} className="text-emerald-500" />, 
    title: 'AI Mains Analysis', 
    description: 'Get Gemini-powered feedback on your handwritten answers across five crucial parameters, from structure to content depth.' 
  },
  { 
    icon: <History size={28} className="text-blue-500" />, 
    title: 'Comprehensive PYQ Bank', 
    description: 'Practice with a vast and growing bank of Prelims & Mains questions, complete with detailed explanations and performance tracking.' 
  },
  { 
    icon: <Repeat size={28} className="text-purple-500" />, 
    title: 'Daily Mains Practice', 
    description: 'Participate in daily answer writing challenges, see how others approach the same question, and climb the daily leaderboard.'
  },
  { 
    icon: <Bot size={28} className="text-orange-500" />, 
    title: 'Strategic Mentor Feedback', 
    description: "Go beyond scores with our AI Mentor's 'Red, Green, and Blue Pen' analysis, providing corrections, value-adds, and appreciation." 
  },
  { 
    icon: <BarChart3 size={28} className="text-red-500" />, 
    title: 'Unified Performance Analytics', 
    description: 'Track your progress across both Mains and Prelims from a single dashboard to pinpoint your exact weaknesses.' 
  },
  { 
    icon: <Trophy size={28} className="text-indigo-500" />, 
    title: 'Ideal Answers & Topper Insights', 
    description: 'Receive model answers and topper-level keywords for every question to use as a benchmark for your own study.' 
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-slate-50/70 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <p className="text-base font-semibold text-emerald-600">A Complete Ecosystem</p>
                <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">One Platform for Prelims & Mains</h2>
            </div>
            
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        className="p-8 bg-white rounded-2xl shadow-xl border border-gray-100 cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ translateY: -10, transition: { duration: 0.3 } }}
                    >
                        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-100">{feature.icon}</div>
                        <h3 className="mt-6 text-xl font-bold text-gray-900">{feature.title}</h3>
                        <p className="mt-2 text-base text-gray-600">{feature.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  );
}