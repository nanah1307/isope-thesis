"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/database";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  const handleSignUp = async () => {
    // 1️⃣ Create auth user (password handled by Supabase)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      alert(error?.message);
      return;
    }

    // 2️⃣ Insert profile into users table
    const { error: insertError } = await supabase.from("users").insert({
      id: data.user.id,
      email,
      username,
      name,
      role: "member",
    });

    if (insertError) {
      alert(insertError.message);
    } else {
      alert("Account created!");
    }
  };

  return (
    <div className="space-y-3">
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />

      <button onClick={handleSignUp}>
        Create Account
      </button>
    </div>
  );
}
