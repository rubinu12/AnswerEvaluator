// app/admin/components/QuestionListManager.tsx
// (FIX 3: Using a direct inline style={{ whiteSpace: "pre-line" }})

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MergedQuestion, TopicTree, FirestoreQuestion } from '@/lib/adminTypes';
import QuestionEditModal from './QuestionEditModal'; // FIXED PATH
import {
  Edit,
  Filter,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  ListTodo,
} from 'lucide-react';

const ITEMS_PER_PAGE = 25;

interface QuestionListManagerProps {
  allQuestions: MergedQuestion[];
  topicTree: TopicTree;
}

export default function QuestionListManager({
  allQuestions,
  topicTree,
}: QuestionListManagerProps) {
  // This state holds the "master list" of questions in memory.
  // We use this so we can update it locally on save, avoiding a full page refresh.
  const [questions, setQuestions] = useState(allQuestions);
  
  // This effect ensures that if the server data ever changes (on a hard refresh),
  // our local state is updated.
  useEffect(() => {
    setQuestions(allQuestions);
  }, [allQuestions]);

  // State for all our filters
  const [filters, setFilters] = useState({
    showMissing: false, // This is our "To-Do List" filter
    subject: '',
    topic: '',
    year: '',
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // State for managing the "Quick Edit" modal
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    question: MergedQuestion | null;
  }>({
    isOpen: false,
    question: null,
  });

  // --- Memoized Filtering Logic ---

  // Get Level 1 topics (same logic as the modal)
  const level1Topics = useMemo(() => {
    return topicTree.filter(node => node.id === 'prelim');
  }, [topicTree]);

  // Get Level 2 topics based on selected Level 1
  const level2Topics = useMemo(() => {
    if (!filters.subject) return [];
    const parent = topicTree.find(node => node.id === filters.subject);
    return parent ? parent.children : [];
  }, [topicTree, filters.subject]);

  // This is the core logic: filter the master list based on state
  const filteredQuestions = useMemo(() => {
    let filtered = [...questions]; // Start with the full list

    // 1. Filter by "To-Do" (Missing Explanation)
    if (filters.showMissing) {
      filtered = filtered.filter(q => !q.hasExplanation);
    }

    // 2. Filter by Subject (L1)
    if (filters.subject) {
      filtered = filtered.filter(q => q.subject === filters.subject);
    }

    // 3. Filter by Topic (L2)
    if (filters.topic) {
      filtered = filtered.filter(q => q.topic === filters.topic);
    }

    // 4. Filter by Year
    if (filters.year) {
      filtered = filtered.filter(q => q.year === Number(filters.year));
    }

    return filtered;
    // This recalculates *only* when questions or filters change
  }, [questions, filters]);

  // Get unique years from the filtered list for the year dropdown
  const uniqueYears = useMemo(() => {
    const years = new Set(questions.map(q => q.year).filter(Boolean));
    return Array.from(years).sort((a, b) => b - a); // Newest first
  }, [questions]);
  
  // --- Memoized Pagination Logic ---

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, end);
  }, [filteredQuestions, currentPage]);

  // --- Event Handlers ---

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      };
      
      // If Subject (L1) changes, reset Topic (L2)
      if (name === 'subject') {
        newFilters.topic = '';
      }
      return newFilters;
    });
    
    // Reset to page 1 whenever filters change
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenModal = (question: MergedQuestion) => {
    setModalState({ isOpen: true, question });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, question: null });
  };

  // This is the "magic": update local state on save so the UI
  // updates instantly without a full page reload.
  const handleSaveQuestion = (updatedQuestion: MergedQuestion) => {
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      )
    );
    // The `useMemo` for filteredQuestions will auto-run and update the list.
    handleCloseModal();
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-lg shadow space-y-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        
        {/* Filter Row 1: Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded-md bg-white"
          >
            <option value="">All Subjects</option>
            {level1Topics.map(node => (
              <option key={node.id} value={node.id}>{node.name}</option>
            ))}
          </select>
          
          <select
            name="topic"
            value={filters.topic}
            onChange={handleFilterChange}
            disabled={!filters.subject || level2Topics.length === 0}
            className="w-full px-3 py-2 border rounded-md bg-white disabled:bg-gray-100"
          >
            <option value="">All Topics</option>
            {level2Topics.map(node => (
              <option key={node.id} value={node.id}>{node.name}</option>
            ))}
          </select>
          
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border rounded-md bg-white"
          >
            <option value="">All Years</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        {/* Filter Row 2: To-Do Toggle */}
        <div className="flex items-center pt-2">
          <input
            type="checkbox"
            id="showMissing"
            name="showMissing"
            checked={filters.showMissing}
            onChange={handleFilterChange}
            className="w-5 h-5 rounded"
          />
          <label htmlFor="showMissing" className="ml-2 font-medium text-gray-700">
            Show "To-Do List" (Missing Explanations)
          </label>
        </div>
      </div>
      
      {/* Results & Question List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header with stats */}
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
           <div className="flex items-center space-x-2">
            {filters.showMissing ? (
               <ListTodo className="w-5 h-5 text-blue-600" />
            ) : (
               <Database className="w-5 h-5 text-blue-600" />
            )}
            <h2 className="text-lg font-semibold">
              {filters.showMissing ? "To-Do List" : "All Questions"}
            </h2>
          </div>
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Showing {filteredQuestions.length} of {questions.length} total
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Question</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject/Topic</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Year</th>
                <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="p-3 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedQuestions.map(q => (
                <tr key={q.id}>
                  
                  {/* --- THIS IS THE FIX --- */}
                  <td 
                    className="p-3 text-sm text-gray-800" 
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {q.questionText}
                  </td>
                  {/* --- END OF FIX --- */}

                  <td className="p-3 text-sm text-gray-600">
                    <div>{q.subject}</div>
                    <div className="text-xs">{q.topic}</div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{q.year}</td>
                  <td className="p-3 text-center">
                    {q.hasExplanation ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleOpenModal(q)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md"
                      title="Quick Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {/* We will add the "Go to Workbench" button here in Part C */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-800">No questions found</h3>
            <p className="text-sm text-gray-500">
              Try adjusting your filters or adding new questions.
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-3 py-1.5 text-sm font-medium bg-white border rounded-md disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-3 py-1.5 text-sm font-medium bg-white border rounded-md disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Modal Renderer */}
      {modalState.isOpen && modalState.question && (
        <QuestionEditModal
          question={modalState.question}
          topicTree={topicTree}
          onClose={handleCloseModal}
          onSave={handleSaveQuestion}
        />
      )}
    </>
  );
}