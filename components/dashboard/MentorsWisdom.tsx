"use client";

import { useState } from 'react';
import { PenSquare, ChevronLeft, ChevronRight, Quote, MoreHorizontal, Star } from 'lucide-react';

const wisdoms = [
  {
    category: "Answer Writing",
    author: "by Dr. Priya Sharma",
    text: "Structure your answers using the PREP method: Point, Reason, Example, Point. This ensures clarity and comprehensive coverage of the question while maintaining examiner engagement."
  },
  {
    category: "Strategy",
    author: "by Prof. Rajesh Kumar",
    text: "Always begin with a brief introduction that defines key terms and sets context. End with a balanced conclusion that offers a way forward or synthesizes different viewpoints."
  },
  {
    category: "Presentation",
    author: "by Dr. Anita Verma",
    text: "Use diagrams, flowcharts, and bullet points judiciously. Visual representation can earn you extra marks and shows analytical thinking to the examiner."
  },
  {
    category: "Time Management",
    author: "by Shri Vikram Singh",
    text: "Practice writing 150 words in exactly 10 minutes and 250 words in 15 minutes. Time management is crucial in the UPSC mains examination for optimal performance."
  }
];

export default function MentorsWisdom() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? wisdoms.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setCurrentIndex(prev => (prev === wisdoms.length - 1 ? 0 : prev + 1));
  };
  
  const currentWisdom = wisdoms[currentIndex];

  return (
    <div className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-200/60">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-emerald-400 to-green-600 text-white rounded-2xl p-3 shadow-lg">
            <PenSquare size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Mentor's Wisdom</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">{currentWisdom.category}</span>
              <span className="text-sm text-gray-500">{currentWisdom.author}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handlePrev} className="p-2 rounded-full border border-emerald-200 bg-white/50 hover:bg-emerald-50 btn">
            <ChevronLeft className="h-5 w-5 text-emerald-700" />
          </button>
          <button onClick={handleNext} className="p-2 rounded-full border border-emerald-200 bg-white/50 hover:bg-emerald-50 btn">
            <ChevronRight className="h-5 w-5 text-emerald-700" />
          </button>
        </div>
      </div>

      <div className="relative mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <Quote className="absolute -top-3 -left-3 h-10 w-10 text-emerald-200" fill="currentColor" />
        <p className="text-gray-700 leading-relaxed z-10 relative">
          {currentWisdom.text}
        </p>
        <MoreHorizontal className="absolute bottom-4 right-4 h-5 w-5 text-emerald-400" />
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          {wisdoms.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${currentIndex === index ? 'w-6 bg-emerald-500' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">Wisdom {currentIndex + 1} of {wisdoms.length}</span>
          <a href="#" className="flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-800">
            <Star size={16} />
            Daily Insight
          </a>
        </div>
      </div>
    </div>
  );
}