'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Wand2, FileText, ArrowRight } from 'lucide-react';

// FIX: Using a direct relative path is the most reliable way to import a neighboring component.
// The error you saw is likely a caching issue with the development server.
import InteractiveTrialModal from './InteractiveTrialModal';

export default function TrialEvaluator() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const steps = [
        {
            icon: Upload,
            title: 'Upload Your Answer',
            description: 'Snap a picture or upload a PDF of your handwritten answer sheet.',
        },
        {
            icon: Wand2,
            title: 'AI Magic Happens',
            description: 'Our engine analyzes handwriting, structure, keywords, and context.',
        },
        {
            icon: FileText,
            title: 'Get Your Report',
            description: 'Receive a detailed, actionable report in under 60 seconds.',
        },
    ];

    return (
        // This container includes the vertical padding 'py-24' for consistent spacing.
        <div className="w-full bg-slate-50/70 py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                 <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                    Try it to Believe It
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                    Experience the power of our AI evaluator with a free trial. No sign-up required.
                </p>
                
                <div className="mt-12 grid gap-8 md:grid-cols-3">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-600">
                                <step.icon className="h-8 w-8" />
                            </div>
                            <h3 className="mt-5 text-xl font-semibold text-gray-900">{step.title}</h3>
                            <p className="mt-2 text-base text-gray-500">{step.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                    >
                        Start Your Free Trial
                        <ArrowRight className="ml-3 h-6 w-6" />
                    </button>
                </div>
            </div>
            
            {/* The modal component is included here and controlled by the 'isModalOpen' state */}
            <InteractiveTrialModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSignUpSuccess={() => {
                    // You can handle post-signup success logic here, e.g., show a message or close modal
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
}