'use client';

import React, { useState, useEffect } from "react";
import { supabase } from '@/app/lib/database';
import { useSearchParams } from "next/navigation";
import OrgsRequirement from "./orgs/OrgsRequirements";
import OrgsMembers from "./orgs/OrgsMembers";

type OrgsProp = {
  org: any;
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

export default function OrgsPage({ org }: OrgsProp) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [active, setActive] = useState(
    tabParam && links.some(l => l.name === tabParam)
      ? tabParam
      : 'Overview'
  );

  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [bio, setBio] = useState(org.bio ?? '');
  const [bioDraft, setBioDraft] = useState(org.bio ?? '');

  const [adviser, setAdviser] = useState(org.adviser ?? '');
  const [adviserDraft, setAdviserDraft] = useState(org.adviser ?? '');

  const [accreditlvl, setAccreditlvl] = useState(org.accreditlvl ?? 1);
  const [accreditlvlDraft, setAccreditlvlDraft] = useState(org.accreditlvl ?? 1);

  const [saving, setSaving] = useState(false);

  const saveOrg = async () => {
    setSaving(true);

    const { error } = await supabase
      .from('orgs')
      .update({
        bio: bioDraft || null,
        adviser: adviserDraft || null,
        accreditlvl: accreditlvlDraft,
      })
      .eq('username', org.username); 

    if (error) {
      console.error('Failed to update organization:', error.message);
      alert('Failed to save changes');
    } else {
      setBio(bioDraft);
      setAdviser(adviserDraft);
      setAccreditlvl(accreditlvlDraft);
      setIsEditingOrg(false);
    }

    setSaving(false);
  };

  const content: Record<string, React.ReactNode[]> = {
    Overview: [
      <div key="overview" className="relative">
        {/* Edit Overview */}
        <div className="absolute top-0 right-0 flex flex-col space-y-2">
          {!isEditingOrg ? (
            <button
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
              onClick={() => setIsEditingOrg(true)}
            >
              Edit
            </button>
          ) : (
            <>
              <button
                disabled={saving}
                className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md cursor-pointer hover:bg-green-700 disabled:opacity-50 transition-colors"
                onClick={saveOrg}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>

              <button
                disabled={saving}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-md cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setBioDraft(bio);
                  setAdviserDraft(adviser);
                  setAccreditlvlDraft(accreditlvl);
                  setIsEditingOrg(false);
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Editable Fields */}
        <div className="space-y-3 pr-16">
          {/* Bio */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            {isEditingOrg && <span className="w-36 font-medium">Bio:</span>}
            {isEditingOrg ? (
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                className="flex-1 min-h-[80px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            ) : (
              <p className="text-sm sm:text-base leading-relaxed">{bio}</p>
            )}
          </div>

          {/* Adviser */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {isEditingOrg && <span className="w-36 font-medium">Adviser:</span>}
            {isEditingOrg ? (
              <input
                type="text"
                value={adviserDraft}
                onChange={(e) => setAdviserDraft(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            ) : (
              <p className="text-sm sm:text-base leading-relaxed">Adviser: {adviser}</p>
            )}
          </div>

          {/* Accreditation Level */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            {isEditingOrg && <span className="w-36 font-medium">Accreditation Level:</span>}
            {isEditingOrg ? (
              <select
                value={accreditlvlDraft}
                onChange={(e) => setAccreditlvlDraft(Number(e.target.value))}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            ) : (
              <p className="text-sm sm:text-base leading-relaxed">Accreditation Level: {accreditlvl}</p>
            )}
          </div>
        </div>
      </div>
    ],

    Members: [
      <div key="members" className="w-full">
        <OrgsMembers username={org.username} />
      </div>
    ],

    Requirements: [
      <div key="requirements" className="w-full">
        <OrgsRequirement username={org.username} />
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
