'use client';

import Link from 'next/link';
import { FC, useEffect, useState } from 'react';
import { supabase } from '@/app/lib/database';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface Notification {
  id: number;
  title: string;
  date: string;
}

const NotificationSidebar: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: 'General Assembly', date: '9/17' },
    { id: 2, title: 'Workshop', date: '10/1' },
    { id: 3, title: 'Webinar', date: '11/5' }
  ]);

  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequirements = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('org_requirement_status')
        .select(`
          *,
          requirements ( title ),
          orgs ( name )
        `)
        .eq('graded', false)
        .eq('active', true);


      if (error) {
        console.error('Error fetching requirements:', error);
      } else {
        setRequirements(data || []);
      }

      setLoading(false);
    };

    fetchRequirements();
  }, []);

  const removeNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden bg- text-white p-3 rounded-full shadow-lg hover:bg-blue-800 transition-colors"
        aria-label="Toggle notifications"
      >
        <BellIcon className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-30 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed right-0 top-0 bg-[#014fb3] h-screen p-4 sm:p-6 text-white flex flex-col shadow-2xl z-50 overflow-y-auto
        w-full sm:w-96 md:w-80
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-white hover:text-red-300 transition-colors cursor-pointer"
          aria-label="Close notifications"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Notifications Header */}
        <div className="flex items-center gap-2 mb-6 mt-8 lg:mt-0">
          <BellIcon className="w-6 h-6" />
          <h2 className="font-bold text-base sm:text-lg">NOTIFICATIONS</h2>
        </div>

        {/* Notification Items */}
        <div className="space-y-3 mb-6">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-blue-800 rounded-lg p-3 flex items-center justify-between hover:bg-blue-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs text-blue-200">{notif.date}</p>
                </div>
              </div>
              <button
                onClick={() => removeNotification(notif.id)}
                className="text-white hover:text-red-300 transition-colors ml-2 flex-shrink-0 cursor-pointer"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <button className="bg-yellow-400 text-blue-900 font-bold py-2 px-6 rounded-full hover:bg-yellow-300 transition-colors mb-8 self-start text-sm sm:text-base cursor-pointer">
          VIEW ALL
        </button>

        {/* To Grade Section */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
            <h3 className="font-bold text-base sm:text-lg">TO GRADE</h3>
          </div>

          {/* Counter */}
          {!loading && (
            <h4 className="text-md text-blue-200 mb-4">
              {requirements.length} item{requirements.length === 1 ? '' : 's'}
            </h4>
          )}

          {/* Task Checkboxes */}
          <div className="space-y-3">
            {loading && (
              <p className="text-sm text-blue-200 italic">
                Loading notifications...
              </p>
            )}

            {!loading && requirements.length === 0 && (
              <p className="text-sm text-blue-200 italic">
                No requirements to grade.
              </p>
            )}

            {!loading && requirements.map((req) => (
              <label
                key={req.id}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-2 border-white bg-transparent cursor-pointer flex-shrink-0"
                  checked={req.submitted}
                  readOnly
                />

                <Link
                  href={`/dashboard/orgs/${req.orgUsername}/requirements/${req.requirementId}`}
                  className="text-sm leading-tight group-hover:text-blue-200 transition-colors"
                >
                  {req.orgs?.name} - {req.requirements?.title}
                  <br />
                  <span className="text-xs text-blue-200">
                    Due: {req.due}
                  </span>
                </Link>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationSidebar;