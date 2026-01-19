'use client';

import { useState, useEffect, use } from 'react';
import { requirements, orgRequirementStatuses } from '@/app/lib/definitions';
import { 
  getAssessmentByOrgAndReq,
  Comment,
  saveCommentsToLocalStorage,
  loadCommentsFromLocalStorage,
  formatTimestamp,
  formatName
} from '@/app/lib/assessments';
import { supabase } from '@/app/lib/database';

export default function RequirementPage({ params }: { params: Promise<{ orgname: string; reqid: string }> }) {
  const { orgname, reqid } = use(params);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'instructions' | 'grading'>('instructions');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [membershipAnswer, setMembershipAnswer] = useState('');
  const [evaluationAnswer, setEvaluationAnswer] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [score, setScore] = useState<number>(0);
  const [submittedScore, setSubmittedScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requirement = requirements.find(r => r.id === reqid);
  const requirementName = requirement?.title || reqid;
  const formattedDueDate = dueDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || 'TBD';

  // Load grade from Supabase
  const loadGradeFromSupabase = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('org_requirement_status')
        .select('grade, score')
        .eq('orgUsername', orgname)
        .eq('requirementId', reqid)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching grade:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (data) {
        // Use the score column as the maximum grade possible
        const maxGrade = data.score || 100;
        setMaxScore(maxGrade);
        
        // Load the actual grade value
        const gradeValue = data.grade || 0;
        setScore(gradeValue);
        setSubmittedScore(gradeValue);
      }
    } catch (err) {
      console.error('Error loading grade:', err);
      setError('Failed to load grade data');
    } finally {
      setIsLoading(false);
    }
  };

  // Save grade to Supabase
  const saveGradeToSupabase = async (newScore: number) => {
    try {
      setError(null);

      // Check if record exists
      const { data: existing } = await supabase
        .from('org_requirement_status')
        .select('id')
        .eq('orgUsername', orgname)
        .eq('requirementId', reqid)
        .maybeSingle();

      if (existing) {
        // Update existing record - ONLY update grade column, NOT score
        const { error: updateError } = await supabase
          .from('org_requirement_status')
          .update({
            grade: newScore,
            graded: true
          })
          .eq('id', existing.id);

        if (updateError) {
          console.error('Error updating grade:', updateError);
          setError(updateError.message);
          return false;
        }
      } else {
        // Insert new record - set grade to newScore, score to maxScore
        const { error: insertError } = await supabase
          .from('org_requirement_status')
          .insert({
            orgUsername: orgname,
            requirementId: reqid,
            submitted: hasSubmitted,
            graded: true,
            grade: newScore,
            score: maxScore, // Set the maximum score when creating new record
            start: new Date().toISOString().split('T')[0],
            due: dueDate ? dueDate.toISOString().split('T')[0] : null
          });

        if (insertError) {
          console.error('Error creating grade:', insertError);
          setError(insertError.message);
          return false;
        }
      }

      setSubmittedScore(newScore);
      return true;
    } catch (err) {
      console.error('Error saving grade:', err);
      setError('Failed to save grade');
      return false;
    }
  };

  useEffect(() => {
    const assessment = getAssessmentByOrgAndReq(orgname, reqid);
    if (assessment) {
      setMembershipAnswer(assessment.answers['membership'] || '');
      setEvaluationAnswer(assessment.answers['evaluation_ld_q1'] || '');
    }

    const reqStatus = orgRequirementStatuses.find(
      (status) => status.orgUsername === orgname && status.requirementId === reqid
    );
    if (reqStatus) {
      setDueDate(reqStatus.due);
      setHasSubmitted(reqStatus.submitted);
      setAttemptCount(reqStatus.submitted ? 1 : 0);
    }

    // Load grade from Supabase
    loadGradeFromSupabase();

    // Load saved instructions
    const instructionsKey = `instructions_${orgname}_${reqid}`;
    const savedInstructions = localStorage.getItem(instructionsKey);
    if (savedInstructions) {
      setInstructions(savedInstructions);
    } else {
      setInstructions(`Accomplish evaluation by ${formattedDueDate}.`);
    }

    setComments(loadCommentsFromLocalStorage(orgname, reqid));
  }, [orgname, reqid, formattedDueDate]);

  useEffect(() => {
    if (orgname && reqid) saveCommentsToLocalStorage(orgname, reqid, comments);
  }, [comments, orgname, reqid]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, {
      id: `comment${Date.now()}`,
      text: newComment,
      timestamp: new Date(),
      author: 'OSAS'
    }]);
    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  };

  const handleSubmitGrade = async () => {
    const success = await saveGradeToSupabase(score);
    if (success) {
      setIsEditingGrade(false);
    }
  };

  const handleSaveInstructions = () => {
    const instructionsKey = `instructions_${orgname}_${reqid}`;
    localStorage.setItem(instructionsKey, instructions);
    setIsEditingInstructions(false);
  };

  const handleCancelEditInstructions = () => {
    const instructionsKey = `instructions_${orgname}_${reqid}`;
    const savedInstructions = localStorage.getItem(instructionsKey);
    if (savedInstructions) {
      setInstructions(savedInstructions);
    } else {
      setInstructions(`Accomplish evaluation by ${formattedDueDate}.`);
    }
    setIsEditingInstructions(false);
  };

  const AnswersDisplay = () => (
    <>
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase">Type of Membership</h4>
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <p className="text-gray-900">{membershipAnswer || 'No answer provided'}</p>
        </div>
      </div>
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase">Evaluation - Leadership Development (LD)</h4>
        <p className="text-gray-700 text-sm mb-3">
          1. The organization's structure, system and processes allows for and encourage 
          transfer of knowledge skills and attitude from present leaders to the next set of leaders.
        </p>
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <p className="text-gray-900">{evaluationAnswer || 'No answer provided'}</p>
        </div>
      </div>
    </>
  );

  const TabButton = ({ tab, label }: { tab: 'instructions' | 'grading'; label: string }) => (
    <button 
      onClick={() => !isEditingInstructions && !isEditingGrade && setActiveTab(tab)} 
      disabled={isEditingInstructions || isEditingGrade}
      className={`px-6 py-4 font-medium ${
        isEditingInstructions || isEditingGrade 
          ? 'cursor-not-allowed opacity-50' 
          : 'cursor-pointer'
      } ${
        activeTab === tab 
          ? 'text-gray-900 border-b-2 border-blue-600' 
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      {/* Overlay when editing */}
      {(isEditingInstructions || isEditingGrade) && (
        <div className="fixed inset-0 bg-opacity-50 z-40" />
      )}
      
      {/* Error message */}
      {error && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <span className="text-red-700">×</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-50">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-900 rounded-full" />
          <h1 className="text-3xl font-bold text-gray-900">
            {formatName(orgname)} - {requirementName}
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b-2 border-gray-300 flex">
                <TabButton tab="instructions" label="Instructions" />
                {hasSubmitted && <TabButton tab="grading" label="Grading" />}
              </div>
              <div className="p-12 min-h-[500px]">
                {activeTab === 'instructions' && (
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-red-600 font-bold text-2xl">Instructions:</h2>
                      {!isEditingInstructions ? (
                        <button
                          onClick={() => setIsEditingInstructions(true)}
                          disabled={isEditingGrade}
                          className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${
                            isEditingGrade ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                          Edit Instructions
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveInstructions}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEditInstructions}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditingInstructions ? (
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-xl font-medium min-h-[200px]"
                        placeholder="Enter instructions here..."
                      />
                    ) : (
                      <p className="text-gray-900 mb-10 leading-relaxed text-xl max-w-4xl font-medium">
                        {instructions}
                      </p>
                    )}
                  </div>
                )}
                {activeTab === 'grading' && hasSubmitted && (
                  <div>
                    <h2 className="text-gray-900 font-bold mb-8 text-2xl">Grading</h2>
                    <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Answers</h3>
                      <AnswersDisplay />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Submission Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Due by:</span>
                  <span className="text-gray-900 font-medium">{formattedDueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attempts:</span>
                  <span className="text-gray-900 font-medium">{attemptCount}</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Grade</h3>
                {!isEditingGrade ? (
                  <button
                    onClick={() => setIsEditingGrade(true)}
                    disabled={isEditingInstructions || isLoading}
                    className={`flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors ${
                      isEditingInstructions || isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setScore(submittedScore);
                      setIsEditingGrade(false);
                    }}
                    className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : isEditingGrade ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Score (out of {maxScore})
                    </label>
                    <input 
                      type="text" 
                      value={score === 0 ? '' : score}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        
                        // Only allow empty string or valid numbers
                        if (inputValue === '') {
                          setScore(0);
                          return;
                        }
                        
                        // Check if input contains only digits
                        if (!/^\d+$/.test(inputValue)) {
                          return; // Reject non-numeric input
                        }
                        
                        const numValue = parseInt(inputValue, 10);
                        
                        // Only update if within valid range
                        if (numValue >= 0 && numValue <= maxScore) {
                          setScore(numValue);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent non-numeric keys except backspace, delete, arrow keys, tab
                        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                        if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder={maxScore.toString()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <button 
                    onClick={handleSubmitGrade}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
                  >
                    Submit Grade
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle 
                        cx="64" cy="64" r="56" 
                        stroke={submittedScore > 0 ? "#3b82f6" : "#d1d5db"}
                        strokeWidth="12" fill="none" 
                        strokeDasharray="351.858" 
                        strokeDashoffset={351.858 - (351.858 * submittedScore / maxScore)}
                        strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">{submittedScore}/{maxScore}</span>
                    </div>
                  </div>
                </div>
              )}
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
                  disabled={isEditingInstructions || isEditingGrade}
                  className={`w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none 
                           text-sm placeholder:text-gray-400 ${
                             isEditingInstructions || isEditingGrade ? 'opacity-50 cursor-not-allowed' : ''
                           }`} 
                  rows={3} 
                />
                <button 
                  type="button"
                  onClick={handleAddComment} 
                  disabled={isEditingInstructions || isEditingGrade}
                  className={`mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 
                           disabled:cursor-not-allowed text-white font-medium px-4 py-2 
                           rounded-lg transition-colors text-sm ${
                             isEditingInstructions || isEditingGrade ? '' : 'cursor-pointer'
                           }`}
                >
                  Add Comment
                </button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {comments.map(c => (
                  <div key={c.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs text-gray-500" key={currentTime}>{formatTimestamp(c.timestamp)}</span>
                        <span className="text-xs text-gray-400 ml-2">• {c.author}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleDeleteComment(c.id)} 
                        disabled={isEditingInstructions || isEditingGrade}
                        className={`text-gray-400 hover:text-red-600 transition-colors ${
                          isEditingInstructions || isEditingGrade ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
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
        </div>
      </div>
    </div>
  );
}