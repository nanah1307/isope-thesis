import Osasbar from "@/app/ui/osas/osasbar";
import OrgsDashboard from "@/app/ui/osas/osasboard";
import NotificationSidebar from "../ui/notifbar";

export default function dashboardlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
      <Osasbar />
      <main className="flex-1 overflow-y-auto lg:pr-80 xl:pr-96">
        <div className="h-full min-h-screen">
          {children}
        </div>
      </main>
      <NotificationSidebar />
    </div>
  );
}