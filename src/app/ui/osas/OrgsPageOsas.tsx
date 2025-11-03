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
      <p key="overview-1">{org.bio}</p>
    ],
    Members: [
      <p key="members-1">Member 1</p>,
      <p key="members-2">Member 2</p>,
    ],
    Requirements: [
      <p key="req-1">Requirement A</p>,
      <p key="req-2">Requirement B</p>,
      <p key="req-3">Additional notes...</p>,
    ],
    Archive: [
      <p key="archive-1">Archived post 1</p>,
      <p key="archive-2">Archived post 2</p>,
    ],
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="text-black flex items-center justify-center space-x-6 p-6 rounded mx-auto max-w-xl">
        <img
          src={org.avatar}
          alt={org.name}
          className="w-24 h-24 rounded-full"
        />
        <h1 className="text-3xl font-semibold">{org.name}</h1>
      </div>

      <nav className="rounded mt-6 p-4">
        <ul className="flex justify-start space-x-8 p-4">
          {links.map(({ name }) => (
            <li key={name}>
              <button
                type="button"
                className={`font-medium text-gray-700 hover:text-black pb-1 focus:outline-none ${
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

      <div className="mt-8 w-full bg-gray-100 p-6 rounded-t text-gray-700 min-h-[300px] space-y-2">
        {content[active] ? content[active] : <p>No content available.</p>}
      </div>
    </div>
  );
}
