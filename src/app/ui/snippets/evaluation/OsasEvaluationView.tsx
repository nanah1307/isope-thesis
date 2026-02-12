"use client";

import { useState } from "react";
import type { Question, QType, AnswersMap } from "@/app/lib/evaluationData";
import AnswerView from "@/app/ui/snippets/evaluation/AnswerView";

type Props = {
  questions: Question[];
  selectedType: QType;
  setSelectedType: (value: QType) => void;
  addQuestion: () => void;
  saveForm: () => void;
  updateQuestion: (id: string, patch: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
  addOption: (id: string) => void;
  updateOption: (id: string, idx: number, value: string) => void;
  removeOption: (id: string, idx: number) => void;
};

export default function OsasEvaluationView({
  questions,
  selectedType,
  setSelectedType,
  addQuestion,
  saveForm,
  updateQuestion,
  removeQuestion,
  addOption,
  updateOption,
  removeOption,
}: Props) {
  const [previewAnswers, setPreviewAnswers] = useState<AnswersMap>({});

  const setAnswer = (qid: string, value: any) => {
    setPreviewAnswers((p) => ({ ...p, [qid]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Form Editor</h2>

        <div className="flex gap-2 mb-4 items-center">
          <label className="text-sm">Add question:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as QType)}
            className="border px-2 py-1 rounded"
          >
            <option value="input">Input</option>
            <option value="dropdown">Dropdown</option>
            <option value="likert">Likert (scale)</option>
            <option value="checkbox">Checkboxes</option>
          </select>
          <button type="button" onClick={addQuestion} className="ml-auto bg-blue-600 text-white px-3 py-1 rounded">
            Add
          </button>
          <button type="button" onClick={saveForm} className="bg-green-600 text-white px-3 py-1 rounded">
            Save
          </button>
        </div>

        <div className="space-y-4">
          {questions.length === 0 && <p className="text-sm text-gray-500">No questions yet — add one.</p>}

          {questions.map((q) => (
            <div key={q.id} className="border rounded p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <input
                    className="w-full border px-2 py-1 mb-2 text-black"
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                  />

                  <div className="text-sm text-black mb-2">
                    Type: <strong>{q.type}</strong>
                  </div>

                  {(q.type === "dropdown" || q.type === "checkbox") && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Options</div>
                      {(q.options || []).map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            className="flex-1 border px-2 py-1 text-black"
                            value={opt}
                            onChange={(e) => updateOption(q.id, idx, e.target.value)}
                          />
                          <button type="button" className="text-red-500" onClick={() => removeOption(q.id, idx)}>
                            Remove
                          </button>
                        </div>
                      ))}
                      <button type="button" className="text-sm text-blue-600" onClick={() => addOption(q.id)}>
                        + Add option
                      </button>
                    </div>
                  )}

                  {q.type === "likert" && (
                    <div className="mt-2">
                      <label className="text-sm">Scale (number of points):</label>
                      <input
                        type="number"
                        min={2}
                        max={10}
                        value={q.scale ?? 5}
                        onChange={(e) => updateQuestion(q.id, { scale: Number(e.target.value) })}
                        className="ml-2 border px-2 py-1 w-20 text-black"
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button type="button" className="text-sm text-red-600" onClick={() => removeQuestion(q.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Preview</h2>
        <AnswerView questions={questions} answers={previewAnswers} setAnswer={setAnswer} />
      </div>
    </div>
  );
}
