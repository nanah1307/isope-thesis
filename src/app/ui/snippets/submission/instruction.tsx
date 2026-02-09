'use client';


import {TrashIcon, ArrowUpTrayIcon, PencilSquareIcon } from '@heroicons/react/24/outline';


// Reusable InstructionsBlock component
export function InstructionsBlock({
  state,
  updateState,
  handlePdfUpload,
  handleRemovePdf,
  handleSaveInstructions,
  handleCancelEditInstructions,
  handleSubmissionTypeChange,
}: {
  state: any;
  updateState: (updates: any) => void;
  handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemovePdf: (pdfId: string) => void;
  handleSaveInstructions: () => void;
  handleCancelEditInstructions: () => void;
  handleSubmissionTypeChange: (type: 'freeform' | 'pdf') => void;
}) {
  const isOSAS = state.userRole === 'osas';
  const isMember = state.userRole === 'member';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-red-600 font-bold text-2xl">Instructions:</h2>
        <div className="flex items-center gap-2">
          {isMember && state.submissiontype === 'pdf' && !state.isEditingInstructions && (
            <>
              {state.uploadedPdfs && state.uploadedPdfs.length > 0 && (
                <div className="space-y-2 mb-4">
                  {state.uploadedPdfs.map((pdf: any, idx: number) => (
                    <div key={pdf.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg border border-gray-300">
                      <span className="text-gray-900 truncate">{pdf.filepath.split('/').pop()}</span>
                      <button
                        onClick={() => handleRemovePdf(pdf.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer">
                <ArrowUpTrayIcon className="w-5 h-5" />
                Upload PDF
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            </>
          )}



          {isOSAS && !state.isEditingInstructions ? (
            <button onClick={() => updateState({ isEditingInstructions: true })} disabled={state.isEditingGrade}
              className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${
                state.isEditingGrade ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}>
              <PencilSquareIcon className="w-5 h-5" />
              Edit Instructions
            </button>
          ) : isOSAS && state.isEditingInstructions ? (
            <div className="flex gap-2">
              <button onClick={handleSaveInstructions} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors cursor-pointer">Save</button>
              <button onClick={handleCancelEditInstructions} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors cursor-pointer">Cancel</button>
            </div>
          ) : null}
        </div>
      </div>

      {state.isEditingInstructions && isOSAS ? (
        <>
          <textarea value={state.instructions} onChange={(e) => updateState({ instructions: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-xl font-medium min-h-[200px]"
            placeholder="Enter instructions here..." />

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-gray-900 font-bold text-lg mb-4">Submission Type:</h3>
            <div className="flex gap-6">
              {(['freeform', 'pdf'] as const).map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="submissiontype" value={type} checked={state.submissiontype === type}
                    onChange={() => handleSubmissionTypeChange(type)}
                    className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer" />
                  <span className="text-gray-900 font-medium text-lg">{type === 'freeform' ? 'Freeform Answer' : 'PDF Submission'}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-gray-900 mb-10 leading-relaxed text-xl max-w-4xl font-medium">{state.instructions}</p>
      )}
    </div>
  );
}
