'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LoaderCircle, UploadCloud, Star, Gift, CheckCircle, Bot, FileText, Send } from 'lucide-react';

// Props interface remains unchanged
interface InteractiveTrialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignUpSuccess: () => void;
}

type ModalState = 'signUp' | 'upload' | 'loadingOcr' | 'verifyText' | 'loadingEvaluation' | 'showResult' | 'getReview' | 'showCoupon';

export default function InteractiveTrialModal({ isOpen, onClose, onSignUpSuccess }: InteractiveTrialModalProps) {
    // All state and logic hooks remain unchanged
    const [modalState, setModalState] = useState<ModalState>('signUp');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preparedData, setPreparedData] = useState<any[]>([]);
    const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
    const [editableText, setEditableText] = useState('');
    const [userRating, setUserRating] = useState(0);

    // useEffect for resetting state remains unchanged
    useEffect(() => {
        if (isOpen) {
            setModalState('signUp');
            setError('');
            setIsLoading(false);
            setEmail('');
            setPassword('');
            setSelectedFile(null);
            setUserRating(0);
        }
    }, [isOpen]);

    // All handler functions' logic remains identical
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            onSignUpSuccess();
            setModalState('upload');
        } catch (err: any) {
            setError(err.message.replace('Firebase: ', ''));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (e.target.files[0].size > 5 * 1024 * 1024) {
                setError('File size should not exceed 5MB for the trial.');
                return;
            }
            setSelectedFile(e.target.files[0]);
            setError('');
            handlePrepareEvaluation(e.target.files[0]); // Automatically start upload
        }
    };
    
    const handlePrepareEvaluation = async (file: File) => {
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }
        setIsLoading(true);
        setError('');
        setModalState('loadingOcr');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subject', 'Essay');
        try {
            const response = await fetch('/api/prepare-evaluation', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to extract text.');
            setPreparedData(result);
            setEditableText(result[0]?.userAnswer || 'Could not extract text from the document.');
            setModalState('verifyText');
        } catch (err: any) {
            setError(err.message);
            setModalState('upload');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmEvaluation = async () => {
        setIsLoading(true);
        setError('');
        setModalState('loadingEvaluation');
        const updatedPreparedData = [{ ...preparedData[0], userAnswer: editableText }];
        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preparedData: updatedPreparedData, subject: 'Essay' }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to get evaluation.');
            setEvaluationResult(result);
            setModalState('showResult');
        } catch (err: any) {
            setError(err.message);
            setModalState('verifyText');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReviewSubmit = () => {
        if (userRating > 0) {
            console.log(`User rated: ${userRating} stars`);
            setModalState('showCoupon');
        } else {
            alert("Please provide a rating to get your coupon!");
        }
    };

    if (!isOpen) return null;

    // --- NEW: Redesigned Loading Component ---
    const RedesignedLoadingGlimpse = ({ title }: { title: string }) => (
        <div className="flex flex-col items-center justify-center text-center h-full">
            <Bot className="w-16 h-16 text-emerald-500 animate-pulse" />
            <h2 className="text-2xl font-bold mt-6">{title}</h2>
            <p className="text-gray-500 mt-2">Our AI is analyzing your document. Please wait...</p>
        </div>
    );
    
    const renderModalContent = () => {
        switch (modalState) {
            case 'signUp':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-center text-gray-900">Create Your Free Account</h2>
                        <p className="text-center text-gray-500 mt-2">to start your first evaluation.</p>
                        <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" />
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <button type="submit" disabled={isLoading} className="w-full mt-2 btn py-3 px-4 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 disabled:bg-emerald-300 flex items-center justify-center">
                                {isLoading && <LoaderCircle className="animate-spin mr-2" />}
                                {isLoading ? 'Signing Up...' : 'Sign Up & Continue'}
                            </button>
                        </form>
                    </>
                );
            case 'upload':
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">Upload Your Essay</h2>
                        <p className="text-gray-500 mt-2">Upload your handwritten essay for a free AI evaluation.</p>
                        <label htmlFor="trial-file-upload" className="mt-6 w-full p-12 flex flex-col items-center justify-center border-4 border-dashed border-gray-300 rounded-2xl bg-gray-50/80 hover:bg-white hover:border-emerald-400 transition-all duration-300 cursor-pointer">
                            <UploadCloud className="w-16 h-16 text-gray-400" />
                            <p className="mt-4 font-semibold text-gray-700">{selectedFile ? selectedFile.name : 'Click or Drag to Upload'}</p>
                            <p className="mt-1 text-sm text-gray-500">PDF, JPG, PNG accepted. Max 5MB.</p>
                        </label>
                        <input id="trial-file-upload" type="file" className="hidden" onChange={handleFileChange} accept="application/pdf,image/jpeg,image/png" />
                        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    </div>
                );
            case 'loadingOcr': return <RedesignedLoadingGlimpse title="Extracting Your Handwriting..." />;
            case 'verifyText':
                return (
                    <div className="h-full flex flex-col">
                        <h2 className="text-2xl font-bold text-center">Verify Extracted Text</h2>
                        <p className="text-center text-gray-500 mb-4">Please review and edit the text to ensure accuracy.</p>
                        <textarea className="w-full h-full p-4 border rounded-lg flex-grow resize-none bg-slate-50" value={editableText} onChange={(e) => setEditableText(e.target.value)} />
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        <button onClick={handleConfirmEvaluation} disabled={isLoading} className="w-full mt-4 btn py-3 bg-emerald-600 text-white font-semibold rounded-lg flex items-center justify-center">
                            {isLoading && <LoaderCircle className="animate-spin mr-2" />}
                            {isLoading ? 'Evaluating...' : 'Confirm & Evaluate'}
                        </button>
                    </div>
                );
            case 'loadingEvaluation': return <RedesignedLoadingGlimpse title="AI is Analyzing Your Essay..." />;
            case 'showResult':
                return (
                    <div className="text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-bold mt-4">Evaluation Complete!</h2>
                        <div className="mt-4 h-80 overflow-y-auto p-4 border rounded-lg bg-slate-50 text-left space-y-3">
                            <h3 className="font-bold text-lg">Overall Score: {evaluationResult?.overallScore}/{evaluationResult?.totalMarks}</h3>
                            <div><h4 className="font-semibold">General Assessment:</h4><p>{evaluationResult?.overallFeedback?.generalAssessment}</p></div>
                            <div><h4 className="font-semibold">Strengths:</h4><p>{evaluationResult?.overallFeedback?.keyStrengths?.join(', ')}</p></div>
                            <div><h4 className="font-semibold">Areas for Improvement:</h4><p>{evaluationResult?.overallFeedback?.areasForImprovement?.join(', ')}</p></div>
                        </div>
                        <button onClick={() => setModalState('getReview')} className="w-full mt-4 btn py-3 bg-emerald-600 text-white font-semibold rounded-lg">
                            Review & Get Your Reward
                        </button>
                    </div>
                );
            case 'getReview':
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold">How was your experience?</h2>
                        <p className="text-gray-500 mb-6">Leave a review to receive a discount coupon!</p>
                        <div className="flex justify-center space-x-2">
                            {[1, 2, 3, 4, 5].map(star => (<Star key={star} onClick={() => setUserRating(star)} className={`w-12 h-12 cursor-pointer transition-colors ${userRating >= star ? 'text-yellow-400' : 'text-gray-300'}`} />))}
                        </div>
                        <textarea placeholder="Tell us more (optional)..." className="w-full mt-6 p-4 border rounded-lg resize-none" />
                        <button onClick={handleReviewSubmit} className="w-full mt-4 btn py-3 bg-emerald-600 text-white font-semibold rounded-lg">
                            Submit Review & Get Coupon
                        </button>
                    </div>
                );
            case 'showCoupon':
                return (
                    <div className="text-center">
                        <Gift className="w-16 h-16 text-purple-500 mx-auto" />
                        <h2 className="text-2xl font-bold mt-4">Thank You!</h2>
                        <p className="text-gray-500 mb-6">Here is your one-time coupon for 20% off.</p>
                        <div className="p-4 bg-purple-100 text-purple-800 font-mono text-2xl border-2 border-dashed border-purple-300 rounded-lg">
                            {`SCORE${evaluationResult?.overallScore}`}
                        </div>
                        <button onClick={onClose} className="w-full mt-6 btn py-3 bg-purple-600 text-white font-semibold rounded-lg">
                            Subscribe Now & Apply Coupon
                        </button>
                    </div>
                );
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
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                            <X size={24} />
                        </button>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={modalState}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="w-full h-full flex flex-col justify-center"
                            >
                               {renderModalContent()}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}