'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, FileUp, Sparkles } from 'lucide-react'
import { useEvaluationStore } from '@/lib/store'
import { EvaluationCompletePayload, PreparedQuestion } from '@/lib/types'

interface EvaluateCardProps {
  onEvaluationStart: () => void
  onEvaluationComplete: (payload: EvaluationCompletePayload) => void
  onEvaluationError: (error: string) => void
}

const subjects = [
  { name: 'General Studies - I', color: 'bg-green-500', code: 'GS1' },
  { name: 'General Studies - II', color: 'bg-blue-500', code: 'GS2' },
  { name: 'General Studies - III', color: 'bg-orange-500', code: 'GS3' },
  { name: 'General Studies - IV', color: 'bg-red-500', code: 'GS4' },
  { name: 'Essay Paper', color: 'bg-purple-500', code: 'Essay' },
]

export default function EvaluateCard({
  onEvaluationStart,
  onEvaluationComplete,
  onEvaluationError,
}: EvaluateCardProps) {
  const {
    isConfirming,
    setIsConfirming,
    preparedData,
    setPreparedData,
    setProcessingState,
  } = useEvaluationStore()

  const [selectedSubject, setSelectedSubject] = useState(subjects[0])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [editableContent, setEditableContent] = useState<string[]>([])

  useEffect(() => {
    if (preparedData.length > 0) {
      // Combines the question and answer into a single string for the textarea
      const formatted = preparedData.map(
        (q) =>
          `Q${q.questionNumber} (${q.maxMarks} Marks): ${q.questionText}\n\n${q.userAnswer}`,
      )
      setEditableContent(formatted)
    }
  }, [preparedData])

  const handleFileChange = (file: File | null) => {
    if (file) {
      setSelectedFile(file)
      setError('')
      setIsConfirming(false)
    }
  }

  const handlePrepareEvaluation = async () => {
    if (!selectedFile) {
      setError('Please choose a file to evaluate.')
      return
    }
    setError('')
    setProcessingState('ocr')

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('subject', selectedSubject.code)

    try {
      const response = await fetch('/api/prepare-evaluation', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to prepare the document.')
      }
      setPreparedData(result)
      setIsConfirming(true)
    } catch (err: any) {
      setError(err.message)
      onEvaluationError(err.message)
    } finally {
      setProcessingState('idle')
    }
  }

  const handleConfirmEvaluation = async () => {
    onEvaluationStart()
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preparedData: preparedData,
          subject: selectedSubject.code,
        }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get final evaluation.')
      }
      onEvaluationComplete({
        analysis: result,
        preparedData: preparedData,
        subject: selectedSubject.code as EvaluationCompletePayload['subject'],
      })
    } catch (err: any) {
      setError(err.message)
      onEvaluationError(err.message)
    } finally {
      setIsConfirming(false)
    }
  }

  const handleSelectSubject = (subject: {
    name: string
    color: string
    code: string
  }) => {
    setSelectedSubject(subject)
    setIsDropdownOpen(false)
  }

  // Parses the single text block back into its parts
  const handleContentChange = (index: number, value: string) => {
    const newEditableContent = [...editableContent]
    newEditableContent[index] = value
    setEditableContent(newEditableContent)

    const lines = value.split('\n')
    const questionLine = lines[0] || ''
    const answer = lines.slice(2).join('\n')

    // This regex is more robust to find the question text
    const qMatch = questionLine.match(/^(?:Q?\d+\s*\(\d+\s*Marks\):\s*)?(.*)/)
    const questionText = qMatch ? qMatch[1] : ''

    const updatedData = [...preparedData]
    updatedData[index] = { ...updatedData[index], questionText, userAnswer: answer }
    setPreparedData(updatedData)
  }

  if (isConfirming) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200/60">
        <h3 className="text-xl font-bold">Confirm Extracted Content</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          Please verify the content before proceeding.
        </p>
        <div className="max-h-[70vh] overflow-y-auto space-y-4 bg-slate-50 p-4 rounded-md border">
          {preparedData.map((q, index) => (
            // This is the editable implementation of your original, non-sticky layout
            <div key={q.questionNumber}>
              <textarea
                value={editableContent[index] || ''}
                onChange={(e) => handleContentChange(index, e.target.value)}
                className="w-full p-2 text-sm text-slate-600 whitespace-pre-wrap resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[250px] border-l-2 border-slate-300"
                style={{ fontStyle: 'italic' }}
              />
            </div>
          ))}
        </div>
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => setIsConfirming(false)}
            className="w-full rounded-lg px-6 py-3 text-md font-semibold bg-slate-200 hover:bg-slate-300 transition-all"
          >
            Back
          </button>
          <button
            onClick={handleConfirmEvaluation}
            className="w-full rounded-lg px-6 py-3 text-md font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all btn"
          >
            Confirm & Start Evaluation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col rounded-2xl bg-white p-8 shadow-lg border border-gray-200/60 transition-transform duration-300 hover:scale-[1.02]">
      <Sparkles
        className="absolute -top-3 -left-3 h-8 w-8 text-yellow-400"
        fill="currentColor"
      />
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Evaluate New Answer
          </h2>
          <p className="text-sm text-gray-500">
            Upload your handwritten answer for AI evaluation
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between w-52 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm"
          >
            {selectedSubject ? (
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${selectedSubject.color}`}
                ></span>
                <span className="font-semibold text-gray-800">
                  {selectedSubject.name}
                </span>
              </div>
            ) : (
              'Select Subject'
            )}
            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                {subjects.map((subject) => (
                  <a
                    key={subject.name}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      handleSelectSubject(subject)
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-slate-100"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${subject.color}`}
                    ></span>
                    {subject.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="my-8 flex-grow flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-8 text-center">
        <div className="rounded-full bg-green-100 p-4">
          <FileUp className="h-10 w-10 text-green-600" />
        </div>
        <p className="mt-4 font-semibold text-gray-700">
          {selectedFile ? selectedFile.name : 'Upload Answer Sheet'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Drag and drop or click to browse
        </p>
        <label
          htmlFor="file-upload"
          className="mt-6 px-6 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg shadow-sm hover:bg-emerald-600 btn cursor-pointer"
        >
          Choose File
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={(e) =>
            handleFileChange(e.target.files ? e.target.files[0] : null)
          }
          accept="application/pdf,image/jpeg,image/png"
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
      )}
      <button
        onClick={handlePrepareEvaluation}
        className={`w-full rounded-lg py-3 text-md font-semibold text-white transition-all btn ${
          !selectedFile
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
        disabled={!selectedFile}
      >
        {`Evaluate for ${selectedSubject?.code}`}
      </button>
    </div>
  )
}