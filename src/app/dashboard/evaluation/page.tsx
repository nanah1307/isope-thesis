"use client";

import { useState } from "react";
import dummyEvaluation from "@/app/lib/evaluationData";

type QType = "input" | "dropdown" | "likert" | "checkbox";

type Question = {
  id: string;
  type: QType;
  text: string;
  options?: string[];
  scale?: number;
};

export default function Page() {
  const [questions, setQuestions] = useState<Question[]>(() =>
    dummyEvaluation.questions.map((q) => ({ ...q }))
  );
  const [selectedType, setSelectedType] = useState<QType>("input");

  function addQuestion() {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const base: Question = { id, type: selectedType, text: "Untitled question" };
    if (selectedType === "dropdown" || selectedType === "checkbox") base.options = ["Option 1", "Option 2"];
    if (selectedType === "likert") base.scale = 5;
    setQuestions((s) => [...s, base]);
  }

  function updateQuestion(id: string, patch: Partial<Question>) {
    setQuestions((s) => s.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  function removeQuestion(id: string) {
    setQuestions((s) => s.filter((q) => q.id !== id));
  }

  function addOption(qid: string) {
    setQuestions((s) => s.map((q) => (q.id === qid ? { ...q, options: [...(q.options || []), `Option ${((q.options||[]).length||0)+1}`] } : q)));
  }

  function updateOption(qid: string, idx: number, value: string) {
    setQuestions((s) => s.map((q) => {
      if (q.id !== qid) return q;
      const opts = [...(q.options || [])];
      opts[idx] = value;
      return { ...q, options: opts };
    }));
  }

  function removeOption(qid: string, idx: number) {
    setQuestions((s) => s.map((q) => {
      if (q.id !== qid) return q;
      const opts = [...(q.options || [])];
      opts.splice(idx, 1);
      return { ...q, options: opts };
    }));
  }

  function saveForm() {
    console.log("Form JSON:", JSON.stringify(questions, null, 2));
    alert("Form JSON copied to console");
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Form Editor</h2>

          <div className="flex gap-2 mb-4 items-center">
            <label className="text-sm">Add question:</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as QType)} className="border px-2 py-1 rounded">
              <option value="input">Input</option>
              <option value="dropdown">Dropdown</option>
              <option value="likert">Likert (scale)</option>
              <option value="checkbox">Checkboxes</option>
            </select>
            <button onClick={addQuestion} className="ml-auto bg-blue-600 text-white px-3 py-1 rounded">Add</button>
            <button onClick={saveForm} className="bg-green-600 text-white px-3 py-1 rounded">Save</button>
          </div>

          <div className="space-y-4">
            {questions.length === 0 && <p className="text-sm text-gray-500">No questions yet — add one.</p>}
            {questions.map((q) => (
              <div key={q.id} className="border rounded p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <input className="w-full border px-2 py-1 mb-2 text-black" value={q.text} onChange={(e) => updateQuestion(q.id, { text: e.target.value })} />
                    <div className="text-sm text-black mb-2">Type: <strong>{q.type}</strong></div>

                    {(q.type === "dropdown" || q.type === "checkbox") && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Options</div>
                        {(q.options || []).map((opt, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input className="flex-1 border px-2 py-1 text-black" value={opt} onChange={(e) => updateOption(q.id, idx, e.target.value)} />
                            <button className="text-red-500" onClick={() => removeOption(q.id, idx)}>Remove</button>
                          </div>
                        ))}
                        <button className="text-sm text-blue-600" onClick={() => addOption(q.id)}>+ Add option</button>
                      </div>
                    )}

                    {q.type === "likert" && (
                      <div className="mt-2">
                        <label className="text-sm">Scale (number of points):</label>
                        <input type="number" min={2} max={10} value={q.scale} onChange={(e) => updateQuestion(q.id, { scale: Number(e.target.value) })} className="ml-2 border px-2 py-1 w-20 text-black" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button className="text-sm text-red-600" onClick={() => removeQuestion(q.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-3">Preview</h2>
          <form className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="border-b pb-3">
                <label className="block font-medium mb-2 text-black">{q.text}</label>
                {q.type === "input" && (
                  <input className="w-full border px-2 py-1 text-black" placeholder={q.text} />
                )}

                {q.type === "dropdown" && (
                  <select defaultValue="" className="w-full border px-2 py-1 text-black">
                    <option value="" disabled>{q.text}</option>
                    {(q.options || []).map((o, idx) => <option key={idx} className="text-black">{o}</option>)}
                  </select>
                )}

                {q.type === "checkbox" && (
                  <div className="space-y-1">
                    {(q.options || []).map((o, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-black">
                        <input type="checkbox" />
                        <span className="text-black">{o}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "likert" && (
                  <div className="flex gap-2 items-center">
                    {[...Array(q.scale || 5)].map((_, idx) => (
                      <label key={idx} className="flex flex-col items-center text-sm text-black">
                        <input type="radio" name={q.id} />
                        <span className="text-xs">{idx + 1}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </form>
        </div>
      </div>
    </div>
  );
}
