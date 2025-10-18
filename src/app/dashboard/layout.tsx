import Osasbar from "@/app/ui/osas/osasbar";

export default function dashboardlayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Osasbar />
    </div>
  );
}