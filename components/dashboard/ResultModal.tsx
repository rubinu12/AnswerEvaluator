// app/components/dashboard/ResultModal.tsx
'use client';

interface ResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    resultText: string;
}

export default function ResultModal({ isOpen, onClose, resultText }: ResultModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold font-serif text-slate-800">Evaluation Result</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-2xl">&times;</button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto pr-4 border border-slate-200 rounded-md p-4 bg-slate-50">
                    <pre className="whitespace-pre-wrap text-slate-700 font-sans">{resultText}</pre>
                </div>
            </div>
        </div>
    );
}