import Link from "next/link";

import { Orgs,requirements, OrgRequirementStatus, orgRequirementStatuses,Req } from "@/app/lib/definitions";
import { DocumentTextIcon  } from '@heroicons/react/24/outline';
import React from "react";

export default function OrgsRequirement({ username }: {username:string}){

    const getStatus = (reqId: string): OrgRequirementStatus | undefined => {
    return orgRequirementStatuses.find(
      (s) => s.orgUsername === username && s.requirementId === reqId
    );
  };

    const groupedRequirements: Record<string, Req[]> = requirements.reduce((acc, req) => {
    if (!acc[req.section]) acc[req.section] = [];
    acc[req.section].push(req);
    return acc;
  }, {} as Record<string, Req[]>);


return(
<div className="overflow-x-auto" key="requirements-1">
        {/*if view = */}
        <table className="min-w-full border border-gray-300 bg-white text-black text-xs sm:text-sm md:text-base">
          <thead>
            <tr className="bg-white text-black">
              <th className="border border-gray-300 px-3 py-2 text-left w-2/3">Requirement</th>
              <th className="border border-gray-300 px-3 py-2 text-left">View</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Start</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Due</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Submitted</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Graded</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedRequirements).map(([section, reqs]) => (
              <React.Fragment key={section}>
                <tr className="bg-gray-200">
                  <td colSpan={7} className="px-3 py-2 font-bold text-black">{section}</td>
                </tr>

                {reqs.map((req) => {
                  const status = getStatus(req.id);
                  return (
                    <tr key={req.id} className="border-b border-gray-200">
                      <td className="border px-3 py-2">{req.title}</td>
                      <td className="border px-3 py-2">
                        <Link
                          href={`/dashboard/orgs/${username}/requirements/${req.id}`}
                          className="text-blue-500 hover:underline"
                        >
                            <DocumentTextIcon/> View
                        </Link>
                      </td>
                      <td className="border px-3 py-2">{status?.start?.toLocaleDateString() ?? "-"}</td>
                      <td className="border px-3 py-2">{status?.due?.toLocaleDateString() ?? "-"}</td>
                      <td className="border px-3 py-2">{status?.submitted ? "✅" : "❌"}</td>
                      <td className="border px-3 py-2">{status?.graded ? "✅" : "❌"}</td>
                      <td className="border px-3 py-2">{status?.graded ? status.score : "-"}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
)
    
}