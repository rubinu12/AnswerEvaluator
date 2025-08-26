// lib/render-pdf.tsx
import 'server-only'; // Ensures this module is never bundled for the client

import { renderToString } from 'react-dom/server';
import { PdfReportLayout } from '@/components/pdf/PdfReportLayout';
import { EvaluationData } from '@/lib/types';

/**
 * Renders the PDF report React component to an HTML string.
 * @param data The evaluation data for the report.
 * @returns An HTML string representation of the report.
 */
export function renderPdfAsString(data: EvaluationData): string {
  // Assuming PdfReportLayout is a valid React component that takes 'data' as a prop
  // and doesn't use any client-side hooks or features.
  return renderToString(<PdfReportLayout data={data} />);
}