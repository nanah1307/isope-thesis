'use client';

import { useState, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  { name: 'Members', href: '/members' },
  { name: 'Requirements', href: '/requirements' },
  { name: 'Archive', href: '/archive' },
];

export default function OrgsPageOsas({ org }: OrgsProp) {
  const pathname = usePathname();

  const getActiveTab = () => {
    const matched = links.find(link => link.href === pathname);
    return matched ? matched.name : 'Overview';
  };

  const [active, setActive] = useState(getActiveTab());

  useEffect(() => {
    setActive(getActiveTab());
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="text-black flex flex-col sm:flex-row items-center justify-center sm:space-x-6 p-4 sm:p-6 rounded mx-auto max-w-xl text-center sm:text-left">
        <img
          src={org.avatar}
          alt={org.name}
          className="w-24 h-24 rounded-full mb-4 sm:mb-0"
        />
        <h1 className="text-2xl sm:text-3xl font-semibold">{org.name}</h1>
      </div>

      <nav className="rounded mt-6">
        <ul className="flex flex-col sm:flex-row justify-start sm:space-x-8 p-2 sm:p-4 border-b border-gray-200">
          {links.map(({ name, href }) => (
            <li key={name}>
              {name === 'Overview' ? (
                <button
                  onClick={() => setActive('Overview')}
                  className={`font-medium text-gray-700 hover:text-black pb-2 sm:pb-1 focus:outline-none ${
                    active === 'Overview' ? 'border-b-4 border-blue-500' : ''
                  }`}
                >
                  {name}
                </button>
              ) : (
                <Link
                  href={href}
                  className={`font-medium text-gray-700 hover:text-black pb-2 sm:pb-1 block ${
                    active === name ? 'border-b-4 border-blue-500' : ''
                  }`}
                >
                  {name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>


      {active === 'Overview' && (
        <div className="mt-6 sm:mt-8 w-full bg-gray-100 p-4 sm:p-6 rounded-t text-gray-700 min-h-[300px] space-y-2">
          <h2 className="font-bold text-2xl sm:text-3xl">{org.name}</h2>
          <p className="text-sm sm:text-base">{org.bio}</p>
        </div>
      )}
    </div>
  );
}