import OrgsPage from "@/app/ui/osas/osasorgs";
import { getAllUsernames, getUserByUsername } from "@/app/lib/user"

export default async function OrgPage({params,}:
{
  params:Promise<{orgname:string}>;
}){

  const orgName = getUserByUsername((await params).orgname);

  if(!orgName){
    return <div>Org not found</div>;
  }
  return<>
  <OrgsPage org={orgName}/>
  </>
}