
// app/lib/user.ts
import { supabase } from "@/app/lib/database";

export type Orgs = {
  username: string;
  name: string;
  bio: string;
  adviser: string;
  accreditlvl: number;
  avatar: string;
};

export async function getAllUsernames(): Promise<string[]> {
  const { data, error } = await supabase
    .from("orgs")
    .select("username");

  if (error || !data) return [];
  return data.map((o) => o.username);
}

export async function getUserByUsername(username: string): Promise<Orgs | null> {
  const { data, error } = await supabase
    .from("orgs")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export type Req = {
  id: string;
  section: string;
  title: string;
  active: boolean;
};

export const requirements: Req[] = [
  { 
    id: "req011", 
    section: "1.ORGANIZATIONAL PERFORMANCE",
    title: "1.1. Moderator, Officers, and Members Evaluation", 
    active: true 
  },
  { 
    id: "req012", 
    section: "1.ORGANIZATIONAL PERFORMANCE",
    title: "1.2. Quality of Required Documents", 
    active: true 
  },

  { 
    id: "req021", 
    section: "2.MEMBERS DEVELOPMENT",
    title: "2.1. Initiated Programs and Activities", 
    active: true 
  },
  { 
    id: "req022",
    section: "2.MEMBERS DEVELOPMENT",
    title: "2.2. Meetings and Assemblies", 
    active: true 
  },
  { 
    id: "req023", 
    section: "2.MEMBERS DEVELOPMENT",
    title: "2.3. Team Building", 
    active: true 
  },
  { 
    id: "req024", 
    section: "2.MEMBERS DEVELOPMENT",
    title: "2.4. Officers or Members professional growth", 
    active: true 
  },

  { 
    id: "req031", 
    section: "3. SERVICE AND COMMUNITY INVOLVEMENT",
    title: "3.1. Initiating a sustainable eco-friendly program or an outreach program", 
    active: true 
  },
  { 
    id: "req032", 
    section: "3. SERVICE AND COMMUNITY INVOLVEMENT",
    title: "3.2. Involvement in Institutional Activities", 
    active: true 
  },

  { 
    id: "req041", 
    section: "4. EXTERNAL COMPETITIONS, MEMBERSHIPS, LINKAGES, AND PARTNERSHIPS",
    title: "4.1.Memberships/Linkages/Partnerships", 
    active: true 
  },
  { 
    id: "req042", 
    section: "4. EXTERNAL COMPETITIONS, MEMBERSHIPS, LINKAGES, AND PARTNERSHIPS",
    title: "4.2.Competitions/Awards/Recognition", 
    active: true 
  },
];

export type OrgRequirementStatus = {
  orgUsername: string;
  requirementId: string;
  start: Date;
  due: Date;
  submitted: boolean;
  graded: boolean;
  score: number;
};

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