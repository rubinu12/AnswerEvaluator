"use client";

import React, { useState } from 'react';

// The interface for the component's props
interface BulkPreviewModalProps {
    questions: any[];
    onClose: () => void;
    onSuccess: () => void; // THIS LINE IS THE FIX
}

const BulkPreviewModal: React.FC<BulkPreviewModalProps> = ({ questions, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(questions),
            });
            
            const result = await response.json();

            if (!response.ok) {
                // If the server responds with an error, show it in an alert.
                throw new Error(result.error || 'An unknown server error occurred.');
            }

            alert(`Successfully added ${questions.length} questions!`);
            onSuccess(); // Call the original onSuccess to refresh the question list
            onClose();   // Close the modal
        } catch (error: any) {
            // Show any error (network error, server error) in a popup.
            alert(`Submission Failed:\n${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-panel bg-gray-50 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 border-b border-gray-200 bg-white flex-shrink-0 flex justify-between items-center sticky top-0">
                    <h2 className="text-xl font-semibold text-gray-800">Parsed Questions Preview ({questions.length})</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </header>

                <main className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
                    {questions.map((q, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">
                                Question #{q.paperQuestionNumber || (index + 1)}
                            </h3>
                            <p className="text-gray-700 whitespace-pre-wrap mb-3">{q.questionText}</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <p><strong className="font-medium text-gray-600">Option A:</strong> {q.optionA}</p>
                                <p><strong className="font-medium text-gray-600">Option B:</strong> {q.optionB}</p>
                                <p><strong className="font-medium text-gray-600">Option C:</strong> {q.optionC}</p>
                                <p><strong className="font-medium text-gray-600">Option D:</strong> {q.optionD}</p>
                                <p><strong className="font-medium text-gray-600">Correct:</strong> <span className="font-bold text-green-600">{q.correctOption}</span></p>
                                <p><strong className="font-medium text-gray-600">Subject:</strong> {q.subject}</p>
                                <p><strong className="font-medium text-gray-600">Topic:</strong> {q.topic}</p>
                                <p><strong className="font-medium text-gray-600">Year:</strong> {q.year}</p>
                            </div>
                        </div>
                    ))}
                </main>
                
                <footer className="p-6 border-t border-gray-200 bg-white flex-shrink-0 flex justify-end gap-4">
                    <button type="button" onClick={onClose} className="btn bg-white text-gray-700 font-semibold px-6 py-2 rounded-lg border">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="btn bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400">
                        {isSubmitting ? 'Submitting...' : `Confirm & Add to Database`}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default BulkPreviewModal;