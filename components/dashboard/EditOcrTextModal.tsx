import React from 'react';

interface EditOcrTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  onTextChange: (newText: string) => void;
  onConfirm: () => void;
  fileName: string;
}

const EditOcrTextModal: React.FC<EditOcrTextModalProps> = ({
  isOpen,
  onClose,
  text,
  onTextChange,
  onConfirm,
  fileName
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 z-50 flex justify-center items-center font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 transform transition-all duration-300 ease-in-out">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Review & Edit Extracted Text</h2>
              <p className="text-md text-gray-500 mt-1">
                Corrections can be made below for the file: <span className="font-semibold text-gray-700">{fileName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2 -mt-2 -mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-1 bg-gray-50">
            <textarea
              className="w-full h-80 p-4 border-0 rounded-md resize-none focus:ring-2 focus:ring-blue-500 transition-shadow text-gray-700 leading-relaxed bg-transparent"
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              spellCheck="true"
            />
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-5 rounded-b-2xl flex justify-end items-center space-x-4">
           <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-3 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Confirm & Start Evaluation
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditOcrTextModal;