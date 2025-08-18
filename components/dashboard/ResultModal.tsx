// app/components/dashboard/ResultModal.tsx
'use client';

interface ResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void; // Added the missing onConfirm prop
    resultText: string;
}

export default function ResultModal({ isOpen, onClose, onConfirm, resultText }: ResultModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg text-center">
                <div className="flex justify-end">
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-2xl">&times;</button>
                </div>
                <h2 className="text-2xl font-bold font-serif text-slate-800 mb-2">Evaluation Complete!</h2>
                <p className="text-slate-600 mb-6">{resultText}</p>

                <div className="flex justify-center space-x-4">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 text-sm font-semibold bg-slate-200 hover:bg-slate-300 rounded-md transition-colors"
                    >
                        Close
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-6 py-2 text-sm font-semibold text-white rounded-md transition-colors"
                        style={{ backgroundColor: 'var(--primary-accent)' }}
                    >
                        View Full Report
                    </button>
                </div>
            </div>
        </div>
    );
}