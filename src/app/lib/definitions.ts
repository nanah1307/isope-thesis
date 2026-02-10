export type Comments = {
  id: string;
  text: string;
  timestamp: Date;
  author: string;
};

export type orgProp = {
  id: number;
  name: string;
  username:string;
  avatar: string;
  leftNotifications: number;
  progress: number;
  rightNotifications: number;
  members: number;
};
export enum Roles{
  osas, org, admin, member
}

export type Cart = {
  CartItems: Array<{
    id: number;
    name: string;
    price: number;
    details: string;
    photo: string;
    quantity: number;
  }>;
};
export type Orgs = {
  username: string;
  name: string;
  bio: string;
  adviser: string;
  accreditlvl: number;
  avatar: string;
};

export type Req = {
  //auto increment ID for mapping
  key:number,
  id: string;
  section: string;
  title: string;
  active: boolean;
};

export type OrgRequirementStatus = {
  orgUsername: string;
  requirementId: string;
  start: Date;
  due: Date;
  submitted: boolean;
  graded: boolean;
  score: number;
};

export type instructions= {
  comments: Comments[];
  newComment: string;

  activeTab: 'instructions' | 'grading';

  hasSubmitted: boolean;
  membershipAnswer: string;
  evaluationAnswer: string;

  score: number;
  submittedScore: number;
  maxScore: number;

  dueDate: Date | null;
  currentTime: number;

  isEditingInstructions: boolean;
  isEditingGrade: boolean;

  instructions: string;
  error: string | null;

  uploadedPdf: string | null;
  pdfFileName: string;
  currentPage: number;
  totalPages: number;
  pdfZoom: number;

  userRole: 'osas' | 'member' | null;
  currentUserEmail: string | null;

  loading: {
    page: boolean;
    requirement: boolean;
    grade: boolean;
    pdf: boolean;
  };

  submissiontype: 'freeform' | 'pdf' | null;

  requirement: {
    id: string;
    title: string;
    section: string;
    active: boolean;
  } | null;
  };
export const defaultPageState: instructions = {
  comments: [],
  newComment: '',
  activeTab: 'instructions',

  hasSubmitted: false,
  membershipAnswer: '',
  evaluationAnswer: '',

  score: 0,
  submittedScore: 0,
  maxScore: 100,

  dueDate: null,
  currentTime: Date.now(),

  isEditingInstructions: false,
  isEditingGrade: false,

  instructions: '',
  error: null,

  uploadedPdf: null,
  pdfFileName: '',
  currentPage: 1,
  totalPages: 1,
  pdfZoom: 1.0,

  userRole: null,
  currentUserEmail: null,

  loading: {
    page: true,
    requirement: false,
    grade: false,
    pdf: false,
  },

  submissiontype: null,
  requirement: null,
};


/* NOTES ON REQ STATUS
export const orgRequirementStatuses: OrgRequirementStatus[] = [
  {
    orgUsername: "CSO",
    requirementId: "req011",
    start: new Date("2025-01-10"),
    due: new Date("2025-03-31"),
    submitted: true,
    graded: true,
    score: 20,
  },
    {
    orgUsername: "CSO",
    requirementId: "req012",
    start: new Date("2025-01-10"),
    due: new Date("2025-03-31"),
    submitted: true,
    graded: true,
    score: 10,
  },
  {
    orgUsername: "elix",
    requirementId: "req012",
    start: new Date("2025-04-01"),
    due: new Date("2025-06-30"),
    submitted: false,
    graded: false,
    score: 0,
  },
]
*/

/* NOTES ON REQUIREMENTS
export const requirements: Req[] = [
  { key:1,
    id: "req011", 
    section: "1.ORGANIZATIONAL PERFORMANCE",
    title: "1.1. Moderator, Officers, and Members Evaluation", 
    active: true 
  },
  { 
    key:2,
    id: "req012", 
    section: "1.ORGANIZATIONAL PERFORMANCE",
    title: "1.2. Quality of Required Documents", 
    active: true 
  },

  { key:1,
    id: "req021", 
    section: "2.MEMBERS DEVELOPMENT",
    title: "2.1. Initiated Programs and Activities", 
    active: true 
  },
  { key:2,
    id: "req022",
    section: "2.MEMBERS DEVELOPMENT",
    title: "2.2. Meetings and Assemblies", 
    active: true 
  },
  { key:3,
    id: "req023", 
    section: "2.MEMBERS DEVELOPMENT",
    title: "2.3. Team Building", 
    active: true 
  },
  { key:4,
    id: "req024", 
    section: "2.MEMBERS DEVELOPMENT",
    title: "2.4. Officers or Members professional growth", 
    active: true 
  },

  { key:1,
    id: "req031", 
    section: "3. SERVICE AND COMMUNITY INVOLVEMENT",
    title: "3.1. Initiating a sustainable eco-friendly program or an outreach program", 
    active: true 
  },
  { key:2,
    id: "req032", 
    section: "3. SERVICE AND COMMUNITY INVOLVEMENT",
    title: "3.2. Involvement in Institutional Activities", 
    active: true 
  },

  { key:1,
    id: "req041", 
    section: "4. EXTERNAL COMPETITIONS, MEMBERSHIPS, LINKAGES, AND PARTNERSHIPS",
    title: "4.1.Memberships/Linkages/Partnerships", 
    active: true 
  },
  { key:2,
    id: "req042", 
    section: "4. EXTERNAL COMPETITIONS, MEMBERSHIPS, LINKAGES, AND PARTNERSHIPS",
    title: "4.2.Competitions/Awards/Recognition", 
    active: true 
  },
];
*/
