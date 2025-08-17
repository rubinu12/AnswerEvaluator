// app/components/dashboard/EvaluateCard.tsx
'use client';

import { useState } from 'react';

// Define the props the EvaluateCard will accept to communicate with its parent
interface EvaluateCardProps {
    onEvaluationStart: () => void;
    onEvaluationComplete: (result: string) => void;
    onEvaluationError: (error: string) => void;
}

export default function EvaluateCard({ onEvaluationStart, onEvaluationComplete, onEvaluationError }: EvaluateCardProps) {
    const [selectedSubject, setSelectedSubject] = useState('GS1');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (file: File | null) => {
        if (file) {
            setSelectedFile(file);
            setError('');
        }
    };

    const handleEvaluate = async () => {
        if (!selectedFile) {
            setError('Please choose a file to evaluate.');
            return;
        }

        setIsLoading(true);
        setError('');
        onEvaluationStart(); // Notify the parent page that evaluation is starting

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to evaluate the document.');
            }
            
            // Send the successful result back to the parent page
            onEvaluationComplete(result.formattedText);

        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred.';
            setError(errorMessage);
            // Notify the parent page that an error occurred
            onEvaluationError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card p-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 font-serif">Evaluate a New Answer</h3>
                    <p className="text-sm text-slate-500 mt-1">You have <span className="font-bold text-green-600">12</span> credits remaining.</p>
                </div>
                <div className="relative group">
                    <button className="flex items-center space-x-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-md transition-colors">
                        <span>{selectedSubject}</span>
                        <svg className="w-4 h-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <div className="dropdown absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1">
                        {['GS1', 'GS2', 'GS3', 'GS4', 'Essay'].map(subject => (
                             <a href="#" key={subject} onClick={(e) => {e.preventDefault(); setSelectedSubject(subject)}} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">{subject}</a>
                        ))}
                    </div>
                </div>
            </div>
             
            <div className="mb-4">
                <p className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Upload Answer Sheet</p>
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full min-h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        {selectedFile ? (
                             <p className="text-sm text-green-700 font-semibold">{selectedFile.name}</p>
                        ) : (
                            <>
                                <svg className="w-8 h-8 mb-2 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                                <p className="text-sm text-slate-500"><span className="font-semibold text-red-800">Click to upload</span> or drag & drop</p>
                            </>
                        )}
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} accept="application/pdf,image/jpeg,image/png" />
                </label>
            </div>
            {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}
            <button onClick={handleEvaluate} className="w-full rounded-lg px-6 py-3 text-md font-semibold transition-all btn-evaluate" disabled={!selectedFile || isLoading}>
                {isLoading ? 'Processing...' : (selectedFile ? 'Start Evaluation' : 'Select a File to Evaluate')}
            </button>
        </div>
    );
}