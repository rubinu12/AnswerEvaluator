// app/page.tsx

'use client';

import { useState } from 'react';
import OcrModal from '../components/OcrModal';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  
  // States for the two-step process
  const [ocrText, setOcrText] = useState('');
  const [finalText, setFinalText] = useState('');
  
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(''); 
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    // Reset states and open modal
    setIsModalOpen(true);
    setIsOcrLoading(true);
    setIsEvaluating(false);
    setError('');
    setOcrText('');
    setFinalText('');

    // --- Step 1: OCR Extraction ---
    const formData = new FormData();
    formData.append('file', file);

    try {
      const ocrResponse = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!ocrResponse.ok) {
        throw new Error('Failed to extract text from the document.');
      }

      const ocrData = await ocrResponse.json();
      setOcrText(ocrData.text);
      setIsOcrLoading(false); // OCR finished

      // --- Step 2: LLM Evaluation ---
      setIsEvaluating(true); // Start evaluation
      const evaluateResponse = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ocrText: ocrData.text }),
      });

      if (!evaluateResponse.ok) {
        throw new Error('The AI model failed to process the text.');
      }
      
      const evaluateData = await evaluateResponse.json();
      setFinalText(evaluateData.formattedText);

    } catch (err: any) {
      setError(err.message);
      setIsModalOpen(false); 
    } finally {
      setIsOcrLoading(false);
      setIsEvaluating(false);
    }
  };

  // Determine what text to show in the modal
  let modalText = '';
  if (isOcrLoading) {
    modalText = 'Step 1/2: Extracting text from document...';
  } else if (isEvaluating) {
    modalText = 'Step 2/2: Reformatting text with AI...';
  } else {
    modalText = finalText;
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">UPSC Answer Evaluator</h1>
        <p className="text-gray-600 mb-6">Upload your answer sheet (PDF or Image) to get AI-powered feedback.</p>
        
        <div className="mb-6">
          <input
            id="file-upload" type="file" onChange={handleFileChange} accept="image/*,.pdf"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {file && <p className="text-sm text-gray-500 mb-4">Selected: {file.name}</p>}
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        
        <button
          onClick={handleSubmit}
          disabled={!file || isOcrLoading || isEvaluating}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {(isOcrLoading || isEvaluating) ? 'Processing...' : 'Evaluate Document'}
        </button>
      </div>

      <OcrModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        text={modalText}
        isLoading={isOcrLoading || isEvaluating}
      />
    </main>
  );
}