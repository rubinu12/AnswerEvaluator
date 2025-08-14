// components/OcrModal.tsx

'use client';

// Define the type for the component's props
interface OcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  isLoading: boolean;
}

export default function OcrModal({ isOpen, onClose, text, isLoading }: OcrModalProps) {
  // If the modal is not open, render nothing
  if (!isOpen) {
    return null;
  }

  return (
    // Modal overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      {/* Modal content */}
      <div 
        className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl" 
        onClick={(e) => e.stopPropagation()} // Prevents modal from closing when clicking inside
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900"
          aria-label="Close modal"
        >
          &times;
        </button>

        <h2 className="mb-4 text-xl font-bold text-gray-800">Extracted Text</h2>
        
        {/* Display a loading spinner or the extracted text */}
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-blue-600"></div>
          </div>
        ) : (
          <div className="h-96 overflow-y-auto rounded-md bg-gray-50 p-4">
            <pre className="whitespace-pre-wrap font-sans text-gray-700">{text}</pre>
          </div>
        )}
      </div>
    </div>
  );
}