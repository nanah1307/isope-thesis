import Link from "next/link";

import { Orgs,requirements, OrgRequirementStatus, orgRequirementStatuses,Req } from "@/app/lib/definitions";
import { DocumentTextIcon  } from '@heroicons/react/24/outline';
import {useEffect, useState, FC} from 'react';
import React from "react";
import { supabase } from "@/app/lib/database";

const UploadMembersModal: FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, orgs: string,currYear:string) => Promise<void>;
}> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currYear, setcurrYear] = useState('');

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (name.trim() && email.trim() && currYear.trim()) {
      await onCreate(name, email,currYear);
      setName('');
      setEmail('');
      setcurrYear('');
    }
  };
  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">Upload Member List</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700 text-xl"
          >
          </button>
        </div>


        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="cursor-pointer text-black px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="cursor-pointer text-white px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OrgsMembers({ username }: {username:string}){
    const [members, setMembers] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
  const fetchmembers = async () => {
    const { data, error } = await supabase.from('member').select('*');
    if (error) console.error('Error fetching member:', error.message);
    else setMembers(data);  // Stores orgs in state
  };
  fetchmembers();
}, [username]);

return(
<div className="overflow-x-auto" key="requirements-1">
    
        {/*if view = */}
        <table className="min-w-full border border-gray-300 bg-white text-black text-xs sm:text-sm md:text-base">
          <thead>
            <tr className="bg-white text-black">
              <th className="border border-gray-300 px-3 py-2 text-left w-2/3">Member</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Evaluation</th>
              
            </tr>
          </thead>
          <tbody>
            {/* <UploadMembersModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={}
      /> */}
            
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