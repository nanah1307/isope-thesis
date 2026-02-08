'use client';

import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const IconButton = ({ onClick, disabled, className, children, title }: any) => (
  <button onClick={onClick} disabled={disabled} title={title}
    className={`p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}>
    {children}
  </button>
);

export function PDFViewer({
  state,
  updateState,
}: {
  state: any;
  updateState: (updates: any) => void;
}) {
  if (!state.uploadedPdf) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500 text-lg">No PDF uploaded</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => updateState({ currentPage: Math.max(1, state.currentPage - 1) })} disabled={state.currentPage === 1}>
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </IconButton>

          <div className="flex items-center gap-2">
            <input type="number" value={state.currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= 1 && val <= state.totalPages) updateState({ currentPage: val });
              }}
              className="w-16 px-2 py-1 bg-gray-700 text-white text-center rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-white text-sm">of {state.totalPages}</span>
          </div>

          <IconButton onClick={() => updateState({ currentPage: Math.min(state.totalPages, state.currentPage + 1) })} disabled={state.currentPage === state.totalPages}>
            <ChevronRightIcon className="w-5 h-5 text-white" />
          </IconButton>
        </div>

        <div className="flex items-center gap-2">
          <IconButton onClick={() => updateState({ pdfZoom: Math.max(0.5, state.pdfZoom - 0.1) })}>
            <MagnifyingGlassMinusIcon className="w-5 h-5 text-white" />
          </IconButton>
          <span className="text-white text-sm min-w-[60px] text-center">{Math.round(state.pdfZoom * 100)}%</span>
          <IconButton onClick={() => updateState({ pdfZoom: Math.min(2, state.pdfZoom + 0.1) })}>
            <MagnifyingGlassPlusIcon className="w-5 h-5 text-white" />
          </IconButton>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white text-sm mr-2">{state.pdfFileName}</span>
          <a href={state.uploadedPdf} download={state.pdfFileName} className="p-2 hover:bg-gray-700 rounded transition-colors" title="Download PDF">
            <ArrowDownTrayIcon className="w-5 h-5 text-white" />
          </a>
        </div>
      </div>

      <div className="overflow-auto max-h-[700px] bg-gray-700 flex justify-center p-4">
        <iframe src={`${state.uploadedPdf}#page=${state.currentPage}&zoom=${state.pdfZoom * 100}`}
          className="w-full min-h-[600px] bg-white rounded" title="PDF Viewer" />
      </div>
    </div>
  );
}
