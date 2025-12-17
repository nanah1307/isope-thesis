
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

// Fetch only usernames
export async function getAllUsernames(): Promise<string[]> {
  const { data, error } = await supabase.from("orgs").select("username");
  if (error || !data) return [];
  return data.map(o => o.username);
}

// Fetch full org by username
export async function getUserByUsername(username: string): Promise<Orgs | null> {
  const { data, error } = await supabase
    .from("orgs")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  return error || !data ? null : data;
};

// -------- Requirements --------

export type Req = {
  id: string;
  section: string;
  title: string;
  active: boolean;
};

// Fetch requirement list
export async function getRequirements(): Promise<Req[]> {
  const { data, error } = await supabase.from("requirements").select("*");
  return error || !data ? [] : data;
}

export type OrgRequirementStatus = {
  orgUsername: string;
  requirementId: string;
  start: string | null;
  due: string | null;
  submitted: boolean;
  graded: boolean;
  score: number | null;
};

// Fetch requirement status per org
export async function getOrgRequirementStatus(org: string): Promise<OrgRequirementStatus[]> {
  const { data, error } = await supabase
    .from("org_requirement_status")
    .select("*")
    .eq("orgUsername", org);

  return error || !data ? [] : data;
}
