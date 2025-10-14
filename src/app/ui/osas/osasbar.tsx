'use client';

import { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ArrowRightStartOnRectangleIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface LinkType {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const links: LinkType[] = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Organizations', href: '/dashboard/invoices', icon: UserGroupIcon },
  { name: 'User', href: '/dashboard/customers', icon: UserIcon },
  { name: 'Log Out', href: '/', icon: ArrowRightStartOnRectangleIcon },
  
];

const Osasbar: FC = () => {
  const pathname = usePathname();

 return (
    <div className="h-screen w-25 flex flex-col justify-center items-center bg-white border-r px-4 py-6 shadow text-black">
      <img 
        src="/img/iaclogo.png"
        alt="Logo"
        className="mb-8 w-24 h-auto object-contain"
      />

      <nav className="flex flex-col gap-6 w-full items-center">
        {links.map((link) => {
          const LinkIcon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'flex flex-col items-center gap-1 rounded-md p-2 text-sm font-medium transition-colors',
                {
                  'bg-sky-100 text-black': isActive,
                  'hover:bg-gray-100': !isActive,
                }
              )}
            >
              <LinkIcon className="w-6 h-6" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Osasbar;