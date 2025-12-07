"use client";

import Osasbar from "@/app/ui/snippets/navbar";
import OrgsDashboard from "@/app/ui/snippets/dashboard";

export default function dashboardlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      <Osasbar />
        <main className="flex-1 overflow-y-auto">
          <div className="h-full min-h-screen">
            {children}
          </div>
        </main>
    </div>
  );
}