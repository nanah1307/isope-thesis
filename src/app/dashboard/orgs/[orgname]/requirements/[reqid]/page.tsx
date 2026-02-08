'use client';

import { useState, useEffect, use } from 'react';
import { formatName } from '@/app/lib/assessments';
import { supabase } from '@/app/lib/database';
import { useSession } from "next-auth/react";
import { InstructionsBlock } from '@/app/ui/snippets/submission/instruction';
import { SubmissionInfo } from '@/app/ui/snippets/submission/submission-info';
import { PDFViewer } from '@/app/ui/snippets/submission/pdf-viewer';
import { GradingTab } from '@/app/ui/snippets/submission/grading-tab';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';




export default function RequirementPage({ params }: { params: Promise<{ orgname: string; reqid: string }> }) {
  const { orgname, reqid } = use(params);
  const { data: session, status } = useSession();
  
  const router = useRouter();

  const goToDues = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/dashboard/orgs/${orgname}?tab=Requirements`);
  };

  // State consolidation
  const [state, setState] = useState({
    activeTab: 'instructions' as 'instructions' | 'submission',
    hasSubmitted: false,
    score: 0, //max score
    submittedScore: 0,
    maxScore: 100,
    dueDate: null as Date | null,
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
    freeformAnswer: '',

    
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
        .select('grade, score, freeformans')
        .eq('orgUsername', orgname)
        .eq('requirementId', reqid)
        .maybeSingle() as any;

      if (fetchError) {
        console.error('Error fetching grade:', fetchError);
        setError(fetchError.message);
        return;
      }

      if (data) {
        updateState({
          maxScore: data.score || 100,
          score: data.grade || 0,
          submittedScore: data.grade || 0,
          freeformAnswer: data.freeformans || '',
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

  const handleSubmitFreeform = async () => {
  if (!checkPermission('member', 'submit freeform answers')) return;

  try {
    setError(null);

    // Check if a submission already exists
    const { data: existing, error: fetchError } = await supabase
      .from('org_requirement_status')
      .select('id')
      .eq('orgUsername', orgname)
      .eq('requirementId', reqid)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      // Update existing submission
      const { error: updateError } = await supabase
        .from('org_requirement_status')
        .update({
          freeformans: state.freeformAnswer,
          submitted: true,
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
    } else {
      // Insert new submission
      const { error: insertError } = await supabase
        .from('org_requirement_status')
        .insert({
          orgUsername: orgname,
          requirementId: reqid,
          freeformans: state.freeformAnswer,
          submitted: true,
          graded: false,
          score: state.maxScore || 100,
          start: new Date().toISOString().split('T')[0],
          active: true,
        });

      if (insertError) throw insertError;
    }

    updateState({ hasSubmitted: true });
  } catch (err: any) {
    console.error(err);
    setError('Failed to submit freeform response');
  }
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
          <div className="w-12 h-12 flex items-center justify-center">
            <button onClick={goToDues} className="text-blue-900 hover:text-blue-700">
              <ArrowUturnLeftIcon className="w-6 h-6 cursor-pointer" />
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{formatName(orgname)} - {requirementName}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b-2 border-gray-300 flex">
                {(['instructions', 'submission'] as const).map(tab => (
                  (tab === 'submission' && !state.hasSubmitted) ? null : (
                    <button key={tab} onClick={() => !isEditing && updateState({ activeTab: tab as any })} disabled={isEditing}
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
                  <InstructionsBlock
                    state={state}
                    updateState={updateState}
                    handlePdfUpload={handlePdfUpload}
                    handleRemovePdf={handleRemovePdf}
                    handleSaveInstructions={handleSaveInstructions}
                    handleCancelEditInstructions={handleCancelEditInstructions}
                    handleSubmissionTypeChange={handleSubmissionTypeChange}
                  />
                )}

                {state.activeTab === 'submission' && state.hasSubmitted && (
                  <GradingTab
                    state={state}
                    updateState={updateState}
                    isOSAS={isOSAS}
                    handleSubmitFreeform={handleSubmitFreeform}
                  />
                )}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <SubmissionInfo
              state={state}
              updateState={updateState}
              isOSAS={isOSAS}
              formattedDueDate={formattedDueDate}
              isEditing={isEditing}
              handleSubmitGrade={handleSubmitGrade}
            />
              </div>
            </div>
          </div>
        </div>
  );
}