'use client';

import { motion } from 'framer-motion';
import { FileText, BrainCircuit, BarChart2 } from 'lucide-react';
import Link from 'next/link'; // Import the Link component

// The old modal imports and state management have been removed.

export default function TrialEvaluator() {
  // All the useState hooks for modals (isSignUpOpen, isEvaluationOpen, etc.) have been removed.

  return (
    <section id="trial" className="py-20 sm:py-32 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-serif">
            Experience the Future of UPSC Preparation
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Our AI, powered by Google's Gemini, provides feedback that is not just accurate, but strategic. See for yourself.
          </p>
        </motion.div>

        {/* --- [THE FIX] --- */}
        {/* The old button and its complex onClick logic have been replaced with a simple Link */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/auth" // The link now points directly to your main authentication page
            className="btn text-lg font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-900 px-8 py-4 transition-transform hover:scale-105"
          >
            Get Your 2 Free Evaluations
          </Link>
        </div>
        {/* --- END FIX --- */}

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-full shadow-md border border-slate-200/60">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">Upload Your Answer</h3>
            <p className="mt-2 text-sm text-slate-500">
              Provide a PDF or image of your handwritten mock answer.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-full shadow-md border border-slate-200/60">
              <BrainCircuit className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">Receive AI Analysis</h3>
            <p className="mt-2 text-sm text-slate-500">
              Our AI performs a multi-stage analysis, from structure to content depth.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-full shadow-md border border-slate-200/60">
              <BarChart2 className="h-8 w-8 text-purple-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">Improve Your Score</h3>
            <p className="mt-2 text-sm text-slate-500">
              Get actionable feedback and a model answer to elevate your rank.
            </p>
          </div>
        </div>
      </div>
      {/* The SignUpModal and EvaluationModal components have been completely removed from this file. */}
    </section>
  );
}