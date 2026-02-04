"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/database";

export default function UserPage() {
  const { data: session, status } = useSession();

  const [organizations, setOrganizations] = useState<string[]>([]);

  useEffect(() => {
    if (!session?.user?.name) return;

    const fetchOrgs = async () => {
      const { data, error } = await supabase
        .from("member")
        .select("organizations")
        .eq("student_name", session.user!.name);

      if (error || !data) return;

      const orgList = data
        .map((row: any) => row.organizations)
        .filter(Boolean)
        .flatMap((orgs: string) =>
          orgs.split(",").map((o: string) => o.trim())
        )
        .filter(Boolean);

      const uniqueOrgs = [...new Set(orgList)];

      setOrganizations(uniqueOrgs);
    };

    fetchOrgs();
  }, [session?.user?.name]);



  if (status === "loading") return <p className="p-4 text-black">Loading...</p>;
  if (!session) return <p className="p-4 text-black">Unable to fetch user information</p>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Left Column */}
      <div className="flex flex-col gap-6 lg:w-1/2">
            {/* User Information */}
            <div className="bg-white shadow-md rounded-lg p-6 sm:p-8 w-full break-words">
                <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold"> User Information </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base"> <span className="font-semibold">Name:</span> {session.user?.name}</p>
                <p className="text-gray-600 mt-2 text-sm sm:text-base"> <span className="font-semibold">Email:</span> {session.user?.email}</p>
            </div>

            {/* Current Organizations */}
            <div className="bg-white shadow-md rounded-lg p-6 sm:p-8 w-full break-words">
                <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold"> Current Organizations </h1>
                <ul className="text-gray-600 mt-2 text-sm sm:text-base list-disc list-inside space-y-1 max-h-[50vh] overflow-y-auto">
                    {organizations.map((org, idx) => (
                      <li key={idx}>{org}</li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Right Column */}
        {/* Profile Picture */}
        <div className="bg-white shadow-md rounded-lg p-6 sm:p-8 lg:w-1/2 h-[75vh] flex flex-col">
          <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold mb-4">
            Profile Picture
          </h1>

          <div className="flex-1 flex items-center justify-center">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="h-full max-h-[60vh] aspect-square rounded-full object-cover"
              />
            ) : (
              <p className="text-gray-500 text-lg">
                You have no profile picture
              </p>
            )}
          </div>
        </div>
    </div>
  );
}
