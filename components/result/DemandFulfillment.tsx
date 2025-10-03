// components/result/DemandFulfillment.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Key } from 'lucide-react';
import { QuestionDeconstruction } from '@/lib/types';

interface DemandFulfillmentProps {
    deconstruction: QuestionDeconstruction;
}

const getFulfillmentIcon = (status: 'Fully Addressed' | 'Partially Addressed' | 'Not Addressed') => {
    switch (status) {
        case 'Fully Addressed':
            return <CheckCircle2 className="h-6 w-6 text-emerald-500 flex-shrink-0" />;
        case 'Partially Addressed':
            return <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0" />;
        case 'Not Addressed':
            return <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />;
        default:
            return <AlertCircle className="h-6 w-6 text-gray-500 flex-shrink-0" />;
    }
};

export default function DemandFulfillment({ deconstruction }: DemandFulfillmentProps) {
    if (!deconstruction || !deconstruction.coreDemands) {
        return null;
    }

    return (
        <div className="p-6 bg-blue-50/70 rounded-lg border border-blue-200">
            <h4 className="text-base font-bold text-blue-900 mb-4">Question Demand Analysis</h4>
            <div className="space-y-4">
                {deconstruction.coreDemands.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-4"
                    >
                        {getFulfillmentIcon(item.userFulfillment)}
                        <div>
                            <p className="font-semibold text-slate-800">{item.demand}</p>
                            <p className="text-sm text-slate-600 mt-1">{item.mentorComment}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
            {/* NEW & IMPROVED KEYWORDS SECTION */}
            <div className="mt-6 pt-4 border-t border-blue-200/60">
                <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-blue-800" />
                    <h5 className="font-semibold text-blue-900">Keywords Identified in Question:</h5>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {deconstruction.identifiedKeywords.map((keyword, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white text-blue-800 text-xs font-bold rounded-full border border-blue-300">
                            {keyword}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}