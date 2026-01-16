"use client";

import { useState } from "react";

export default function UploadMembersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/members/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Upload failed");
    } else {
      setMessage(`✅ ${data.count} members imported`);
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-xl font-bold">Upload Members Excel</h1>

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Uploading..." : "Upload Excel"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
