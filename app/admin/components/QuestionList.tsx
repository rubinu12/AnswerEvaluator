"use client";

import React from 'react';
import { Question } from '@/lib/quizTypes'; // 1. Use the correct, unified Question type

interface QuestionListProps {
    questions: Question[]; // Expects our new Question type
    selectedQuestionIds: string[];
    setSelectedQuestionIds: (ids: string[]) => void;
}

const QuestionList: React.FC<QuestionListProps> = ({ questions, selectedQuestionIds, setSelectedQuestionIds }) => {

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedQuestionIds(questions.map(q => q.id!)); // 2. Use question.id
        } else {
            setSelectedQuestionIds([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setSelectedQuestionIds([...selectedQuestionIds, id]);
        } else {
            setSelectedQuestionIds(selectedQuestionIds.filter(qid => qid !== id));
        }
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                    <tr>
                        <th scope="col" className="p-4">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                onChange={handleSelectAll}
                                checked={selectedQuestionIds.length === questions.length && questions.length > 0}
                            />
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Question
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Year
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {questions.map((question) => (
                        <tr key={question.id} className="hover:bg-gray-50">
                            <td className="p-4">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    checked={selectedQuestionIds.includes(question.id!)}
                                    onChange={(e) => handleSelectOne(e, question.id!)}
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 truncate max-w-md">{question.questionText}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {question.subject}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {question.year}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default QuestionList;