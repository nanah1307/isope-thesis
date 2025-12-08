"use client";

import OrgsDashboard from '@/app/ui/snippets/dashboard';
import NotificationSidebar from '../ui/notifbar';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      {/* Main Dashboard */}
      <div className="flex-1">
        <OrgsDashboard />
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:block w-72 border-l border-gray-200">
        <NotificationSidebar />
      </div>

      {/* Sidebar and overlay for mobile */}
      <div className="lg:hidden">
        <NotificationSidebar />
      </div>
    </div>
  );
}
