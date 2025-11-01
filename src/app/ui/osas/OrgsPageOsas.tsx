'use client';

import { useState } from "react";
import { Orgs } from "@/app/lib/user";

type OrgsProp = {
  org: Orgs;
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

export default function OrgsPageOsas({ org }: OrgsProp) {
  const [active, setActive] = useState('Overview');

  const content: Record<string, React.ReactNode[]> = {
    Overview: [
      <p key="overview-1" className="text-sm sm:text-base leading-relaxed">{org.bio}</p>
    ],
    Members: [],
    Requirements: [
      <div className="overflow-x-auto" key="requirements-3">
        <table className="min-w-full border border-gray-300 bg-white text-black text-xs sm:text-sm md:text-base">
          <thead>
            <tr className="bg-white text-black">
              <th className="border border-gray-300 px-3 py-2 text-left w-2/3">Requirement</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Start</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Due</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Submitted</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Graded</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {/* DATA HERE */}
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
            {/* DATA HERE */}
          </tbody>
        </table>
      </div>
    ],
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="text-black flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6 rounded mx-auto max-w-xl">
        <img
          src={org.avatar}
          alt={org.name}
          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover"
        />
        <h1 className="text-2xl sm:text-3xl font-semibold text-center sm:text-left">{org.name}</h1>
      </div>

      <nav className="rounded mt-6 p-2 sm:p-4">
        <ul className="flex flex-wrap sm:flex-nowrap justify-start sm:justify-left gap-4 sm:space-x-8 overflow-x-auto pb-2">
          {links.map(({ name }) => (
            <li key={name} className="flex-shrink-0">
              <button
                type="button"
                className={`font-medium text-gray-700 hover:text-black pb-1 focus:outline-none whitespace-nowrap ${
                  active === name ? "border-b-2 border-blue-500" : ""
                }`}
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