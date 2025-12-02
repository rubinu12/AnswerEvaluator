'use client';

import { useState, useRef } from 'react';
import { ChevronDown, FileUp, Sparkles, Info, CheckCircle2 } from 'lucide-react';
import { useEvaluationStore } from '@/lib/store';

const subjects = [
    { name: 'General Studies - I', color: 'bg-green-500', code: 'GS1' },
    { name: 'General Studies - II', color: 'bg-blue-500', code: 'GS2' },
    { name: 'General Studies - III', color: 'bg-orange-500', code: 'GS3' },
    { name: 'General Studies - IV', color: 'bg-red-500', code: 'GS4' },
    { name: 'Essay Paper', color: 'bg-purple-500', code: 'Essay' },
];

type Subject = typeof subjects[0];

export default function EvaluateCard() {
    const {
        setIsReviewing,
        setPreparedData,
        setProcessingState,
        setSelectedPaper, 
        failEvaluation,
    } = useEvaluationStore();

    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File | null) => {
        if (file) {
            setSelectedFile(file);
            setError('');
        }
    };

    const handlePrepareEvaluation = async () => {
        if (!selectedFile || !selectedSubject) {
            setError('Please select a file and a subject to evaluate.');
            return;
        }
        setError('');
        setProcessingState('ocr');
        setSelectedPaper(selectedSubject.code);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('subject', selectedSubject.code);

        try {
            const response = await fetch('/api/prepare-evaluation', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to prepare the document.');
            }
            setPreparedData(result);
            setIsReviewing(true);
        } catch (err: any) {
            setError(err.message);
            failEvaluation(err.message);
        } finally {
            setProcessingState('idle');
        }
    };

    const handleSelectSubject = (subject: Subject) => {
        setSelectedSubject(subject);
        setIsDropdownOpen(false);
        setError('');
    };
    
    const isButtonDisabled = !selectedFile || !selectedSubject;

    return (
        <div className="relative flex flex-col rounded-2xl bg-white p-4 xs:p-6 md:p-8 shadow-lg border border-gray-200/60 transition-transform duration-300 hover:scale-[1.01]">
            <Sparkles className="absolute -top-3 -left-3 h-8 w-8 text-yellow-400" fill="currentColor"/>
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg xs:text-xl font-semibold text-gray-800">Evaluate New Answer</h2>
                    <p className="text-sm text-gray-500">Upload your handwritten answer for AI evaluation</p>
                </div>
                <div className="relative w-full sm:w-52">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center justify-between w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        {selectedSubject ? (
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${selectedSubject.color}`}></span>
                                <span className="font-semibold text-gray-800">{selectedSubject.name}</span>
                            </div>
                        ) : (<span className="text-gray-500">Select Subject</span>)}
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                            <div className="py-1">
                                {subjects.map((subject) => (
                                    <a
                                        key={subject.name}
                                        href="#"
                                        onClick={(e) => { e.preventDefault(); handleSelectSubject(subject); }}
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-slate-100"
                                    >
                                        <span className={`h-2 w-2 rounded-full ${subject.color}`}></span>
                                        {subject.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dropzone */}
            <div 
                className="my-6 flex-grow flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-6 xs:p-8 text-center cursor-pointer hover:border-emerald-400 transition-colors group"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="rounded-full bg-emerald-100 p-3 group-hover:scale-110 transition-transform duration-200">
                    <FileUp className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="mt-4 font-semibold text-gray-700 break-all text-sm xs:text-base">
                    {selectedFile ? selectedFile.name : 'Upload Answer Sheet (PDF/IMG)'}
                </p>
                <p className="mt-1 text-xs xs:text-sm text-gray-500">Drag and drop or click to browse</p>
                
                <input 
                    ref={fileInputRef}
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} 
                    accept="application/pdf,image/jpeg,image/png"
                />
            </div>

            {/* [NEW] Scanning Protocol Guide */}
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2 mb-3">
                    <Info size={14} /> For Best Results (Multiple Answers)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700 leading-tight">
                            <strong>Separate Answers:</strong> Draw a line <code className="bg-white border border-blue-200 px-1 py-0.5 rounded text-[10px] font-mono">---X---X---</code> between questions.
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700 leading-tight">
                            <strong>Mention Marks:</strong> Write <code className="bg-white border border-blue-200 px-1 py-0.5 rounded text-[10px] font-mono">(10 Marks)</code> at the end of the question text.
                        </p>
                    </div>
                </div>
            </div>

            {error && (<p className="text-sm text-red-500 mb-4 text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>)}
            
            <button
                onClick={handlePrepareEvaluation}
                className={`w-full rounded-lg py-3 text-sm xs:text-base font-bold text-white transition-all shadow-md active:scale-[0.98] ${
                    isButtonDisabled 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                    : 'bg-slate-900 hover:bg-slate-800 hover:shadow-lg'
                }`}
                disabled={isButtonDisabled}
            >
                {selectedSubject ? `Analyze ${selectedSubject.code}` : 'Select a Subject to Start'}
            </button>
        </div>
    )
}