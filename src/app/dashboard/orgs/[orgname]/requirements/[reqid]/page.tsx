'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/database';
import {
  getAssessmentByOrgAndReq,
  Comment,
  saveCommentsToLocalStorage,
  loadCommentsFromLocalStorage,
  formatTimestamp,
  formatName
} from '@/app/lib/assessments';

/* =========================
   COMPONENTS
========================= */
const QuestionHeader = ({ title, icon }: { title: string; icon?: boolean }) => (
  <div
    className={`bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-lg p-4 mb-4 ${
      icon ? 'border-2 border-yellow-400 flex items-center gap-3' : ''
    }`}
  >
    {icon && (
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>
    )}
    <h3 className={`text-gray-900 font-bold ${icon ? 'text-lg' : 'text-base'} uppercase`}>
      {title}
    </h3>
  </div>
);

/* =========================
   PAGE
========================= */
export default function RequirementPage({
  params,
}: {
  params: { orgname: string; reqid: string };
}) {
  const { orgname, reqid } = params;

  const [requirementName, setRequirementName] = useState(reqid);
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'instructions' | 'grading'>('instructions');

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [membershipAnswer, setMembershipAnswer] = useState('');
  const [evaluationAnswer, setEvaluationAnswer] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  const [score, setScore] = useState(0);
  const [submittedScore, setSubmittedScore] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  /* =========================
     LOAD DATA
  ========================= */
  useEffect(() => {
    async function load() {
      // requirement title
      const { data: req } = await supabase
        .from('requirements')
        .select('title')
        .eq('id', reqid)
        .maybeSingle();

      if (req?.title) setRequirementName(req.title);

      // due date
      const { data: status } = await supabase
        .from('org_requirement_status')
        .select('due')
        .eq('org_username', orgname)
        .eq('requirement_id', reqid)
        .maybeSingle();

      if (status?.due) setDueDate(new Date(status.due));

      // assessment (local)
      const assessment = getAssessmentByOrgAndReq(orgname, reqid);
      if (assessment) {
        setHasSubmitted(Boolean(assessment.submittedAt));
        setAttemptCount(assessment.submittedAt ? 1 : 0);
        setMembershipAnswer(assessment.answers['membership'] || '');
        setEvaluationAnswer(assessment.answers['evaluation_ld_q1'] || '');
      }

      // grade (local)
      const saved = localStorage.getItem(`grade_${orgname}_${reqid}`);
      if (saved) {
        const g = JSON.parse(saved);
        setScore(g.score || 0);
        setSubmittedScore(g.score || 0);
      }

      setComments(loadCommentsFromLocalStorage(orgname, reqid));
    }

    load();
  }, [orgname, reqid]);

  useEffect(() => {
    saveCommentsToLocalStorage(orgname, reqid, comments);
  }, [comments, orgname, reqid]);

  useEffect(() => {
    const i = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(i);
  }, []);

  /* =========================
     ACTIONS
  ========================= */
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        text: newComment,
        timestamp: new Date(),
        author: 'OSAS',
      },
    ]);
    setNewComment('');
  };

  const handleDeleteComment = (id: string) =>
    setComments(prev => prev.filter(c => c.id !== id));

  const handleSubmitGrade = () => {
    localStorage.setItem(
      `grade_${orgname}_${reqid}`,
      JSON.stringify({
        score,
        gradedAt: new Date().toISOString(),
      })
    );
    setSubmittedScore(score);
  };

  const formattedDueDate =
    dueDate?.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) ?? 'TBD';

  /* =========================
     UI
  ========================= */
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {formatName(orgname)} – {requirementName}
        </h1>

        {/* Tabs */}
        <div className="border-b flex mb-8">
          <button onClick={() => setActiveTab('instructions')} className="px-6 py-4">
            Instructions
          </button>
          {hasSubmitted && (
            <button onClick={() => setActiveTab('grading')} className="px-6 py-4">
              Grading
            </button>
          )}
        </div>

        {activeTab === 'instructions' && (
          <p className="text-xl">
            Accomplish evaluation by <strong>{formattedDueDate}</strong>.
          </p>
        )}

        {activeTab === 'grading' && hasSubmitted && (
          <>
            <QuestionHeader title="TYPE OF MEMBERSHIP" icon />
            <p>{membershipAnswer || 'No answer provided'}</p>

            <QuestionHeader title="EVALUATION – LD" />
            <p>{evaluationAnswer || 'No answer provided'}</p>

            <div className="mt-6">
              <input
              title="submit"
                type="number"
                min={1}
                max={100}
                value={score}
                onChange={e => setScore(+e.target.value || 0)}
                className="border px-3 py-2"
              />
              <button
                onClick={handleSubmitGrade}
                className="ml-3 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Submit Grade
              </button>
            </div>
          </>
        )}

        {/* Comments */}
        <div className="mt-12">
          <h3 className="font-bold mb-3">Comments</h3>
          <textarea
          title="newcomment"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            className="w-full border p-2"
          />
          <button onClick={handleAddComment} className="mt-2 bg-blue-600 text-white px-4 py-2">
            Add Comment
          </button>

          <div className="mt-4 space-y-3">
            {comments.map(c => (
              <div key={c.id} className="border p-3 bg-white">
                <div className="text-xs text-gray-500" key={currentTime}>
                  {formatTimestamp(c.timestamp)} • {c.author}
                </div>
                <p>{c.text}</p>
                <button
                  onClick={() => handleDeleteComment(c.id)}
                  className="text-red-500 text-xs"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center text-3xl font-bold">
          {submittedScore}%
        </div>
      </div>
    </div>
  );
}
