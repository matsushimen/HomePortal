"use client";

import { useState } from "react";
import Link from "next/link";

import { deleteLink, type Link as LinkType } from "@/lib/api";

type Props = {
  links: LinkType[];
  heading?: string;
  onDeleted?: () => Promise<void> | void;
};

export function LinkList({ links, heading = "Links", onDeleted }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const deletable = typeof onDeleted === "function";

  const handleDelete = async (id: number) => {
    if (!deletable) {
      return;
    }
    const confirmDelete = window.confirm("このリンクを削除しますか？");
    if (!confirmDelete) {
      return;
    }
    setPendingId(id);
    setError(null);
    try {
      await deleteLink(id);
      await onDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{heading}</h2>
        <span className="text-xs text-slate-400">{links.length} items</span>
      </div>
      <ul className="mt-4 space-y-3" aria-label="Quick links">
        {links.map((link) => (
          <li
            key={link.id}
            className="flex items-center justify-between gap-3 rounded border border-slate-800/50 px-3 py-2 hover:border-brand"
          >
            <div className="min-w-0">
              <Link
                href={link.url}
                className="truncate text-sm font-medium text-brand"
                target="_blank"
                rel="noreferrer"
              >
                {link.title}
              </Link>
              <div className="truncate text-xs text-slate-400">{link.url}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {link.tags.map((tag) => (
                <span key={tag} className="ml-2 rounded-full bg-slate-800 px-2 py-1 text-xs uppercase tracking-wide">
                  {tag}
                </span>
              ))}
              {deletable ? (
                <button
                  type="button"
                  onClick={() => handleDelete(link.id)}
                  disabled={pendingId === link.id}
                  className="rounded border border-red-400 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingId === link.id ? "削除中..." : "削除"}
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
    </section>
  );
}
