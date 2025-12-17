"use client";

import { useSession } from "next-auth/react";

export default function UserPage() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <p className="p-4 text-black">Loading...</p>;
  if (!session) return <p className="p-4 text-black">Unable to fetch user information</p>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Left Column */}
      <div className="flex flex-col gap-6 lg:w-1/2">
            {/* User Information */}
            <div className="bg-white shadow-md rounded-lg p-6 sm:p-8 w-full break-words">
                <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold"> User Page </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base"> <span className="font-semibold">Name:</span> {session.user?.name}</p>
                <p className="text-gray-600 mt-2 text-sm sm:text-base"> <span className="font-semibold">Email:</span> {session.user?.email}</p>
            </div>

            {/* Current Organizations */}
            <div className="bg-white shadow-md rounded-lg p-6 sm:p-8 w-full break-words">
                <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold"> Current Organizations </h1>
                <ul className="text-gray-600 mt-2 text-sm sm:text-base list-disc list-inside space-y-1 max-h-[50vh] overflow-y-auto">
                    <li>Organization 1</li>
                    <li>Organization 2</li>
                    <li>Organization 3</li>
                </ul>
            </div>
        </div>

        {/* Right Column */}
        {/* Profile Picture */}
        <div className="bg-white shadow-md rounded-lg p-6 sm:p-8 lg:w-1/2 h-[75vh]">
            <h1 className="text-gray-800 text-2xl sm:text-3xl font-bold"> Profile Picture </h1>
        </div>
    </div>
  );
}
