'use client';

import { useState, useEffect, use } from 'react';

const RadioOption = ({ option, selected, onClick }: { option: string; selected: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
      selected ? 'bg-blue-50 border-blue-500' : 'bg-gray-200 border-gray-300 hover:border-gray-400'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
        selected ? 'border-blue-500' : 'border-gray-400'
      }`}>
        {selected && <div className="w-3 h-3 rounded-full bg-blue-500" />}
      </div>
      <span className="font-medium text-gray-900">{option}</span>
    </div>
  </button>
);

const QuestionHeader = ({ title, icon }: { title: string; icon?: boolean }) => (
  <div className={`bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-lg p-4 mb-4 ${
    icon ? 'border-2 border-yellow-400 flex items-center gap-3' : ''
  }`}>
    {icon && (
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>
    )}
    <h3 className={`text-gray-900 font-bold ${icon ? 'text-lg' : 'text-base'} uppercase`}>{title}</h3>
  </div>
);

export default function RequirementPage({ params }: { params: Promise<{ orgname: string; reqid: string }> }) {
  const { orgname, reqid } = use(params);
  const [comments, setComments] = useState<Array<{ id: string; text: string; timestamp: Date }>>([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'instructions' | 'submission'>('instructions');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showQuestionPage, setShowQuestionPage] = useState(false);
  const [membershipAnswer, setMembershipAnswer] = useState('');
  const [evaluationAnswer, setEvaluationAnswer] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  const formatName = (name: string) => 
    name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').toUpperCase();
  
  const formatTimestamp = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
    });
  };

  useEffect(() => {
    const interval = setInterval(() => setComments(prev => [...prev]), 60000);
    return () => clearInterval(interval);
  }, []);

  const Sidebar = () => (
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Submission Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Due by:</span>
            <span className="text-gray-900 font-medium">June 15, 2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Attempts:</span>
            <span className="text-gray-900 font-medium">{attemptCount}</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Grade</h3>
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
              <circle cx="64" cy="64" r="56" stroke="#d1d5db" strokeWidth="12" fill="none" 
                strokeDasharray="351.858" strokeDashoffset="351.858" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">0%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Adviser's Feedback</h3>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-gray-300 rounded" />
          <span className="font-semibold text-gray-900">Approved!</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Comments</h3>
        <div className="mb-4">
          <textarea 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)} 
            placeholder="Add a comment..." 
            className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none 
                     text-sm placeholder:text-gray-400" 
            rows={3} 
          />
          <button 
            onClick={() => { 
              if (newComment.trim()) { 
                setComments([...comments, { 
                  id: Date.now().toString(), text: newComment, timestamp: new Date() 
                }]); 
                setNewComment(''); 
              }
            }} 
            disabled={!newComment.trim()} 
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 
                     disabled:cursor-not-allowed text-white font-medium px-4 py-2 
                     rounded-lg transition-colors text-sm"
          >
            Add Comment
          </button>
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {comments.map(c => (
            <div key={c.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500">{formatTimestamp(c.timestamp)}</span>
                <button 
                  onClick={() => setComments(comments.filter(x => x.id !== c.id))} 
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                    strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" 
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" 
                    />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-700 break-words">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const QuestionSection = ({ isEditing }: { isEditing: boolean }) => (
    <>
      <div className="mb-8">
        <QuestionHeader title="TYPE OF MEMBERSHIP" icon />
        {isEditing ? (
          <div className="space-y-3">
            {['Organisation Officer', 'Organisation Member'].map(opt => (
              <RadioOption key={opt} option={opt} selected={membershipAnswer === opt} 
                onClick={() => setMembershipAnswer(opt)} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <p className="text-gray-900 font-medium">{membershipAnswer}</p>
          </div>
        )}
      </div>
      <div className="mb-8">
        <QuestionHeader title="EVALUATION - Leadership Development (LD)" />
        <p className="text-gray-900 mb-4">
          1. The organization's structure, system and processes allows for and encourage 
          transfer of knowledge skills and attitude from present leaders to the next set of leaders.
        </p>
        {isEditing ? (
          <div className="space-y-3">
            {['AA (Almost Always)', 'MT (Most of the Time)', 'S (Sometimes)', 'VR (Very Rarely)']
              .map(opt => (
                <RadioOption key={opt} option={opt} selected={evaluationAnswer === opt} 
                  onClick={() => setEvaluationAnswer(opt)} />
              ))
            }
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <p className="text-gray-900 font-medium">{evaluationAnswer}</p>
          </div>
        )}
      </div>
    </>
  );

  if (showQuestionPage) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-900 rounded-full" />
            <h1 className="text-3xl font-bold text-gray-900">
              {formatName(orgname)} - {formatName(reqid)}
            </h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-12 min-h-[500px]">
                <button 
                  onClick={() => { setShowQuestionPage(false); setActiveTab('instructions'); }} 
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mb-6"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                  </svg>
                  Back to Instructions
                </button>
                <h2 className="text-gray-900 font-bold mb-8 text-2xl">Your Submission</h2>
                <QuestionSection isEditing={true} />
                <button 
                  onClick={() => { 
                    if (membershipAnswer && evaluationAnswer) { 
                      setHasSubmitted(true); 
                      setAttemptCount(attemptCount + 1); 
                      setShowQuestionPage(false); 
                      setActiveTab('submission'); 
                    }
                  }} 
                  disabled={!membershipAnswer || !evaluationAnswer} 
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white 
                           font-semibold px-10 py-4 rounded transition-colors"
                >
                  Submit Answer
                </button>
              </div>
            </div>
            <Sidebar />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-900 rounded-full" />
          <h1 className="text-3xl font-bold text-gray-900">
            {formatName(orgname)} - {formatName(reqid)}
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b-2 border-gray-300 flex">
                <button 
                  onClick={() => setActiveTab('instructions')} 
                  className={`px-6 py-4 font-medium ${
                    activeTab === 'instructions' 
                      ? 'text-gray-900 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Instructions
                </button>
                {hasSubmitted && (
                  <button 
                    onClick={() => setActiveTab('submission')} 
                    className={`px-6 py-4 font-medium ${
                      activeTab === 'submission' 
                        ? 'text-gray-900 border-b-2 border-blue-600' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Submission
                  </button>
                )}
              </div>
              <div className="p-12 min-h-[500px]">
                {activeTab === 'instructions' && (
                  <div>
                    <h2 className="text-red-600 font-bold mb-8 text-2xl">Instructions:</h2>
                    <p className="text-gray-900 mb-10 leading-relaxed text-xl max-w-4xl font-medium">
                      Accomplish evaluation by <span className="font-bold">June 15, 2025</span>.
                    </p>
                    <button 
                      onClick={() => setShowQuestionPage(true)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                               px-10 py-4 rounded flex items-center gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                        strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" 
                          d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      {hasSubmitted ? 'Prepare another answer' : 'Prepare answer'}
                    </button>
                  </div>
                )}
                {activeTab === 'submission' && hasSubmitted && (
                  <div>
                    <h2 className="text-gray-900 font-bold mb-8 text-2xl">Your Submission</h2>
                    <QuestionSection isEditing={false} />
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                        strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" 
                          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span className="text-green-800 font-medium">Answer submitted successfully!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}