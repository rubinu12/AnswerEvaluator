"use client";

import React, { useState, useEffect, useCallback } from 'react';

// A simple, typed debounce function
const debounce = <F extends (...args: any[]) => any>(func: F, delay: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<F>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

// --- Helper Data ---
const SUBJECTS = ["Polity", "Geo (Ind)", "Geo (World)", "Economics", "A. History", "Med. History", "M. History", "A & C", "Agriculture", "Env. & Eco.", "Sci. & Tech", "Misc."];
const YEARS = Array.from({ length: new Date().getFullYear() - 1990 + 1 }, (_, i) => new Date().getFullYear() - i);
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const OPTIONS = ["A", "B", "C", "D"];

// --- Component Types ---
interface Question { _id: string; paperQuestionNumber?: number; questionText: string; subject?: string; topic?: string; year?: number; optionA?: string; optionB?: string; optionC?: string; optionD?: string; correctOption?: string; explanationText?: string; explanationPDF?: string; difficulty?: string; }
interface QuestionDetailProps { questions: Question[]; selectedQuestionId: string | null; fetchQuestions: () => void; setSelectedQuestionId: (id: string | null) => void; showNotifications: boolean; setShowNotifications: (show: boolean) => void; }
interface FormInputProps { label: string; name: string; value?: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; }
interface FormTextareaProps { label: string; name: string; value?: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number; }
interface FormSelectProps { label: string; name: string; value?: string | number; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; }

// --- Reusable Form Field Components ---
const FormInput = ({ label, name, value, onChange, placeholder = '' }: FormInputProps) => (<div><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><input type="text" name={name} value={value || ''} onChange={onChange} placeholder={placeholder} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" /></div>);
const FormTextarea = ({ label, name, value, onChange, rows = 3 }: FormTextareaProps) => (<div><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><textarea name={name} value={value || ''} onChange={onChange} rows={rows} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" /></div>);
const FormSelect = ({ label, name, value, onChange, children }: FormSelectProps) => (<div><label className="block text-sm font-medium text-gray-600 mb-1">{label}</label><select name={name} value={value || ''} onChange={onChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">{children}</select></div>);

// --- Main QuestionDetail Component ---
const QuestionDetail = ({ questions, selectedQuestionId, fetchQuestions, setSelectedQuestionId, showNotifications, setShowNotifications }: QuestionDetailProps) => {
    const [formData, setFormData] = useState<Question | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (selectedQuestionId) {
            const currentQuestion = questions.find(q => q._id === selectedQuestionId);
            setFormData(currentQuestion || null);
        } else {
            setFormData(null);
        }
    }, [selectedQuestionId, questions]);

    // FIX: Added 'fetchQuestions' to the dependency array.
    const debouncedSave = useCallback(debounce(async (updatedData: Question) => {
        try {
            await fetch(`/api/questions/${updatedData._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) });
            fetchQuestions(); 
        } catch (error) { console.error("Failed to save question", error); } 
        finally { setIsSaving(false); }
    }, 1000), [fetchQuestions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (formData) {
            setIsSaving(true);
            const { name, value } = e.target;
            const updatedData = { ...formData, [name]: value };
            setFormData(updatedData);
            debouncedSave(updatedData);
        }
    };
    
    const getMissingFields = (question: Question): string[] => {
        const missing = [];
        if (!question.subject) missing.push("Subject");
        if (!question.topic) missing.push("Topic");
        if (!question.correctOption) missing.push("Correct Option");
        return missing;
    };

    if (showNotifications || !selectedQuestionId) {
        const questionsWithMissingInfo = questions.map(q => ({ ...q, missingFields: getMissingFields(q) })).filter(q => q.missingFields.length > 0);
        return (
            <div className="h-full flex flex-col bg-gray-50">
                <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Action Required ({questionsWithMissingInfo.length})</h2>
                        <p className="text-sm text-gray-500">The following questions are missing important data.</p>
                    </div>
                    {selectedQuestionId && (<button onClick={() => setShowNotifications(false)} className="text-gray-500 hover:text-gray-800"><i className="ri-close-line text-2xl"></i></button>)}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {questionsWithMissingInfo.length === 0 ? (
                        <div className="text-center py-10"><i className="ri-check-double-line text-5xl text-green-400"></i><h3 className="mt-2 text-lg font-medium text-gray-700">All Clear!</h3><p className="mt-1 text-sm text-gray-500">No issues found in the question bank.</p></div>
                    ) : (
                        <ul className="space-y-3">{questionsWithMissingInfo.map(q => (<li key={q._id}><button onClick={() => { setSelectedQuestionId(q._id); setShowNotifications(false); }} className="w-full text-left p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 hover:border-yellow-300 transition-colors"><p className="font-semibold text-gray-800">Q{q.paperQuestionNumber || 'N/A'} ({q.year})</p><p className="text-sm text-yellow-800 mt-1"><span className="font-medium">Missing:</span> {q.missingFields.join(', ')}</p></button></li>))}</ul>
                    )}
                </div>
            </div>
        );
    }

    if (!formData) return <div className="h-full flex items-center justify-center bg-gray-50"><p>Question not found.</p></div>;

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Editing Question {formData.paperQuestionNumber || ''} ({formData.year})</h2>
                <div className={`text-sm transition-opacity duration-300 ${isSaving ? 'opacity-100' : 'opacity-0'}`}><span className="text-gray-500">Saving...</span></div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <FormTextarea label="Question Text" name="questionText" value={formData.questionText} onChange={handleInputChange} rows={5} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormInput label="Option A" name="optionA" value={formData.optionA} onChange={handleInputChange} /><FormInput label="Option B" name="optionB" value={formData.optionB} onChange={handleInputChange} /><FormInput label="Option C" name="optionC" value={formData.optionC} onChange={handleInputChange} /><FormInput label="Option D" name="optionD" value={formData.optionD} onChange={handleInputChange} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><FormSelect label="Correct Option" name="correctOption" value={formData.correctOption} onChange={handleInputChange}><option value="" disabled>Select Correct Option</option>{OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</FormSelect><FormInput label="Topic" name="topic" value={formData.topic} onChange={handleInputChange} placeholder="e.g., Fundamental Rights" /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><FormSelect label="Subject" name="subject" value={formData.subject} onChange={handleInputChange}><option value="" disabled>Select Subject</option>{SUBJECTS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</FormSelect><FormSelect label="Difficulty" name="difficulty" value={formData.difficulty} onChange={handleInputChange}><option value="" disabled>Select Difficulty</option>{DIFFICULTIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}</FormSelect><FormSelect label="Year" name="year" value={formData.year} onChange={handleInputChange}><option value="" disabled>Select Year</option>{YEARS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</FormSelect></div>
                <FormTextarea label="Explanation" name="explanationText" value={formData.explanationText} onChange={handleInputChange} rows={4} /><FormInput label="PDF Link" name="explanationPDF" value={formData.explanationPDF} onChange={handleInputChange} />
            </div>
            <button onClick={() => setShowNotifications(true)} className="absolute bottom-6 right-6 bg-yellow-400 text-yellow-900 font-bold p-4 rounded-full shadow-lg hover:bg-yellow-500 transition-colors transform hover:scale-110" title="Show Action Required"><i className="ri-error-warning-fill text-2xl"></i></button>
        </div>
    );
};

export default QuestionDetail;