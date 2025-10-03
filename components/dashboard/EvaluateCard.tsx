'use client';

import { useState, useRef } from 'react'; // 1. Import useRef
import { ChevronDown, FileUp, Sparkles } from 'lucide-react';
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
    
    // 2. Create a ref for the file input element
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
        <div className="relative flex flex-col rounded-2xl bg-white p-8 shadow-lg border border-gray-200/60 transition-transform duration-300 hover:scale-[1.02]">
            <Sparkles className="absolute -top-3 -left-3 h-8 w-8 text-yellow-400" fill="currentColor"/>
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Evaluate New Answer</h2>
                    <p className="text-sm text-gray-500">Upload your handwritten answer for AI evaluation</p>
                </div>
                <div className="relative w-full sm:w-52">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center justify-between w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
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
                        <div className="absolute right-0 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
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

            {/* 3. The entire dropzone is now clickable */}
            <div 
                className="my-8 flex-grow flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-8 text-center cursor-pointer hover:border-emerald-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="rounded-full bg-green-100 p-4">
                    <FileUp className="h-10 w-10 text-green-600" />
                </div>
                <p className="mt-4 font-semibold text-gray-700 break-all">{selectedFile ? selectedFile.name : 'Upload Answer Sheet'}</p>
                <p className="mt-1 text-sm text-gray-500">Drag and drop or click to browse</p>
                
                {/* 4. The hidden input is now linked via the ref */}
                <input 
                    ref={fileInputRef}
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} 
                    accept="application/pdf,image/jpeg,image/png"
                />
            </div>
            {error && (<p className="text-sm text-red-500 mb-4 text-center">{error}</p>)}
            <button
                onClick={handlePrepareEvaluation}
                className={`w-full rounded-lg py-3 text-md font-semibold text-white transition-all btn ${isButtonDisabled ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                disabled={isButtonDisabled}
            >
                {selectedSubject ? `Prepare for ${selectedSubject.code}` : 'Select a Subject'}
            </button>
        </div>
    )
}