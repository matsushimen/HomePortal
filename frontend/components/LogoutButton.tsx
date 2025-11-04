"use client";

import { useState } from "react";

export function LogoutButton() {
  const [processing, setProcessing] = useState(false);

  const handleLogout = async () => {
    if (processing) {
      return;
    }
    setProcessing(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      window.location.href = "/login";
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Logout failed: ${message}`);
      setProcessing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={processing}
      className="rounded border border-slate-700 px-3 py-1 text-slate-300 hover:border-brand hover:text-white disabled:opacity-60"
    >
      {processing ? "Logging out..." : "Logout"}
    </button>
  );
}
