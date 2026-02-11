"use client";

import type { Question } from "@/app/lib/evaluationData";
import AnswerView from "@/app/ui/snippets/evaluation/AnswerView";

type Props = {
  questions: Question[];
};

export default function MemberEvaluationView({ questions }: Props) {
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4 text-black">Evaluation Form</h2>
      <AnswerView questions={questions} />
    </div>
  );
}
