import Osasbar from "@/app/ui/osas/osasbar";

export default function dashboardlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Osasbar />
      <main className="p-6">{children}</main>
    </div>
  );
}