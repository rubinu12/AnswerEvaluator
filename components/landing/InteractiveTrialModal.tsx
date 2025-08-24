'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface InteractiveTrialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSignUpSuccess: () => void; // New prop to notify the parent page
}

type ModalState = 'signUp' | 'upload' | 'loadingOcr' | 'verifyText' | 'loadingEvaluation' | 'showResult' | 'getReview' | 'showCoupon';

export default function InteractiveTrialModal({ isOpen, onClose, onSignUpSuccess }: InteractiveTrialModalProps) {
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

    useEffect(() => {
        if (isOpen) {
            setModalState('signUp');
            // Reset all other states
            setError('');
            setIsLoading(false);
            setEmail('');
            setPassword('');
            setSelectedFile(null);
            setUserRating(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // --- THIS IS THE FIX ---
            // 1. Notify the parent page that sign-up was successful
            onSignUpSuccess();
            // 2. Go to the next step within the modal instead of redirecting
            setModalState('upload');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (e.target.files[0].size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size should not exceed 5MB for the trial.');
                return;
            }
            setSelectedFile(e.target.files[0]);
            setError('');
        }
    };

    const handlePrepareEvaluation = async () => {
        if (!selectedFile) {
            setError('Please select a file to upload.');
            return;
        }
        setIsLoading(true);
        setError('');
        setModalState('loadingOcr');

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('subject', 'Essay');

        try {
            const response = await fetch('/api/prepare-evaluation', {
                method: 'POST',
                body: formData,
            });
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
                body: JSON.stringify({
                    preparedData: updatedPreparedData,
                    subject: 'Essay',
                }),
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
    
    // Helper component for loading states
    const renderGlimpse = (title: string, subtitle: string) => (
        <div className="text-center p-8">
            <h3 className="text-xl font-bold mb-4">{title}</h3>
            <div className="bg-gray-200 h-48 w-full rounded-lg mb-4 flex items-center justify-center"><p className="text-gray-500">Dashboard Glimpse Image</p></div>
            <p className="text-sm text-gray-600 italic"><strong>Did you know?</strong> {subtitle}</p>
            <div className="h-2 w-full bg-gray-200 rounded-full mt-6 overflow-hidden"><div className="h-full bg-accent-primary animate-pulse w-full"></div></div>
        </div>
    );

    const renderModalContent = () => {
        switch (modalState) {
            case 'signUp':
                return (
                    <form onSubmit={handleSignUp} className="text-center p-8">
                        <h2 className="text-2xl font-bold mb-4">Create Your Free Account</h2>
                        <p className="text-gray-600 mb-6">Sign up to get your free AI essay evaluation.</p>
                        <div className="space-y-4">
                            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/>
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-lg"/>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        <button type="submit" disabled={isLoading} className="w-full mt-6 bg-accent-primary text-white font-semibold py-3 rounded-lg btn disabled:bg-indigo-400">
                            {isLoading ? 'Signing Up...' : 'Sign Up & Continue'}
                        </button>
                    </form>
                );
            case 'upload':
                return (
                     <div className="p-8">
                        <h2 className="text-2xl font-bold mb-2">Upload Your Essay</h2>
                        <p className="text-gray-600 mb-6">Upload up to 3 pages (300 words limit for trial).</p>
                        <div className="my-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
                           <label htmlFor="trial-file-upload" className="px-6 py-2 text-sm font-semibold text-white bg-accent-secondary rounded-lg shadow-sm hover:bg-emerald-600 btn cursor-pointer">Choose File</label>
                           <input id="trial-file-upload" type="file" className="hidden" onChange={handleFileChange} accept="application/pdf,image/jpeg,image/png"/>
                           {selectedFile && <p className="text-sm text-gray-500 mt-4">{selectedFile.name}</p>}
                        </div>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <button onClick={handlePrepareEvaluation} disabled={!selectedFile || isLoading} className="w-full bg-accent-secondary text-white font-semibold py-3 rounded-lg btn disabled:bg-emerald-400">
                           {isLoading ? 'Uploading...' : 'Upload & Extract Text'}
                        </button>
                    </div>
                );
            case 'loadingOcr': return renderGlimpse("Extracting Your Handwriting...", "Top-scoring answers often use short, clear paragraphs.");
            case 'verifyText':
                 return (
                    <div className="p-8">
                        <h2 className="text-2xl font-bold mb-2">Verify Extracted Text</h2>
                        <p className="text-gray-600 mb-6">Our AI extracted the text from your document. Please review and make corrections before evaluation.</p>
                        <textarea className="w-full h-48 p-4 border rounded-lg bg-gray-50" value={editableText} onChange={(e) => setEditableText(e.target.value)} />
                        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                        <button onClick={handleConfirmEvaluation} disabled={isLoading} className="w-full mt-6 bg-accent-primary text-white font-semibold py-3 rounded-lg btn disabled:bg-indigo-400">
                           {isLoading ? 'Evaluating...' : 'Confirm & Evaluate'}
                        </button>
                    </div>
                );
            case 'loadingEvaluation': return renderGlimpse("AI is Analyzing Your Essay...", "Including relevant keywords from the question can boost your score.");
            case 'showResult':
                 return (
                     <div className="p-8">
                         <h2 className="text-2xl font-bold mb-4">Your Evaluation is Ready!</h2>
                         <div className="h-80 overflow-y-auto p-4 border rounded-lg bg-gray-50">
                             <h3 className="font-bold">Overall Score: {evaluationResult?.overallScore}/{evaluationResult?.totalMarks}</h3>
                             <p className="mt-4"><strong>General Assessment:</strong> {evaluationResult?.overallFeedback?.generalAssessment}</p>
                             <p className="mt-2"><strong>Strengths:</strong> {evaluationResult?.overallFeedback?.keyStrengths?.join(', ')}</p>
                             <p className="mt-2"><strong>Areas for Improvement:</strong> {evaluationResult?.overallFeedback?.areasForImprovement?.join(', ')}</p>
                         </div>
                         <button onClick={() => setModalState('getReview')} className="w-full mt-6 bg-accent-secondary text-white font-semibold py-3 rounded-lg btn">
                            Finish & Leave a Review
                         </button>
                     </div>
                 );
            case 'getReview':
                 return (
                    <div className="text-center p-8">
                         <h2 className="text-2xl font-bold mb-4">How was your experience?</h2>
                         <p className="text-gray-600 mb-6">Leave a review to receive a one-time discount coupon!</p>
                         <div className="flex justify-center text-4xl mb-6">{[1,2,3,4,5].map(star => (<span key={star} className={`cursor-pointer ${userRating >= star ? 'text-yellow-400' : 'text-gray-300'}`} onClick={() => setUserRating(star)}>★</span>))}</div>
                         <textarea placeholder="Tell us more (optional)" className="w-full h-24 p-4 border rounded-lg bg-gray-50"/>
                         <button onClick={handleReviewSubmit} className="w-full mt-6 bg-accent-primary text-white font-semibold py-3 rounded-lg btn">
                            Submit Review & Get Coupon
                         </button>
                    </div>
                 );
            case 'showCoupon':
                 return (
                    <div className="text-center p-8">
                        <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
                        <p className="text-gray-600 mb-6">Here is your one-time coupon for 20% off your first subscription.</p>
                        <div className="p-4 border-2 border-dashed border-green-500 bg-green-50 rounded-lg"><p className="text-3xl font-bold text-green-700 tracking-widest">{`SCORE${evaluationResult?.overallScore}`}</p></div>
                         <button onClick={onClose} className="w-full mt-6 bg-gray-700 text-white font-semibold py-3 rounded-lg btn">
                            Close
                         </button>
                    </div>
                 );
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                {renderModalContent()}
            </div>
        </div>
    );
}