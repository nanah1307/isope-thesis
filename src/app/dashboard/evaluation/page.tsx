"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import dummyEvaluation, { QType, Question } from "@/app/lib/evaluationData";
import OsasEvaluationView from "@/app/ui/snippets/evaluation/OsasEvaluationView";
import MemberEvaluationView from "@/app/ui/snippets/evaluation/MemberEvaluationView";

export default function Page() {
  const { data: session, status } = useSession();

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

  //partial means any type of input from question can be nulled
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

  if (status === "loading") {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <p className="text-black">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <p className="text-black">You must be logged in to access this page.</p>
      </div>
    );
  }

  const role = (session.user as any)?.role ?? "member";
  const isOsas = role === "osas";

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      {//for osas viewers
      isOsas ? (
        <OsasEvaluationView
          questions={questions}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          addQuestion={addQuestion}
          saveForm={saveForm}
          updateQuestion={updateQuestion}
          removeQuestion={removeQuestion}
          addOption={addOption}
          updateOption={updateOption}
          removeOption={removeOption}
        />
      ) : (
        //for members
        <MemberEvaluationView questions={questions} />
      )}
    </div>
  );
}
