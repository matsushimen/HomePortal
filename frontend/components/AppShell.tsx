"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

import { config } from "@/lib/config";
import { LogoutButton } from "@/components/LogoutButton";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/links", label: "Links" },
  { href: "/contacts", label: "Contacts" },
  { href: "/assets", label: "Assets" },
  { href: "/calendar", label: "Calendar" },
  { href: "/todos", label: "ToDo" },
  { href: "/settings/users", label: "Users" }
];

export function AppShell({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!config.authEnabled) {
      return;
    }
    const token = document.cookie.split(";").find((cookie) => cookie.trim().startsWith("homeportal_token="));
    setIsAuthenticated(Boolean(token));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold text-white">
            {config.appName}
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-4 text-sm text-slate-300">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
            {config.authEnabled ? (
              isAuthenticated ? (
                <LogoutButton />
              ) : (
                <Link
                  href="/login"
                  className="rounded border border-brand px-3 py-1 text-brand hover:bg-brand hover:text-white"
                >
                  Login
                </Link>
              )
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

