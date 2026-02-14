"use client";

import OrgsDashboard from '@/app/ui/snippets/orgsdash';
import NotificationSidebar from '../ui/notifbar';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      {/* Main Dashboard */}
      <div className="flex-1 w-full sm:w-auto max-w-md sm:max-w-5xl mx-auto px-4 pt-6">
        <OrgsDashboard />
      </div>
    </div>
  );
}
