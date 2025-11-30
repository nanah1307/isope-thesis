// app/dashboard/orgs/[orgname]/page.tsx
import OrgsPageOsas from "@/app/ui/osas/OrgsPageOsas";
import { getUserByUsername } from "@/app/lib/user";

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
      <OrgsPageOsas org={org} />
    </>
  );
}
