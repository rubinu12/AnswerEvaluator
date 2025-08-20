// app/components/dashboard/EvaluateCard.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface PreparedQuestion {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
}

// The onEvaluationComplete prop now expects an object with both data pieces
interface EvaluateCardProps {
    onEvaluationStart: () => void;
    onEvaluationComplete: (result: { analysis: any; preparedData: PreparedQuestion[], subject: string }) => void;
    onEvaluationError: (error: string) => void;
}

export default function EvaluateCard({ onEvaluationStart, onEvaluationComplete, onEvaluationError }: EvaluateCardProps) {
    const [selectedSubject, setSelectedSubject] = useState('GS1');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [preparedData, setPreparedData] = useState<PreparedQuestion[]>([]);
    const [loadingMessage, setLoadingMessage] = useState('Processing...');

    // --- LOGIC FOR SUBJECT SELECTOR ---
    const [sliderStyle, setSliderStyle] = useState({});
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const subjects = ['GS1', 'GS2', 'GS3', 'GS4', 'Essay'];

    useEffect(() => {
        const activeTabIndex = subjects.indexOf(selectedSubject);
        const activeTab = tabsRef.current[activeTabIndex];
        if (activeTab) {
            setSliderStyle({
                width: `${activeTab.offsetWidth}px`,
                transform: `translateX(${activeTab.offsetLeft}px)`,
            });
        }
    }, [selectedSubject]);
    // --- END OF LOGIC ---

    const handleFileChange = (file: File | null) => {
        if (file) {
            setSelectedFile(file);
            setError('');
            setIsConfirming(false);
        }
    };

    const handlePrepareEvaluation = async () => {
        if (!selectedFile) {
            setError('Please choose a file to evaluate.');
            return;
        }
        setIsLoading(true);
        setError('');
        setLoadingMessage('Extracting text (OCR)...');
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            const response = await fetch('/api/prepare-evaluation', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to prepare the document.');
            setPreparedData(result);
            setIsConfirming(true);
        } catch (err: any) {
            setError(err.message);
            onEvaluationError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmEvaluation = async () => {
        setIsLoading(true);
        setError('');
        setLoadingMessage('Generating detailed feedback...');
        onEvaluationStart();

        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    preparedData: preparedData,
                    subject: selectedSubject,
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to get final evaluation.');
            
            // Pass both the analysis AND the preparedData to the dashboard
            onEvaluationComplete({
                analysis: result,
                preparedData: preparedData,
                subject: selectedSubject // Pass the subject for contextual handling
            });

        } catch (err: any) {
            setError(err.message);
            onEvaluationError(err.message);
        } finally {
            setIsLoading(false);
            setIsConfirming(false);
        }
    };

    if (isConfirming) {
        return (
            <div className="card p-6">
                <h3 className="text-xl font-bold text-slate-900 font-serif">Confirm Extracted Content</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">Please verify that the questions and answers have been extracted correctly before proceeding.</p>
                <div className="max-h-96 overflow-y-auto space-y-4 bg-slate-50 p-4 rounded-md border">
                    {preparedData.map(q => (
                        <div key={q.questionNumber}>
                            <p className="font-semibold text-slate-700">Q{q.questionNumber} ({q.maxMarks} Marks): <span className="font-normal">{q.questionText}</span></p>
                            <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap border-l-2 pl-2 border-slate-300"><em>{q.userAnswer}</em></p>
                        </div>
                    ))}
                </div>
                {error && <p className="text-sm text-red-500 my-4 text-center">{error}</p>}
                <div className="flex space-x-2 mt-4">
                    <button onClick={() => setIsConfirming(false)} className="w-full rounded-lg px-6 py-3 text-md font-semibold bg-slate-200 hover:bg-slate-300 transition-all">Back</button>
                    <button onClick={handleConfirmEvaluation} className="w-full rounded-lg px-6 py-3 text-md font-semibold transition-all btn-evaluate" disabled={isLoading}>
                        {isLoading ? loadingMessage : 'Confirm & Start Evaluation'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="card p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 font-serif">Evaluate a New Answer</h3>
                    <p className="text-sm text-slate-500 mt-1">You have <span className="font-bold text-green-600">12</span> credits remaining.</p>
                </div>
                {/* --- SUBJECT SELECTOR UI --- */}
                <div className="subject-selector-container">
                    <div className="subject-selector-slider" style={sliderStyle}></div>
                    {subjects.map((subject, index) => (
                        <button
                            key={subject}
                            ref={(el) => { tabsRef.current[index] = el; }}
                            className={`subject-btn ${selectedSubject === subject ? 'text-slate-900' : ''}`}
                            onClick={() => setSelectedSubject(subject)}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
                {/* --- END OF SUBJECT SELECTOR UI --- */}
            </div>
            <div className="mb-4">
                <p className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Upload Answer Sheet</p>
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full min-h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        {selectedFile ? (<p className="text-sm text-green-700 font-semibold">{selectedFile.name}</p>) : (<>
                                <svg className="w-8 h-8 mb-2 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                                <p className="text-sm text-slate-500"><span className="font-semibold text-red-800">Click to upload</span> or drag & drop</p>
                            </>)}
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} accept="application/pdf,image/jpeg,image/png" />
                </label>
            </div>
            {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}
            <button onClick={handlePrepareEvaluation} className="w-full rounded-lg px-6 py-3 text-md font-semibold transition-all btn-evaluate" disabled={!selectedFile || isLoading}>
                {isLoading ? loadingMessage : `Prepare for ${selectedSubject}`}
            </button>
        </div>
    );
}