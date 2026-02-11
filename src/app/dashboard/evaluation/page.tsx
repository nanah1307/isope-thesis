"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import dummyEvaluation, { QType, Question } from "@/app/lib/evaluationData";
import OsasEvaluationView from "@/app/ui/snippets/evaluation/OsasEvaluationView";
import MemberEvaluationView from "@/app/ui/snippets/evaluation/MemberEvaluationView";

export default function Page() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"instructions" | "submission">("instructions");
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);

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

  if (status === "loading") {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-900">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-900">You must be logged in to access this page.</p>
      </div>
    );
  }

  const role = (session.user as any)?.role ?? "member";
  const isOsas = role === "osas";

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Test 1.1
          </h1>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Container with Tabs and Content */}
            <div className="bg-white rounded-lg shadow border border-gray-200">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("instructions")}
                  className={`px-6 py-4 font-medium ${
                    activeTab === "instructions"
                      ? "text-gray-900 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  Instructions
                </button>
                <button
                  onClick={() => setActiveTab("submission")}
                  className={`px-6 py-4 font-medium ${
                    activeTab === "submission"
                      ? "text-gray-900 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  Submission
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === "instructions" && (
                  <div>
                    {/* Instructions Header */}
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-red-600">Instructions:</h2>
                      {isOsas && !isEditingInstructions && (
                        <button
                          onClick={() => setIsEditingInstructions(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                          Edit Instructions
                        </button>
                      )}
                      {isOsas && isEditingInstructions && (
                        <button
                          onClick={() => setIsEditingInstructions(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Done Editing
                        </button>
                      )}
                    </div>

                    {/* Instructions Text */}
                    <p className="text-gray-900 leading-relaxed mb-8">
                      Answer the form
                    </p>

                    {/* Evaluation Form */}
                    {isEditingInstructions && isOsas ? (
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
                      <MemberEvaluationView questions={questions} />
                    )}
                  </div>
                )}

                {activeTab === "submission" && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Submission content will be added here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            {/* Submission Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Submission Information</h3>
              <div className="flex justify-between">
                <span className="text-gray-600">Due by:</span>
                <span className="text-gray-900">March 31, 2025</span>
              </div>
            </div>

            {/* Grade */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Grade</h3>
                <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  <PencilSquareIcon className="w-4 h-4" />
                  Edit
                </button>
              </div>
              <div className="flex justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#3b82f6"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(5/20) * 351.86} 351.86`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">10/20</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Adviser's Feedback */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Adviser's Feedback</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-gray-900">Approved!</span>
              </label>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-900 mb-4">Comments</h3>
              <textarea
                placeholder="Add a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 text-gray-900 placeholder-gray-400"
                rows={3}
              />
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-3">
                Add Comment
              </button>
              
              {/* Comment Box with Delete Icon */}
              <div className="relative border border-gray-300 rounded-lg p-3 bg-gray-50">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}