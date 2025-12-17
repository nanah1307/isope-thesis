// app/ui/snippets/OrgsPageOsas.tsx
'use client';

import Link from "next/link";
import { useState } from "react";
import { Orgs, Req, OrgRequirementStatus } from "@/app/lib/user";
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import React from "react";

type OrgsProp = {
  org: Orgs;
  requirements: Req[];                 // ⬅ now received from Supabase
  statuses: OrgRequirementStatus[];    // ⬅ now received from Supabase
};

type LinkType = {
  name: string;
  href: string;
};

const links: LinkType[] = [
  { name: 'Overview', href: '/' },
  { name: 'Members', href: '/' },
  { name: 'Requirements', href: '/' },
  { name: 'Archive', href: '/' },
];

export default function OrgsPage({ org, requirements, statuses }: OrgsProp) {
  const [active, setActive] = useState("Overview");

  // Get status for each requirement (per org)
  const getStatus = (reqId: string) =>
    statuses.find((s) => s.requirementId === reqId);

  // Group by section
  const groupedRequirements = requirements.reduce((acc, req) => {
    if (!acc[req.section]) acc[req.section] = [];
    acc[req.section].push(req);
    return acc;
  }, {} as Record<string, Req[]>);

  const content: Record<string, React.ReactNode[]> = {
    Overview: [
      <p key="bio" className="text-sm sm:text-base leading-relaxed">{org.bio}</p>,
      <p key="adviser" className="text-sm sm:text-base leading-relaxed">Adviser: {org.adviser}</p>,
      <p key="accreditlvl" className="text-sm sm:text-base leading-relaxed">Accreditation Level: {org.accreditlvl}</p>
    ],
    Members: [
     <p key="members-1" className="text-sm sm:text-base leading-relaxed  text-gray-600">placeholder</p>
      ],
    Requirements: [
      <div key="requirements-1" className="overflow-x-auto">
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
                        href={`/dashboard/orgs/${org.username}/requirements/${req.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        <DocumentTextIcon className="w-4"/> View
                      </Link>
                    </td>
                    <td className="border px-3 py-2">{status?.start ? new Date(status.start).toLocaleDateString() : "-"}</td>
                    <td className="border px-3 py-2">{status?.due ? new Date(status.due).toLocaleDateString() : "-"}</td>
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
    ],
    Archive: [
      <div className="overflow-x-auto" key="archive-1">
        <table className="min-w-full border border-gray-300 bg-white text-black text-xs sm:text-sm md:text-base">
          <thead>
            <tr className="bg-white text-black">
              <th className="border border-gray-300 px-3 py-2 text-left w-2/3">School Year</th>
              <th className="border border-gray-300 px-3 py-2 text-left">View</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Submitted</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Graded</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              {/* DATA HERE */}
            </tr>
          </tbody>
        </table>
        {/*if edit */}

      </div>
    ],
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="text-black flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6 rounded mx-auto max-w-xl">
        <img src={org.avatar} className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover" alt={org.name}/>
        <h1 className="text-2xl sm:text-3xl font-semibold text-center sm:text-left">{org.name}</h1>
      </div>

      {/* Tabs */}
      <nav className="rounded mt-6 p-2 sm:p-4">
        <ul className="flex flex-wrap sm:flex-nowrap justify-start sm:justify-left gap-4 sm:space-x-8 overflow-x-auto pb-2">
          {links.map(({ name }) => (
            <li key={name} className="flex-shrink-0">
              <button
                type="button"
                className={`cursor-pointer text-gray-700 hover:text-black hover:bg-gray-200 pb-1 focus:outline-none whitespace-nowrap 
                  ${ active === name ? "font-bold border-b-4 border-blue-500 shadow-md" : "font-medium shadow-md"}`}
                onClick={() => setActive(name)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 w-full bg-gray-100 p-4 sm:p-6 rounded-t text-gray-700 min-h-[300px] space-y-3 text-sm sm:text-base">
        {content[active] ? content[active] : <p>No content available.</p>}
      </div>
    </div>
  );
}
