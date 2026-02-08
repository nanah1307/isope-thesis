'use client';

import { DocumentIcon } from '@heroicons/react/24/outline';
import { PDFViewer } from './pdf-viewer';
import type { ReactNode } from 'react';

export function GradingTab({
  state,
  updateState,
  isOSAS,
  AnswersDisplay,
}: {
  state: any;
  updateState: (updates: any) => void;
  isOSAS: boolean;
  AnswersDisplay: () => ReactNode;
}) {
  return (
    <div>
      <h2 className="text-gray-900 font-bold mb-8 text-2xl">Grading</h2>

      {state.submissiontype === 'pdf' && state.uploadedPdf ? (
        <PDFViewer state={state} updateState={updateState} />
      ) : state.submissiontype === 'pdf' && !state.uploadedPdf ? (
        <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <DocumentIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No PDF submission uploaded yet</p>
            {isOSAS && <p className="text-gray-400 text-sm mt-2">Student needs to upload PDF in the Instructions tab</p>}
          </div>
        </div>
      ) : (
        <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Answers</h3>
          <AnswersDisplay />
        </div>
      )}
    </div>
  );
}
