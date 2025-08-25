'use client';

import { useState } from 'react';
import { useAuthContext } from '@/lib/AuthContext';
import InteractiveTrialModal from './InteractiveTrialModal';
import { ArrowRight, UploadCloud, LoaderCircle, FileText, HelpCircle } from 'lucide-react';

// --- This is the component shown BEFORE the user signs up ---
const FreeTrialPrompt = ({ onSignUpClick }: { onSignUpClick: () => void }) => (
    <div className="text-center">
        <p className="text-base font-semibold text-emerald-600">
            Experience It First-Hand
        </p>
        <h2 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Take a Free Trial Evaluation
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Sign up for free and evaluate your first essay to see the power of AI feedback. No credit card required.
        </p>
        <button
            onClick={onSignUpClick}
            className="mt-8 btn inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold rounded-xl shadow-lg text-lg"
        >
            Start Your Free Trial
            <ArrowRight className="ml-2" />
        </button>
    </div>
);

// --- This is the component shown AFTER the user signs up ---
const UploadArea = ({ onUploadClick }: { onUploadClick: () => void }) => {
    const essayTopics = [
        "Wisdom finds truth.",
        "Values are not what humanity is, but what humanity ought to be.",
        "The best way to find yourself is to lose yourself in the service of others.",
        "Courage is the most important of all the virtues."
    ];

    return (
        <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Column: Upload Box */}
            <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-gray-800 text-center">Upload Your Essay</h2>
                <p className="text-gray-500 text-center mb-6 text-sm">Let's evaluate your writing skills.</p>
                <div 
                    onClick={onUploadClick}
                    className="w-full p-10 flex flex-col items-center justify-center border-4 border-dashed border-gray-300 rounded-2xl bg-gray-50/80 hover:bg-white hover:border-emerald-400 transition-all duration-300 cursor-pointer"
                >
                    <UploadCloud className="w-12 h-12 text-gray-400" />
                    <p className="mt-4 font-semibold text-gray-700">Click here to start evaluation</p>
                    <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG accepted</p>
                </div>
            </div>
            {/* Right Column: Instructions & Topics */}
            <div className="p-6 bg-slate-50 rounded-2xl">
                <div className="flex items-center">
                    <HelpCircle className="w-5 h-5 text-emerald-600 mr-2"/>
                    <h3 className="text-lg font-bold text-gray-800">Instructions & Topics</h3>
                </div>
                <ul className="mt-3 space-y-1 text-gray-600 list-disc list-inside text-sm">
                    <li>Choose one of the topics below.</li>
                    <li>Write around 300 words on a plain paper.</li>
                </ul>
                 <div className="mt-4 space-y-2">
                    {essayTopics.map((topic, index) => (
                        <div key={index} className="flex items-start p-2.5 bg-white rounded-lg shadow-sm">
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0"/>
                            <p className="text-gray-700 text-sm">{topic}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- A component to show while we check the auth status ---
const LoadingState = () => (
    <div className="text-center flex flex-col items-center justify-center h-64">
        <LoaderCircle className="w-12 h-12 text-gray-400 animate-spin" />
        <p className="mt-4 text-lg font-semibold text-gray-600">Checking your status...</p>
    </div>
);


export default function TrialEvaluator() {
    const { user, loading } = useAuthContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [justSignedUp, setJustSignedUp] = useState(false);

    const renderContent = () => {
        if (loading) {
            return <LoadingState />;
        }
        if (user || justSignedUp) {
            return <UploadArea onUploadClick={() => setIsModalOpen(true)} />;
        }
        return <FreeTrialPrompt onSignUpClick={() => setIsModalOpen(true)} />;
    };

    return (
        // FIX: The outer div handles filling the screen space.
        <div className="w-full bg-white h-full flex flex-col">
            {/* FIX: The inner div has fixed padding and handles scrolling, creating a consistent frame. */}
            <div className="flex-grow overflow-y-auto py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center h-full">
                    {renderContent()}
                </div>
            </div>

            <InteractiveTrialModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSignUpSuccess={() => setJustSignedUp(true)}
            />
        </div>
    );
}