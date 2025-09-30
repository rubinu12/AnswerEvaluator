// components/dashboard/EvaluateCard.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, FileUp, Sparkles } from 'lucide-react';
import { useEvaluationStore } from '@/lib/store';

const subjects = [
    { name: 'General Studies - I', color: 'bg-green-500', code: 'GS1' },
    { name: 'General Studies - II', color: 'bg-blue-500', code: 'GS2' },
    { name: 'General Studies - III', color: 'bg-orange-500', code: 'GS3' },
    { name: 'General Studies - IV', color: 'bg-red-500', code: 'GS4' },
    { name: 'Essay Paper', color: 'bg-purple-500', code: 'Essay' },
];

export default function EvaluateCard() {
    // This component now only needs these specific actions from the store
    const {
        setIsReviewing,
        setPreparedData,
        setProcessingState,
        setSelectedPaper, 
        failEvaluation,
    } = useEvaluationStore();

    // Local UI state for the upload form
    const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleFileChange = (file: File | null) => {
        if (file) {
            setSelectedFile(file);
            setError('');
        }
    };

    const handlePrepareEvaluation = async () => {
        if (!selectedFile) {
            setError('Please choose a file to evaluate.');
            return;
        }
        setError('');
        setProcessingState('ocr');
        setSelectedPaper(selectedSubject.code); // Set the selected paper in the global store

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
            setIsReviewing(true); // Switch to the ReviewCard
        } catch (err: any) {
            setError(err.message);
            failEvaluation(err.message);
        } finally {
            setProcessingState('idle');
        }
    };

    const handleSelectSubject = (subject: { name: string; color: string; code: string }) => {
        setSelectedSubject(subject);
        setIsDropdownOpen(false);
    };

    // The entire 'isReviewing' block and related logic has been removed.
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
                        ) : ('Select Subject')}
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

            <div className="my-8 flex-grow flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
                <div className="rounded-full bg-green-100 p-4">
                    <FileUp className="h-10 w-10 text-green-600" />
                </div>
                <p className="mt-4 font-semibold text-gray-700 break-all">{selectedFile ? selectedFile.name : 'Upload Answer Sheet'}</p>
                <p className="mt-1 text-sm text-gray-500">Drag and drop or click to browse</p>
                <label htmlFor="file-upload" className="mt-6 px-6 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg shadow-sm hover:bg-emerald-600 btn cursor-pointer">
                    Choose File
                </label>
                <input id="file-upload" type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} accept="application/pdf,image/jpeg,image/png"/>
            </div>
            {error && (<p className="text-sm text-red-500 mb-4 text-center">{error}</p>)}
            <button
                onClick={handlePrepareEvaluation}
                className={`w-full rounded-lg py-3 text-md font-semibold text-white transition-all btn ${!selectedFile ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                disabled={!selectedFile}
            >
                {`Prepare for ${selectedSubject?.code}`}
            </button>
        </div>
    )
}