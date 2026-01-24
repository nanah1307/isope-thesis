import OrgsPage from "@/app/ui/snippets/OrgsPage";
import {getUserByUsername } from "@/app/lib/database"
import { notFound } from "next/navigation";

export default async function Page(props: any) {
const { params } = props as { params: { orgname: string } };
  const org = await getUserByUsername(params.orgname);

  if (!org) {
    notFound();
  }
  
  return (
    <>
      <OrgsPage org={org} />
    </>
  );
}
