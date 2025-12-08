"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { redirect } from "next/dist/server/api-utils";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="bg-white min-h-screen">
      <header className="bg-[#014FB3] text-white flex items-center justify-center py-6 shadow-md">
          <img
            src="/img/iaclogolong.png"
            alt="Logo"
            className="w-48 h-auto object-contain items-center"
          />

          <h1 className="text-2xl md:text-3xl font-bold">iSOPE Online</h1>
      </header>


      <div className="flex flex-col items-center justify-center h-64 space-y-2justify-center">
        <div className="mt-50 border-8 border-blue-500 px-10 py-10 rounded-lg space-y-2 text-center">
          <p className="text-black font-bold">iACADEMY</p>
          <p className="text-black font-bold">iSOPE Online</p>
          <div className="w-full h-px bg-blue-500 my-4"></div>
          <p className="text-black text-3xl">Sign in</p>
          <p className="text-black">Please use your domain account to login.</p>
          <button onClick={() => signIn("google")} className="bg-red-500 text-white px-4 py-2 rounded cursor-pointer">Sign in with Google</button>
        </div>
      </div>
    </div>
    
  );
}
