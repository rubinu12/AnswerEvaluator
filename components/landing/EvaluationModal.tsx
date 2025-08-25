'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Bot, Star, Gift, CheckCircle, AlertTriangle } from 'lucide-react';

interface EvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Define the shape of the evaluation results to match your API
interface EvaluationResult {
    overall_score: number;
    overall_feedback: string;
    // Add other fields from your actual API response if needed
}

// Define the shape of the data extracted by the OCR
interface ExtractedDataItem {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
}

type EvaluationStep = 'upload' | 'extracting' | 'verify' | 'evaluating' | 'results' | 'review' | 'coupon';

// --- Individual Step Components (no changes here, provided for completeness) ---

const UploadStep = ({ onFileSelect }: { onFileSelect: (file: File) => void }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };
    const handleClick = () => inputRef.current?.click();
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold">Upload Your Essay</h2>
            <div 
                className="mt-6 p-12 border-4 border-dashed rounded-2xl hover:border-emerald-400 cursor-pointer"
                onClick={handleClick}
            >
                <UploadCloud className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="mt-4 font-semibold">Click to upload your essay file</p>
                <p className="text-sm text-gray-500">PDF, JPG, PNG accepted</p>
                <input type="file" ref={inputRef} onChange={handleFileChange} className="hidden" accept="application/pdf,image/jpeg,image/png"/>
            </div>
        </div>
    );
};

const LoadingStep = ({ text }: { text: string }) => (
    <div className="text-center">
        <Bot className="w-16 h-16 text-emerald-500 mx-auto animate-pulse" />
        <h2 className="text-2xl font-bold mt-4">{text}</h2>
        <p className="text-gray-500 mt-2">This should only take a moment...</p>
    </div>
);

const VerifyStep = ({ extractedText, onConfirm }: { extractedText: string, onConfirm: (editedText: string) => void }) => {
    const [editedText, setEditedText] = useState(extractedText);
    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold text-center">Verify Extracted Text</h2>
            <p className="text-center text-gray-500 mb-4">Please review and edit the extracted text to ensure accuracy.</p>
            <textarea 
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full h-full p-4 border rounded-lg flex-grow resize-none"
            />
            <button onClick={() => onConfirm(editedText)} className="w-full mt-4 btn py-3 bg-emerald-600 text-white font-semibold rounded-lg">
                Confirm & Evaluate
            </button>
        </div>
    );
};

const ResultsStep = ({ result, onNext }: { result: EvaluationResult | null, onNext: () => void }) => (
    <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold mt-4">Evaluation Complete!</h2>
        <p className="text-gray-500">Here are your results:</p>
        <div className="mt-4 p-4 border rounded-lg bg-slate-50 text-left">
            <p><strong>Score:</strong> {result?.overall_score || 'N/A'} / 10</p>
            <p className="mt-2"><strong>Feedback:</strong> {result?.overall_feedback || 'No feedback available.'}</p>
        </div>
        <button onClick={onNext} className="w-full mt-4 btn py-3 bg-emerald-600 text-white font-semibold rounded-lg">
            Review & Get Your Reward
        </button>
    </div>
);

