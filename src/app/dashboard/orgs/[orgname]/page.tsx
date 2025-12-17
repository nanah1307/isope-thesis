// app/dashboard/orgs/[orgname]/page.tsx
import OrgsPage from "@/app/ui/snippets/OrgsPage";
import { 
  getUserByUsername, 
  getRequirements, 
  getOrgRequirementStatus, 
} from "@/app/lib/user";

export default async function OrgPage({  params,}: { params: { orgname: string };}) {
  const org = await getUserByUsername(params.orgname);

  if (!org) return <div>Org not found</div>;

  const requirements = await getRequirements();
  const statuses = await getOrgRequirementStatus(org.username);

  return (
    <OrgsPage 
      org={org} 
      requirements={requirements} 
      statuses={statuses} 
    />
  );
}
