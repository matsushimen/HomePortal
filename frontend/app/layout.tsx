import "./globals.css";

import type { Metadata } from "next";
import { ReactNode } from "react";

import { AppShell } from "@/components/AppShell";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: config.appName,
  description: "HomePortal consolidates family life into a single dashboard."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

