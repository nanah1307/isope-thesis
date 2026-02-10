"use client";

import type { Question } from "@/app/lib/evaluationData";

export default function AnswerView({ questions }: { questions: Question[] }) {
  return (
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
  );
}
