"use client";

import React from 'react';

interface AdminHeaderProps {
    onBulkAddClick: () => void;
    onNewQuestionClick: () => void; // Add this prop
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onBulkAddClick, onNewQuestionClick }) => {
    return (
        <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Question Bank</h1>
            <div className="flex items-center gap-4">
                {/* New Button for Single Question */}
                <button
                    onClick={onNewQuestionClick}
                    className="btn bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-green-700 flex items-center gap-2"
                >
                    <i className="ri-add-line"></i>
                    New Question
                </button>

                <button
                    onClick={onBulkAddClick}
                    className="btn bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 flex items-center gap-2"
                >
                    <i className="ri-upload-cloud-2-line"></i>
                    Bulk Add
                </button>
            </div>
        </div>
    );
};

export default AdminHeader;
