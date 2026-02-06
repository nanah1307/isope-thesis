"use client";

import OrgsDashboard from '@/app/ui/snippets/orgsdash';
import NotificationSidebar from '../ui/notifbar';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      {/* Main Dashboard */}
      <div className="flex-1">
        <OrgsDashboard />
      </div>
    </div>
  );
}
