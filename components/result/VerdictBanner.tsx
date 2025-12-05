'use client';

import React from 'react';
import { MessageSquareQuote } from 'lucide-react';
import { OverallFeedback } from '@/lib/types';

interface VerdictBannerProps {
  feedback: OverallFeedback;
}

export default function VerdictBanner({ feedback }: VerdictBannerProps) {
  if (!feedback) return null;

  return (
    <section className="mb-6">
      <div className="bg-blue-50/80 text-slate-800 rounded-xl p-5 shadow-sm border border-blue-100 flex items-start gap-4">
        <div className="mt-1 shrink-0 bg-blue-100 p-2 rounded-lg text-blue-600">
          <MessageSquareQuote size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
            Verdict: {feedback.headline}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {feedback.description}
          </p>
        </div>
      </div>
    </section>
  );
}