'use client'

import { useState } from 'react'

// 1. We update the props to specify that onConfirm will receive a string
interface EditOcrTextModalProps {
  initialText: string
  onConfirm: (editedText: string) => void
  onCancel: () => void
}

export default function EditOcrTextModal({
  initialText,
  onConfirm,
  onCancel,
}: EditOcrTextModalProps) {
  const [editedText, setEditedText] = useState(initialText)

  // 2. This handler now passes the component's state back to the parent
  const handleConfirm = () => {
    onConfirm(editedText)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Review and Edit Extracted Text
        </h2>
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full flex-grow border border-gray-300 rounded-lg p-3 text-base font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          spellCheck="false"
        />
        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Confirm & Evaluate
          </button>
        </div>
      </div>
    </div>
  )
}