'use client';

import { useState, useEffect, use } from 'react';
import { Comment, saveCommentsToLocalStorage, formatTimestamp, formatName } from '@/app/lib/assessments';
import { supabase } from '@/app/lib/database';
import { useSession } from "next-auth/react";
import { UserCircleIcon, ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, ArrowDownTrayIcon, TrashIcon, ArrowUpTrayIcon, PencilSquareIcon, DocumentIcon, } from '@heroicons/react/24/outline';

const QuestionHeader = ({ title, icon }: { title: string; icon?: boolean }) => (
  <div className={`bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-lg p-4 mb-4 ${
    icon ? 'border-2 border-yellow-400 flex items-center gap-3' : ''
  }`}>
    {icon && (
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <UserCircleIcon className="w-5 h-5 text-white" />
      </div>
    )}
    <h3 className={`text-gray-900 font-bold ${icon ? 'text-lg' : 'text-base'} uppercase`}>{title}</h3>
  </div>
);

const IconButton = ({ onClick, disabled, className, children, title }: any) => (
  <button onClick={onClick} disabled={disabled} title={title}
    className={`p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}>
    {children}
  </button>
);

export default function RequirementPage({ params }: { params: Promise<{ orgname: string; reqid: string }> }) {
  const { orgname, reqid } = use(params);
  const { data: session, status } = useSession();

  // State consolidation
  const [state, setState] = useState({
    comments: [] as Comment[],
    newComment: '',
    activeTab: 'instructions' as 'instructions' | 'grading',
    hasSubmitted: false,
    membershipAnswer: '',
    evaluationAnswer: '',
    score: 0,
    submittedScore: 0,
    maxScore: 100,
    dueDate: null as Date | null,
    currentTime: Date.now(),
    isEditingInstructions: false,
    isEditingGrade: false,
    instructions: '',
    error: null as string | null,
    uploadedPdf: null as string | null,
    pdfFileName: '',
    currentPage: 1,
    totalPages: 1,
    pdfZoom: 1.0,
    userRole: null as 'osas' | 'member' | null,
    currentUserEmail: null as string | null,

    
    loading: {
      page: true,
      requirement: false,
      grade: false,
      pdf: false,
    },
    
    submissiontype: null as 'freeform' | 'pdf' | null,

    requirement: null as ({
      id: string;
      title: string;
      section: string;
      active: boolean;
    } | null),
  });

  const requirementName = state.requirement?.title || reqid;

  const formattedDueDate = state.dueDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || 'TBD';

  const isOSAS = state.userRole === 'osas';
  const isMember = state.userRole === 'member';
  const isEditing = state.isEditingInstructions || state.isEditingGrade;

  // Helper functions
  const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }));
  const setError = (error: string | null) => updateState({ error });
  
  const checkPermission = (role: 'osas' | 'member', action: string) => {
    if (state.userRole !== role) {
      setError(`Only ${role} users can ${action}`);
      return false;
    }
    return true;
  };

  const setLoading = (
  key: keyof typeof state.loading,
  value: boolean
) => {
  setState(prev => ({
    ...prev,
    loading: {
      ...prev.loading,
      [key]: value,
    },
  }));
};


  

const loadRequirementFromSupabase = async () => {
  try {
    setError(null);
    setLoading('requirement', true);

    const { data, error } = await supabase
      .from('requirements')
      .select('id, title, section, active, instructions, submissiontype')
      .eq('id', reqid)
      .eq('active', true)
      .single();

    if (error) throw error;

    updateState({
      requirement: data,
      instructions: data.instructions || '',
      submissiontype: data.submissiontype as 'freeform' | 'pdf'
    });
  } catch (err: any) {
    console.error(err);
    setError('Failed to load requirement');
  } finally {
    setLoading('requirement', false);
  }
};

  // Load grade from Supabase
  const loadGradeFromSupabase = async () => {
    try {
      setError(null);
      setLoading('grade', true);
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
        updateState({
          maxScore: data.score || 100,
          score: data.grade || 0,
          submittedScore: data.grade || 0
        });
      }
    } catch (err) {
      console.error('Error loading grade:', err);
      setError('Failed to load grade data');
    } finally {
      setLoading('grade', false);
    }
  };

  // Save grade to Supabase
  const saveGradeToSupabase = async (newScore: number) => {
    if (!checkPermission('osas', 'grade submissions')) return false;

    try {
      setError(null);
      const { data: existing } = await supabase
        .from('org_requirement_status')
        .select('id')
        .eq('orgUsername', orgname)
        .eq('requirementId', reqid)
        .maybeSingle();

      const payload = { grade: newScore, graded: true };
      const { error: dbError } = existing
        ? await supabase.from('org_requirement_status').update(payload).eq('id', existing.id)
        : await supabase.from('org_requirement_status').insert({
            ...payload,
            orgUsername: orgname,
            requirementId: reqid,
            submitted: state.hasSubmitted,
            score: state.maxScore,
            start: new Date().toISOString().split('T')[0],
            due: state.dueDate ? state.dueDate.toISOString().split('T')[0] : null
          });

      if (dbError) {
        console.error('Error saving grade:', dbError);
        setError(dbError.message);
        return false;
      }

      updateState({ submittedScore: newScore });
      return true;
    } catch (err) {
      console.error('Error saving grade:', err);
      setError('Failed to save grade');
      return false;
    }
  };

  //Display due date
  const loadDueDateFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('org_requirement_status')
        .select('due')
        .eq('orgUsername', orgname)
        .eq('requirementId', reqid)
        .maybeSingle();

      if (error) throw error;

      updateState({
        dueDate: data?.due ? new Date(data.due) : null
      });
    } catch {
      console.warn('No due date found yet');
      updateState({ dueDate: null });
    }
  };

  // Handle PDF upload
  const handlePdfUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!checkPermission('member', 'upload PDFs')) return;

    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    try {
      setError(null);
      setLoading('pdf', true);


      const filePath = `${orgname}/${reqid}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('requirement-pdfs')
        .upload(filePath, file, {
          upsert: true,
          contentType: 'application/pdf',
        });

      if (uploadError) throw uploadError;

      // Mark submission as submitted
      await supabase
        .from('org_requirement_status')
        .update({
          submitted: true,
        })
        .eq('orgUsername', orgname)
        .eq('requirementId', reqid);

      // Create signed URL for preview
      const { data } = await supabase.storage
        .from('requirement-pdfs')
        .createSignedUrl(filePath, 60 * 60);

      updateState({
        uploadedPdf: data?.signedUrl ?? null,
        pdfFileName: file.name,
        hasSubmitted: true,
      });
    } catch (err: any) {
      console.error(err);
      setError('Failed to upload PDF');
    } finally {
      setLoading('pdf', false);
    }
  };

  const loadPdfFromSupabase = async () => {
  try {
    const filePath = `${orgname}/${reqid}.pdf`;

    const { data, error } = await supabase.storage
      .from('requirement-pdfs')
      .createSignedUrl(filePath, 60 * 60);

    if (error) return; // PDF may not exist yet

    updateState({
      uploadedPdf: data.signedUrl,
      pdfFileName: `${reqid}.pdf`,
    });
  } catch (err) {
    console.warn('No PDF uploaded yet');
  }
};



  // Remove PDF
  const handleRemovePdf = async () => {
    if (!checkPermission('member', 'remove PDFs')) return;

    const filePath = `${orgname}/${reqid}.pdf`;

    await supabase.storage
      .from('requirement-pdfs')
      .remove([filePath]);

    await supabase
      .from('org_requirement_status')
      .update({ submitted: false })
      .eq('orgUsername', orgname)
      .eq('requirementId', reqid);

    updateState({
      uploadedPdf: null,
      pdfFileName: '',
      currentPage: 1,
      hasSubmitted: false,
    });
  };


  // Session effect
  useEffect(() => {
    if (status === 'loading') {
      setLoading('page', true);
      return;
    }

    if (status === 'unauthenticated') {
      setError('User not authenticated');
      setLoading('page', false);
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const email = session.user.email || '';
      const rawRole = ((session.user as any)?.role || '')
        .toString()
        .trim()
        .toLowerCase();

      updateState({ currentUserEmail: email });

      if (rawRole === 'osas' || rawRole === 'member') {
        updateState({ userRole: rawRole as 'osas' | 'member' });

        // kick off initial data loads
        loadRequirementFromSupabase();
        loadGradeFromSupabase();
        loadDueDateFromSupabase();
      } else {
        setError(`Invalid role: "${rawRole}"`);
      }

      // page is now ready to render
      setLoading('page', false);
    }
  }, [status, session]);


  // Initial data load
  useEffect(() => {
    const loadSubmissionStatus = async () => {
      const { data, error } = await supabase
        .from('org_requirement_status')
        .select('submitted')
        .eq('orgUsername', orgname)
        .eq('requirementId', reqid)
        .maybeSingle();

      if (error) {
        console.error('Failed to load submission status:', error);
        return;
      }

      updateState({
        hasSubmitted: data?.submitted ?? false
      });
    };

    loadSubmissionStatus();
  }, [orgname, reqid]);


  // Save comments
  useEffect(() => {
    if (orgname && reqid) saveCommentsToLocalStorage(orgname, reqid, state.comments);
  }, [state.comments, orgname, reqid]);

  // Time update
  useEffect(() => {
    const interval = setInterval(() => updateState({ currentTime: Date.now() }), 60000);
    return () => clearInterval(interval);
  }, []);

  // Event handlers
  const handleAddComment = () => {
    if (!state.newComment.trim()) return;
    const authorName = isOSAS ? 'OSAS' : 'Member';
    updateState({
      comments: [...state.comments, {
        id: `comment${Date.now()}`,
        text: state.newComment,
        timestamp: new Date(),
        author: authorName
      }],
      newComment: ''
    });
  };

  const handleDeleteComment = (commentId: string) => {
    const comment = state.comments.find(c => c.id === commentId);
    const currentUserType = isOSAS ? 'OSAS' : 'Member';
    
    if (comment?.author !== currentUserType) {
      setError('You can only delete your own comments');
      return;
    }
    
    updateState({ comments: state.comments.filter(c => c.id !== commentId) });
  };

  const handleSubmitGrade = async () => {
    if (!checkPermission('osas', 'submit grades')) return;
    const success = await saveGradeToSupabase(state.score);
    if (success) updateState({ isEditingGrade: false });
  };

  const handleSaveInstructions = async () => {
  if (!checkPermission('osas', 'edit instructions')) return;

  try {
    setError(null);

    const { error } = await supabase
      .from('requirements')
      .update({ instructions: state.instructions })
      .eq('id', reqid);

    if (error) throw error;

    updateState({ isEditingInstructions: false });
  } catch (err: any) {
    console.error(err);
    setError('Failed to save instructions');
  }
};


  const handleCancelEditInstructions = async () => {
  await loadRequirementFromSupabase();
  updateState({ isEditingInstructions: false });
};


  const handleSubmissionTypeChange = async (type: 'freeform' | 'pdf') => {
  if (!checkPermission('osas', 'change submission type')) return;

  try {
    const { error } = await supabase
      .from('requirements')
      .update({ submissiontype: type })
      .eq('id', reqid);

    if (error) throw error;

    updateState({ submissiontype: type });
  } catch (err) {
    console.error(err);
    setError('Failed to update submission type');
  }
};


  // Components
  const AnswersDisplay = () => (
    <>
      <div className="mb-8">
        <QuestionHeader title="TYPE OF MEMBERSHIP" icon />
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <p className="text-gray-900 font-medium">{state.membershipAnswer || 'No answer provided'}</p>
        </div>
      </div>
      <div className="mb-8">
        <QuestionHeader title="EVALUATION - Leadership Development (LD)" />
        <p className="text-gray-900 mb-4">
          1. The organization's structure, system and processes allows for and encourage 
          transfer of knowledge skills and attitude from present leaders to the next set of leaders.
        </p>
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <p className="text-gray-900 font-medium">{state.evaluationAnswer || 'No answer provided'}</p>
        </div>
      </div>
    </>
  );

  const PDFViewer = () => {
    if (!state.uploadedPdf) {
      return (
        <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No PDF uploaded</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-4">
            <IconButton onClick={() => updateState({ currentPage: Math.max(1, state.currentPage - 1) })} disabled={state.currentPage === 1}>
              <ChevronLeftIcon className="w-5 h-5 text-white" />
            </IconButton>
            
            <div className="flex items-center gap-2">
              <input type="number" value={state.currentPage}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 1 && val <= state.totalPages) updateState({ currentPage: val });
                }}
                className="w-16 px-2 py-1 bg-gray-700 text-white text-center rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-white text-sm">of {state.totalPages}</span>
            </div>

            <IconButton onClick={() => updateState({ currentPage: Math.min(state.totalPages, state.currentPage + 1) })} disabled={state.currentPage === state.totalPages}>
              <ChevronRightIcon className="w-5 h-5 text-white" />
            </IconButton>
          </div>

          <div className="flex items-center gap-2">
            <IconButton onClick={() => updateState({ pdfZoom: Math.max(0.5, state.pdfZoom - 0.1) })}>
              <MagnifyingGlassMinusIcon className="w-5 h-5 text-white" />
            </IconButton>
            <span className="text-white text-sm min-w-[60px] text-center">{Math.round(state.pdfZoom * 100)}%</span>
            <IconButton onClick={() => updateState({ pdfZoom: Math.min(2, state.pdfZoom + 0.1) })}>
              <MagnifyingGlassPlusIcon className="w-5 h-5 text-white" />
            </IconButton>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white text-sm mr-2">{state.pdfFileName}</span>
            <a href={state.uploadedPdf} download={state.pdfFileName} className="p-2 hover:bg-gray-700 rounded transition-colors" title="Download PDF">
              <ArrowDownTrayIcon className="w-5 h-5 text-white" />
            </a>
          </div>
        </div>

        <div className="overflow-auto max-h-[700px] bg-gray-700 flex justify-center p-4">
          <iframe src={`${state.uploadedPdf}#page=${state.currentPage}&zoom=${state.pdfZoom * 100}`}
            className="w-full min-h-[600px] bg-white rounded" title="PDF Viewer" />
        </div>
      </div>
    );
  };

  if (state.loading.page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      {isEditing && <div className="fixed inset-0 bg-opacity-50 z-40" />}
      
      {state.error && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{state.error}</span>
            <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>×</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-50">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-900 rounded-full" />
          <h1 className="text-3xl font-bold text-gray-900">{formatName(orgname)} - {requirementName}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b-2 border-gray-300 flex">
                {(['instructions', 'grading'] as const).map(tab => (
                  (tab === 'grading' && !state.hasSubmitted) ? null : (
                    <button key={tab} onClick={() => !isEditing && updateState({ activeTab: tab })} disabled={isEditing}
                      className={`px-6 py-4 font-medium ${isEditing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${
                        state.activeTab === tab ? 'text-gray-900 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  )
                ))}
              </div>

              <div className="p-12 min-h-[500px]">
                {state.activeTab === 'instructions' && (
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-red-600 font-bold text-2xl">Instructions:</h2>
                      <div className="flex items-center gap-2">
                        {isMember && state.submissiontype === 'pdf' && !state.isEditingInstructions && (
                          <>
                            {state.uploadedPdf && (
                              <button onClick={handleRemovePdf}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer">
                                <TrashIcon className="w-5 h-5" />
                                Remove PDF
                              </button>
                            )}
                            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer">
                              <ArrowUpTrayIcon className="w-5 h-5" />
                              {state.uploadedPdf ? 'Replace PDF' : 'Upload PDF'}
                              <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
                            </label>
                          </>
                        )}
                        
                        {isOSAS && !state.isEditingInstructions ? (
                          <button onClick={() => updateState({ isEditingInstructions: true })} disabled={state.isEditingGrade}
                            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${
                              state.isEditingGrade ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                            }`}>
                            <PencilSquareIcon className="w-5 h-5" />
                            Edit Instructions
                          </button>
                        ) : isOSAS && state.isEditingInstructions ? (
                          <div className="flex gap-2">
                            <button onClick={handleSaveInstructions} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors cursor-pointer">Save</button>
                            <button onClick={handleCancelEditInstructions} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors cursor-pointer">Cancel</button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {state.isEditingInstructions && isOSAS ? (
                      <>
                        <textarea value={state.instructions} onChange={(e) => updateState({ instructions: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-xl font-medium min-h-[200px]"
                          placeholder="Enter instructions here..." />
                        
                        <div className="mt-8 pt-8 border-t border-gray-200">
                          <h3 className="text-gray-900 font-bold text-lg mb-4">Submission Type:</h3>
                          <div className="flex gap-6">
                            {(['freeform', 'pdf'] as const).map(type => (
                              <label key={type} className="flex items-center gap-3 cursor-pointer">
                                <input type="radio" name="submissiontype" value={type} checked={state.submissiontype === type}
                                  onChange={() => handleSubmissionTypeChange(type)}
                                  className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer" />
                                <span className="text-gray-900 font-medium text-lg">{type === 'freeform' ? 'Freeform Answer' : 'PDF Submission'}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-900 mb-10 leading-relaxed text-xl max-w-4xl font-medium">{state.instructions}</p>
                    )}
                  </div>
                )}

                {state.activeTab === 'grading' && state.hasSubmitted && (
                  <div>
                    <h2 className="text-gray-900 font-bold mb-8 text-2xl">Grading</h2>
                    
                    {state.submissiontype === 'pdf' && state.uploadedPdf ? (
                      <PDFViewer />
                    ) : state.submissiontype === 'pdf' && !state.uploadedPdf ? (
                      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <DocumentIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500 text-lg">No PDF submission uploaded yet</p>
                          {isOSAS && <p className="text-gray-400 text-sm mt-2">Student needs to upload PDF in the Instructions tab</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-8 bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submitted Answers</h3>
                        <AnswersDisplay />
                      </div>
                    )}
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
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Grade</h3>
                {isOSAS && !state.isEditingGrade ? (
                  <button onClick={() => updateState({ isEditingGrade: true })} disabled={state.isEditingInstructions || state.loading.grade}
                    className={`flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors ${
                      state.isEditingInstructions || state.loading.requirement ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}>
                    <PencilSquareIcon className="w-5 h-5" />
                    Edit
                  </button>
                ) : isOSAS && state.isEditingGrade ? (
                  <button onClick={() => updateState({ score: state.submittedScore, isEditingGrade: false })}
                    className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                    Cancel
                  </button>
                ) : null}
              </div>
              
              {state.loading.grade ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : state.isEditingGrade && isOSAS ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Score (out of {state.maxScore})</label>
                    <input type="text" value={state.score}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') { updateState({ score: 0 }); return; }
                        if (!/^\d+$/.test(val)) return;
                        const num = parseInt(val, 10);
                        if (num >= 0 && num <= state.maxScore) updateState({ score: num });
                      }}
                      onKeyDown={(e) => {
                        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
                        if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
                      }}
                      placeholder={state.maxScore.toString()}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                  </div>
                  <button onClick={handleSubmitGrade}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer">
                    Submit Grade
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle cx="64" cy="64" r="56" stroke={state.submittedScore > 0 ? "#3b82f6" : "#d1d5db"}
                        strokeWidth="12" fill="none" strokeDasharray="351.858" 
                        strokeDashoffset={351.858 - (351.858 * state.submittedScore / state.maxScore)}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-900">{state.submittedScore}/{state.maxScore}</span>
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
                <textarea value={state.newComment} onChange={(e) => updateState({ newComment: e.target.value })}
                  placeholder="Add a comment..." disabled={isEditing}
                  className={`w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm placeholder:text-gray-400 ${
                    isEditing ? 'opacity-50 cursor-not-allowed' : ''
                  }`} rows={3} />
                <button onClick={handleAddComment} disabled={isEditing}
                  className={`mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm ${
                    isEditing ? '' : 'cursor-pointer'
                  }`}>
                  Add Comment
                </button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {state.comments.map(c => (
                  <div key={c.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs text-gray-500" key={state.currentTime}>{formatTimestamp(c.timestamp)}</span>
                        <span className="text-xs text-gray-400 ml-2">• {c.author}</span>
                      </div>
                      <button onClick={() => handleDeleteComment(c.id)} disabled={isEditing}
                        className={`text-gray-400 hover:text-red-600 transition-colors ${
                          isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}>
                        <TrashIcon className="w-5 h-5" />
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