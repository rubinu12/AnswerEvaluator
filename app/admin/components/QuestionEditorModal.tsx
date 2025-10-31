"use client";

import React, { useState, FC, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Question, Option } from '@/lib/quizTypes';

// Form state now more closely matches the final Question object
interface QuestionFormData {
    questionText: string;
    options: { text: string }[]; // Simplified for the form
    correctOptionIndex: number | string;
    subject: string;
    topic: string;
    year: number | string;
    type: 'prelims' | 'mains' | 'csat';
}

const initialFormData: QuestionFormData = {
    questionText: '',
    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
    correctOptionIndex: '',
    subject: 'History', // Default value
    topic: '',
    year: new Date().getFullYear(), // Default to current year
    type: 'prelims', // Default value
};

interface QuestionEditorModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState<QuestionFormData>(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formData.options];
        newOptions[index].text = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!formData.questionText || !formData.year || !formData.subject || formData.correctOptionIndex === '') {
            setError('Please fill all required fields: Question Text, Year, Subject, and Correct Option.');
            return;
        }
        if (formData.options.some(opt => !opt.text)) {
            setError('All four option fields must be filled.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Transform form data into the final Question structure
            const newQuestion: Omit<Question, 'id'> = {
                questionText: formData.questionText,
                options: formData.options.map((opt, index) => ({
                    text: opt.text,
                    isCorrect: index === Number(formData.correctOptionIndex),
                })),
                subject: formData.subject,
                topic: formData.topic, // This can be an empty string
                year: Number(formData.year),
                type: formData.type,
            };

            // Add the new document to the 'questions' collection in Firestore
            await addDoc(collection(db, 'questions'), newQuestion);

            alert('Question added successfully!');
            onSuccess(); // Refresh the list
            onClose();   // Close the modal

        } catch (err: any) {
            setError('Failed to save question. Please check the console for details.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <form
                onSubmit={handleSubmit}
                className="modal-panel bg-white w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 border-b border-gray-200 flex-shrink-0 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Add New Question</h2>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
                    <TextareaField label="Question Text" name="questionText" value={formData.questionText} onChange={handleInputChange} required rows={4} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Option A" value={formData.options[0].text} onChange={(e) => handleOptionChange(0, e.target.value)} required />
                        <InputField label="Option B" value={formData.options[1].text} onChange={(e) => handleOptionChange(1, e.target.value)} required />
                        <InputField label="Option C" value={formData.options[2].text} onChange={(e) => handleOptionChange(2, e.target.value)} required />
                        <InputField label="Option D" value={formData.options[3].text} onChange={(e) => handleOptionChange(3, e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SelectField label="Correct Option" name="correctOptionIndex" value={String(formData.correctOptionIndex)} onChange={handleInputChange} required>
                            <option value="">Select Correct</option>
                            <option value="0">A</option>
                            <option value="1">B</option>
                            <option value="2">C</option>
                            <option value="3">D</option>
                        </SelectField>
                        <InputField label="Year" name="year" type="number" value={String(formData.year)} onChange={handleInputChange} required />
                         <SelectField label="Type" name="type" value={formData.type} onChange={handleInputChange} required>
                            <option value="prelims">Prelims</option>
                            <option value="mains">Mains</option>
                            <option value="csat">CSAT</option>
                        </SelectField>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Subject" name="subject" value={formData.subject} onChange={handleInputChange} required />
                        <InputField label="Topic" name="topic" value={formData.topic} onChange={handleInputChange} />
                    </div>

                    {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm font-medium">{error}</div>}
                </main>

                <footer className="p-6 border-t border-gray-200 flex-shrink-0 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="btn bg-white text-gray-700 font-semibold px-6 py-2 rounded-lg border border-gray-300">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="btn bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-400">
                        {isSubmitting ? 'Saving...' : 'Save Question'}
                    </button>
                </footer>
            </form>
        </div>
    );
};


// Reusable Form Field Components (no changes needed here)
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const InputField: FC<InputFieldProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}{props.required && <span className="text-red-500">*</span>}</label>
        <input {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
    </div>
);
interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}
const TextareaField: FC<TextareaFieldProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}{props.required && <span className="text-red-500">*</span>}</label>
        <textarea {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 custom-scrollbar" />
    </div>
);
interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    children: React.ReactNode;
}
const SelectField: FC<SelectFieldProps> = ({ label, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}{props.required && <span className="text-red-500">*</span>}</label>
        <select {...props} className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white">
            {children}
        </select>
    </div>
);

export default QuestionEditorModal;