const ReviewStep = ({ onNext }: { onNext: () => void }) => {
    const [rating, setRating] = useState(0);
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold">Enjoying the Experience?</h2>
            <p className="text-gray-500 mb-6">Your feedback helps us improve. Please leave a quick review.</p>
            <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} onClick={() => setRating(star)} className={`w-12 h-12 cursor-pointer transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}/>
                ))}
            </div>
            <textarea placeholder="Tell us more (optional)..." className="w-full mt-6 p-4 border rounded-lg resize-none"/>
            <button onClick={onNext} className="w-full mt-4 btn py-3 bg-emerald-600 text-white font-semibold rounded-lg">
                Generate My Coupon
            </button>
        </div>
    );
};

const CouponStep = () => (
    <div className="text-center">
        <Gift className="w-16 h-16 text-purple-500 mx-auto" />
        <h2 className="text-2xl font-bold mt-4">Thank You for Your Feedback!</h2>
        <p className="text-gray-500 mb-6">Here is your one-time coupon for 25% off your first subscription.</p>
        <div className="p-4 bg-purple-100 text-purple-800 font-mono text-2xl border-2 border-dashed border-purple-300 rounded-lg">
            WELCOME25
        </div>
        <button className="w-full mt-6 btn py-3 bg-purple-600 text-white font-semibold rounded-lg">
            Subscribe Now & Apply Coupon
        </button>
    </div>
);

const ErrorStep = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
    <div className="text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold mt-4">An Error Occurred</h2>
        <p className="text-gray-600 mt-2 bg-red-50 p-3 rounded-lg">{error}</p>
        <button onClick={onRetry} className="w-full mt-4 btn py-3 bg-red-600 text-white font-semibold rounded-lg">
            Try Again
        </button>
    </div>
);


export default function EvaluationModal({ isOpen, onClose }: EvaluationModalProps) {
    const [step, setStep] = useState<EvaluationStep>('upload');
    const [extractedData, setExtractedData] = useState<ExtractedDataItem[]>([]);
    const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setStep('upload');
        setError(null);
        setExtractedData([]);
        setEvaluationResult(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileSelect = async (file: File) => {
        setStep('extracting');
        setError(null);
        
        const formData = new FormData();
        formData.append('file', file);
        // For the trial, we explicitly set the subject to "Essay"
        formData.append('subject', 'Essay');

        try {
            const response = await fetch('/api/prepare-evaluation', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to extract text from the document.');
            }
            
            // **SAFETY CHECK**: Ensure the result is an array and not empty
            if (!Array.isArray(result) || result.length === 0) {
                throw new Error('OCR process failed to return valid data. Please try with a clearer image.');
            }

            setExtractedData(result);
            setStep('verify');

        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleVerificationConfirm = async (editedText: string) => {
        setStep('evaluating');
        setError(null);

        // **SAFETY CHECK**: Ensure we have valid extracted data before proceeding
        if (!extractedData || extractedData.length === 0) {
            setError("Cannot proceed with evaluation: original extracted data is missing.");
            return;
        }

        // We structure the data exactly as the backend expects
        const preparedData = [{
            ...extractedData[0],
            userAnswer: editedText,
        }];

        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preparedData: preparedData,
                    subject: 'Essay', // We pass the "Essay" subject again here
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to get the final evaluation.');
            }
            
            setEvaluationResult(result);
            setStep('results');

        } catch (err: any) {
            setError(err.message);
        }
    };

    const nextStep = () => {
        const stepOrder: EvaluationStep[] = ['upload', 'extracting', 'verify', 'evaluating', 'results', 'review', 'coupon'];
        const currentIndex = stepOrder.indexOf(step);
        if (currentIndex < stepOrder.length - 1) {
            setStep(stepOrder[currentIndex + 1]);
        }
    };

    const renderContent = () => {
        if (error) {
            return <ErrorStep error={error} onRetry={resetState} />;
        }
        
        switch (step) {
            case 'upload':
                return <UploadStep onFileSelect={handleFileSelect} />;
            case 'extracting':
                return <LoadingStep text="Extracting Text from Your Document..." />;
            case 'verify':
                return <VerifyStep extractedText={extractedData[0]?.userAnswer || ''} onConfirm={handleVerificationConfirm} />;
            case 'evaluating':
                return <LoadingStep text="Evaluating Your Essay..." />;
            case 'results':
                return <ResultsStep result={evaluationResult} onNext={nextStep} />;
            case 'review':
                return <ReviewStep onNext={nextStep} />;
            case 'coupon':
                return <CouponStep />;
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] p-8 relative flex flex-col justify-center"
                    >
                        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                            <X size={24} />
                        </button>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full h-full flex flex-col justify-center"
                            >
                               {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}