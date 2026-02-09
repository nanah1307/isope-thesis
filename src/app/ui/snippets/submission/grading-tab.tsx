'use client';

import { DocumentIcon } from '@heroicons/react/24/outline';
import { PDFViewer } from './pdf-viewer';

export function GradingTab({
  state,
  updateState,
  isOSAS,
  handleSubmitFreeform,
}: {
  state: any;
  updateState: (updates: any) => void;
  isOSAS: boolean;
  handleSubmitFreeform: () => void;
}) {

  return (
    <div>
      {/* PDF submission */}
      {state.submissiontype === 'pdf' && (
        <>
          {state.uploadedPdfs && state.uploadedPdfs.length > 0 ? (
           <div className="space-y-4">
              {state.uploadedPdfs.length > 1 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uploaded PDFs ({state.uploadedPdfs.length})
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {state.uploadedPdfs.map((pdf: any) => {
                      const fileName = pdf.filepath.split('/').pop();
                      const isActive = state.selectedPdfId === pdf.id;

                      return (
                        <button
                          key={pdf.id}
                          type="button"
                          onClick={() =>
                            updateState({
                              selectedPdfId: pdf.id,
                              uploadedPdf: pdf.signedUrl,
                              pdfFileName: fileName,
                            })
                          }
                          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
                          }`}
                          title={fileName}
                        >
                          {fileName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <PDFViewer
                state={state}
                updateState={updateState}
              />
            </div>

          ) : (
            <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <DocumentIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">No PDF submission uploaded yet</p>
                {isOSAS && (
                  <p className="text-gray-400 text-sm mt-2">
                    Student needs to upload PDF in the Instructions tab
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Freeform submission */}
      {state.submissiontype !== 'pdf' && (
        <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Freeform Response
          </h3>

          <textarea
          className={`w-full h-[300px] rounded-lg border border-gray-300 p-4 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isOSAS ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
          placeholder={isOSAS ? 'No response submitted yet' : 'Enter your response here...'}
          value={state.freeformAnswer || ''}
          readOnly={isOSAS}
          onChange={(e) =>
            !isOSAS && updateState({ freeformAnswer: e.target.value })
          }
        />

        {!isOSAS && (
          <button
            onClick={handleSubmitFreeform}
            disabled={!state.freeformAnswer}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg transition-colors cursor-pointer"
          >
            Submit
          </button>
        )}
        </div>
      )}
    </div>
  );
}
