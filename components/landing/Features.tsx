'use client';

import { FileCheck2, Languages, ArrowUpRight, BarChart3, Bot } from 'lucide-react';

const features = [
  { icon: <FileCheck2 size={28} className="text-emerald-500" />, title: '5-Parameter Evaluation', description: 'Our AI grades your answers on five crucial parameters: Structure, Relevance, Keywords, Clarity, and Presentation.' },
  { icon: <ArrowUpRight size={28} className="text-blue-500" />, title: 'Value Addition Insights', description: 'Receive suggestions for relevant facts, quotes, and case studies to enrich your answers and score higher marks.' },
  { icon: <Languages size={28} className="text-purple-500" />, title: 'Multilingual Support', description: 'Get evaluations in multiple languages, starting with English, Hindi, and Gujarati, to match your exam medium.' },
  { icon: <Bot size={28} className="text-orange-500" />, title: 'AI-Powered Analysis', description: 'Our advanced AI understands the nuances of Mains answers, providing feedback that feels human-like and accurate.' },
  { icon: <BarChart3 size={28} className="text-red-500" />, title: 'Performance Analytics', description: 'Track your progress over time with detailed analytics on each parameter to pinpoint your exact weaknesses.' },
];

export default function Features() {
  return (
    // FIX: Reinstating flexbox for vertical centering and adding robust padding (py-24)
    <div className="w-full h-full bg-slate-50/70 flex flex-col justify-center py-24 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          <p className="text-base font-semibold text-emerald-600">Everything You Need to Succeed</p>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">A Smarter Way to Prepare</h2>
        </div>
      </div>
      <div className="relative mt-12 w-full">
        <div className="flex w-full overflow-x-auto pb-10 scrollbar-hide">
          <div className="flex flex-nowrap px-8 md:px-20 lg:px-32">
            {features.map((feature, index) => (
              <div key={index} className="flex-none w-72 sm:w-80 p-8 mr-6 bg-white rounded-2xl shadow-xl border border-gray-100 transform transition-transform duration-300 hover:-translate-y-3 cursor-pointer">
                <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-100">{feature.icon}</div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}