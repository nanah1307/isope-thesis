import Link from "next/link";

import { DocumentTextIcon  } from '@heroicons/react/24/outline';
import {useEffect, useState, FC} from 'react';
import React from "react";
import { supabase } from "@/app/lib/database";
import UploadMembersModal from "./uploadMembers";

export default function OrgsMembers({ username }: {username:string}){
    const [members, setMembers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
  const fetchmembers = async () => {
    const { data, error } = await supabase.from('member').select('*').eq("organizations",username);
    if (error) console.error('Error fetching member:', error.message);
    else setMembers(data);  // Stores orgs in state
  };
  fetchmembers();
}, [username]);

return(
<div className="overflow-x-auto" key="requirements-1">
     <UploadMembersModal/>
        {/*if view = */}
        <table className="min-w-full border border-gray-300 bg-white text-black text-xs sm:text-sm md:text-base">
          <thead>
            <tr className="bg-white text-black">
              <th className="border border-gray-300 px-3 py-2 text-left w-2/3">Member</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Evaluation</th>
            </tr>
          </thead>
         
          <tbody>
                {members.map((member) => {
                  return (
                    <tr key={member.id} className="border-b border-gray-200">
                      <td className="border px-3 py-2">{member.student_name}</td>
                      <td className="border px-3 py-2">
                        <Link
                          href={`/dashboard/orgs/${username}/requirements/${member.id}`}
                          className="text-blue-500 hover:underline"
                        >
                            <DocumentTextIcon className="w-10 h-8 inline mr-1"/> View
                        </Link>
                      </td>

                    </tr>
                  );
                })}
               
          </tbody>
        </table>
     
      </div>
)
};