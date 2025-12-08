import OrgsPage from "@/app/ui/snippets/OrgsPage";
import { getAllUsernames, getUserByUsername } from "@/app/lib/user"

export default async function OrgPage({
  params,
}: {
  params: { orgname: string };
}) {
  const org = await getUserByUsername(params.orgname);

  if (!org) {
    return <div>Org not found</div>;
  }
  
  
  return (
    <>
      <OrgsPage org={org} />
    </>
  );
}
