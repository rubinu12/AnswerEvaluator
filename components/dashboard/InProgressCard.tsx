// app/components/dashboard/InProgressCard.tsx
'use client';

export default function InProgressCard() {
    return (
        <div className="card p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">Evaluation in Progress...</h3>
            <p className="text-sm text-slate-500 mb-6">This usually takes a few minutes. While you wait, here's a tip to improve your answer writing:</p>
            
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <h4 className="font-bold text-amber-900">Focus on Structure</h4>
                <p className="text-slate-600 mt-2 text-sm">
                    "A well-structured answer is half the battle won. Always spend the first 2-3 minutes creating a mental blueprint: Introduction, Body with 3-4 distinct points, and a forward-looking Conclusion. This ensures your answer is coherent and easy for the examiner to follow."
                </p>
                <p className="text-right text-xs text-slate-500 mt-3">- Insights from Topper Analysis</p>
            </div>
        </div>
    );
}