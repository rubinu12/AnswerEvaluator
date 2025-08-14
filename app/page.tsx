// app/page.tsx

'use client';

import { useState } from 'react';
import OcrModal from '../components/OcrModal'; // Assuming you have this component from your original code

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [finalText, setFinalText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    setError('');
    setFinalText('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Call our new all-in-one endpoint
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to evaluate the document.');
      }
      
      setFinalText(result.formattedText);

    } catch (err: any) {
      setError(err.message);
      // Close the modal on error so the user can see the error message on the main page
      setIsModalOpen(false); 
    } finally {
      setIsLoading(false);
    }
  };
  
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
          disabled={!file || isLoading}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Evaluating...' : 'Evaluate Document'}
        </button>
      </div>

      <OcrModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        text={finalText}
        isLoading={isLoading}
      />
    </main>
  );
}
