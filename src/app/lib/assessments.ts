export type Comment = {
  id: string;
  text: string;
  timestamp: Date;
  author: string;
};

export type Assessment = {
  id: string;
  orgUsername: string;
  requirementId: string;
  submittedAt: Date | null;
  answers: Record<string, string>;
  comments: Comment[];
  score: number;
  graded: boolean;
  feedback?: string;
};

export const assessments: Assessment[] = [
  {
    id: "assess001",
    orgUsername: "CSO",
    requirementId: "req011",
    submittedAt: new Date("2025-03-15"),
    answers: {
      "membership": "Organisation Officer",
      "evaluation_ld_q1": "AA (Almost Always)"
    },
    comments: [],
    score: 20,
    graded: true,
    feedback: ""
  },
  {
    id: "assess002",
    orgUsername: "CSO",
    requirementId: "req012",
    submittedAt: new Date("2025-03-20"),
    answers: {
      "document_quality": "Excellent"
    },
    comments: [],
    score: 10,
    graded: true,
    feedback: ""
  },
  {
    id: "assess003",
    orgUsername: "elix",
    requirementId: "req012",
    submittedAt: null,
    answers: {},
    comments: [],
    score: 0,
    graded: false,
    feedback: ""
  }
];

export function getAssessmentByOrgAndReq(
  orgUsername: string,
  requirementId: string
): Assessment | undefined {
  return assessments.find(
    (a) => a.orgUsername === orgUsername && a.requirementId === requirementId
  );
}

export function addCommentToAssessment(
  assessmentId: string,
  commentText: string,
  author: string = "OSAS"
): Comment {
  const assessment = assessments.find((a) => a.id === assessmentId);
  if (!assessment) {
    throw new Error("Assessment not found");
  }

  const newComment: Comment = {
    id: `comment${Date.now()}`,
    text: commentText,
    timestamp: new Date(),
    author: author
  };

  assessment.comments.push(newComment);
  return newComment;
}

export function deleteCommentFromAssessment(
  assessmentId: string,
  commentId: string
): boolean {
  const assessment = assessments.find((a) => a.id === assessmentId);
  if (!assessment) {
    return false;
  }

  const initialLength = assessment.comments.length;
  assessment.comments = assessment.comments.filter((c) => c.id !== commentId);
  return assessment.comments.length < initialLength;
}

export function updateAssessmentAnswers(
  assessmentId: string,
  answers: Record<string, string>
): void {
  const assessment = assessments.find((a) => a.id === assessmentId);
  if (!assessment) {
    throw new Error("Assessment not found");
  }

  assessment.answers = { ...assessment.answers, ...answers };
  assessment.submittedAt = new Date();
}

export function updateAssessmentGrade(
  assessmentId: string,
  score: number,
  feedback: string = ""
): void {
  const assessment = assessments.find((a) => a.id === assessmentId);
  if (!assessment) {
    throw new Error("Assessment not found");
  }

  if (score < 1 || score > 100) {
    throw new Error("Score must be between 1 and 100");
  }

  assessment.score = score;
  assessment.feedback = feedback;
  assessment.graded = true;
}

export function getAssessmentGrade(
  assessmentId: string
): { score: number; feedback: string; graded: boolean } | null {
  const assessment = assessments.find((a) => a.id === assessmentId);
  if (!assessment) {
    return null;
  }

  return {
    score: assessment.score,
    feedback: assessment.feedback || "",
    graded: assessment.graded
  };
}

export function formatTimestamp(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minute${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' 
  });
}

export function formatName(name: string): string {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').toUpperCase();
}

export type GradeData = {
  score: number;
  feedback: string;
  gradedAt: string;
};

export function saveCommentsToLocalStorage(
  orgUsername: string,
  requirementId: string,
  comments: Comment[]
): void {
  const storageKey = `comments_${orgUsername}_${requirementId}`;
  localStorage.setItem(storageKey, JSON.stringify(comments));
}

export function validateAndCorrectScore(value: string | number): number {
  let numValue = typeof value === 'string' ? parseInt(value) : value;
  
  if (isNaN(numValue)) {
    return 0;
  } else if (numValue > 100) {
    return 100;
  } else if (numValue < 1) {
    return 1;
  }
  
  return numValue;
}