"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, FileUp, Sparkles } from 'lucide-react';

// --- PROPS INTERFACE ---
interface PreparedQuestion {
    questionNumber: number;
    questionText: string;
    userAnswer: string;
    maxMarks: number;
}
interface EvaluateCardProps {
    onEvaluationStart: () => void;
    onEvaluationComplete: (result: { analysis: any; preparedData: PreparedQuestion[], subject: string }) => void;
    onEvaluationError: (error: string) => void;
}

// --- UI DATA ---
const subjects = [
    { name: "General Studies - I", color: "bg-green-500", code: "GS1" },
    { name: "General Studies - II", color: "bg-blue-500", code: "GS2" },
    { name: "General Studies - III", color: "bg-orange-500", code: "GS3" },
    { name: "General Studies - IV", color: "bg-red-500", code: "GS4" },
    { name: "Essay Paper", color: "bg-purple-500", code: "Essay" },
];

export default function EvaluateCard({ onEvaluationStart, onEvaluationComplete, onEvaluationError }: EvaluateCardProps) {
    // --- STATE AND LOGIC (UNCHANGED) ---
    const [selectedSubject, setSelectedSubject] = useState<{ name: string; color: string; code: string } | null>(subjects[0]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [preparedData, setPreparedData] = useState<PreparedQuestion[]>([]);
    const [loadingMessage, setLoadingMessage] = useState('Processing...');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [openQuestions, setOpenQuestions] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (isConfirming && preparedData.length > 0) {
            setOpenQuestions({ [preparedData[0].questionNumber]: true });
        }
    }, [isConfirming, preparedData]);


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
        if (!selectedSubject) {
            setError('Please select a subject first.');
            return;
        }
        setIsLoading(true);
        setError('');
        setLoadingMessage('Extracting text (OCR)...');
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('subject', selectedSubject.code);

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
        if (!selectedSubject) return;
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
                    subject: selectedSubject.code,
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to get final evaluation.');
            
            onEvaluationComplete({
                analysis: result,
                preparedData: preparedData,
                subject: selectedSubject.code
            });

        } catch (err: any) {
            setError(err.message);
            onEvaluationError(err.message);
        } finally {
            setIsLoading(false);
            setIsConfirming(false);
        }
    };
    
    const handleSelectSubject = (subject: { name: string; color: string; code: string }) => {
        setSelectedSubject(subject);
        setIsDropdownOpen(false);
    }
    
    const handleDataChange = (qNumber: number, field: keyof PreparedQuestion, value: string | number) => {
        setPreparedData(currentData =>
            currentData.map(q => {
                if (q.questionNumber === qNumber) {
                    const updatedValue = field === 'maxMarks' ? Number(value) : value;
                    return { ...q, [field]: updatedValue };
                }
                return q;
            })
        );
    };

    const toggleQuestionOpen = (qNumber: number) => {
        setOpenQuestions(prev => ({
            ...prev,
            [qNumber]: !prev[qNumber]
        }));
    };

    // --- UPDATED CONFIRMATION MODAL ---
    if (isConfirming) {
        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center font-sans p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all duration-300 ease-in-out">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">Review & Edit Evaluation</h2>
                      <p className="text-md text-gray-500 mt-1">
                        Click on a question to expand and edit its content.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsConfirming(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2 -mt-2 -mr-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
        
                  <div className="max-h-[60vh] overflow-y-auto space-y-3 bg-white pr-2">
                    {preparedData.map(q => (
                      <div key={q.questionNumber} className="border border-gray-200 rounded-lg transition-all duration-300">
                        <div 
                          className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50"
                          onClick={() => toggleQuestionOpen(q.questionNumber)}
                        >
                          <h4 className="font-semibold text-slate-800">
                            {selectedSubject?.code === 'Essay' ? 'Essay Prompt' : `Question ${q.questionNumber}`}
                          </h4>
                          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${openQuestions[q.questionNumber] ? 'rotate-180' : ''}`} />
                        </div>
                        {openQuestions[q.questionNumber] && (
                          <div className="px-4 pb-4 space-y-4">
                            <div>
                               <label className="block text-sm font-medium text-gray-600 mb-1">Question Text</label>
                               <textarea
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-shadow text-gray-700 leading-relaxed"
                                value={q.questionText}
                                onChange={(e) => handleDataChange(q.questionNumber, 'questionText', e.target.value)}
                                rows={3}
                               />
                            </div>
                            <div>
                               <label className="block text-sm font-medium text-gray-600 mb-1">Max Marks</label>
                               <input
                                type="number"
                                className="w-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-shadow text-gray-700"
                                value={q.maxMarks}
                                onChange={(e) => handleDataChange(q.questionNumber, 'maxMarks', e.target.value)}
                               />
                            </div>
                             <div>
                               <label className="block text-sm font-medium text-gray-600 mb-1">User's Answer</label>
                               <textarea
                                // --- THIS IS THE ONLY CHANGE ---
                                className="w-full h-64 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition-shadow text-gray-700 leading-relaxed"
                                value={q.userAnswer}
                                onChange={(e) => handleDataChange(q.questionNumber, 'userAnswer', e.target.value)}
                               />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
        
                <div className="bg-gray-50 px-8 py-5 rounded-b-2xl flex justify-end items-center space-x-4">
                  <button
                    onClick={() => setIsConfirming(false)}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all focus:outline-none"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmEvaluation}
                    className="px-8 py-3 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg focus:outline-none btn"
                    disabled={isLoading}
                  >
                    {isLoading ? loadingMessage : 'Confirm & Start Evaluation'}
                  </button>
                </div>
              </div>
            </div>
          );
    }

    // --- YOUR ORIGINAL CARD DESIGN (UNCHANGED) ---
    return (
        <div className="relative flex flex-col rounded-2xl bg-white p-8 shadow-lg border border-gray-200/60 transition-transform duration-300 hover:scale-[1.02]">
            {/* ... rest of your unchanged JSX for the main card ... */}
            <Sparkles className="absolute -top-3 -left-3 h-8 w-8 text-yellow-400" fill="currentColor" />
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Evaluate New Answer</h2>
                    <p className="text-sm text-gray-500">Upload your handwritten answer for AI evaluation</p>
                </div>
                <div className="relative">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center justify-between w-52 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                        {selectedSubject ? (
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${selectedSubject.color}`}></span>
                                <span className="font-semibold text-gray-800">{selectedSubject.name}</span>
                            </div>
                        ) : 'Select Subject'}
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                                {subjects.map(subject => (
                                    <a key={subject.name} href="#" onClick={(e) => { e.preventDefault(); handleSelectSubject(subject); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-slate-100">
                                        <span className={`h-2 w-2 rounded-full ${subject.color}`}></span>
                                        {subject.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="my-8 flex-grow flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
                <div className="rounded-full bg-green-100 p-4">
                    <FileUp className="h-10 w-10 text-green-600" />
                </div>
                <p className="mt-4 font-semibold text-gray-700">{selectedFile ? selectedFile.name : 'Upload Answer Sheet'}</p>
                <p className="mt-1 text-sm text-gray-500">Drag and drop or click to browse</p>
                <label htmlFor="file-upload" className="mt-6 px-6 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg shadow-sm hover:bg-emerald-600 btn cursor-pointer">
                    Choose File
                </label>
                <input id="file-upload" type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} accept="application/pdf,image/jpeg,image/png" />
            </div>
            {error && <p className="text-sm text-red-500 mb-4 text-center">{error}</p>}
            <button onClick={handlePrepareEvaluation} className={`w-full rounded-lg py-3 text-md font-semibold text-white transition-all btn ${!selectedFile || isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`} disabled={!selectedFile || isLoading}>
                {isLoading ? loadingMessage : `Evaluate for ${selectedSubject?.code}`}
            </button>
        </div>
    );
}