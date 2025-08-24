'use client';

// This is a placeholder for now. In the future, this component
// would have its own logic to handle the file upload and evaluation process.
export default function TrialEvaluator() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start max-w-4xl mx-auto">
            {/* Left Side: Evaluator */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/60">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">Evaluate New Answer</h3>
                        <p className="text-sm text-gray-500">Upload your handwritten answer for AI evaluation</p>
                    </div>
                    <div className="text-sm font-medium text-gray-700 p-2 bg-gray-100 rounded-md">
                        General Studies - I
                    </div>
                </div>
                
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <h4 className="mt-4 font-semibold text-gray-700">Upload Answer Sheet</h4>
                    <p className="mt-1 text-xs text-gray-500">Drag and drop or click to browse</p>
                    <button className="mt-4 text-sm font-medium bg-white border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50">
                        Choose File
                    </button>
                </div>

                <button className="w-full mt-6 bg-gray-200 text-gray-500 font-semibold py-3 rounded-lg cursor-not-allowed">
                    Evaluate for GS1
                </button>
            </div>

            {/* Right Side: How it Works */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200/60">
                <h3 className="text-lg font-semibold mb-4">How It Works</h3>
                <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">1</div>
                        <div>
                            <p className="font-semibold">Upload Your Answer</p>
                            <p className="text-sm text-gray-500">Choose a clear PDF or image file of your handwritten essay.</p>
                        </div>
                    </li>
                    <li className="flex items-start space-x-3">
                         <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">2</div>
                        <div>
                            <p className="font-semibold">AI Analysis Begins</p>
                            <p className="text-sm text-gray-500">Our engine reads your handwriting and analyzes the content.</p>
                        </div>
                    </li>
                    <li className="flex items-start space-x-3">
                         <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600">3</div>
                        <div>
                            <p className="font-semibold">Get Your Report</p>
                            <p className="text-sm text-gray-500">Receive an instant, detailed report with actionable feedback.</p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
}