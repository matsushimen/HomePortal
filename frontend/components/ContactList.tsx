"use client";

import { useState } from "react";
import Link from "next/link";

import { deleteContact, type Contact } from "@/lib/api";

type Props = {
  contacts: Contact[];
  onDeleted?: () => Promise<void> | void;
};

export function ContactList({ contacts, onDeleted }: Props) {
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const deletable = typeof onDeleted === "function";

  const handleDelete = async (id: number) => {
    if (!deletable) {
      return;
    }
    const confirmDelete = window.confirm("この連絡先を削除しますか？");
    if (!confirmDelete) {
      return;
    }
    setPendingId(id);
    setError(null);
    try {
      await deleteContact(id);
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
        <h2 className="text-lg font-semibold">Contacts</h2>
        <span className="text-xs text-slate-400">{contacts.length} entries</span>
      </div>
      <div className="mt-4 divide-y divide-slate-800/70">
        {contacts.map((contact) => (
          <article key={contact.id} className="py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{contact.name}</h3>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase tracking-wide">
                  {contact.category}
                </span>
                {deletable ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(contact.id)}
                    disabled={pendingId === contact.id}
                    className="rounded border border-red-400 px-2 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pendingId === contact.id ? "削除中..." : "削除"}
                  </button>
                ) : null}
              </div>
            </div>
            <div className="mt-2 grid gap-2 text-xs text-slate-400 md:grid-cols-2">
              {contact.phone ? (
                <a className="hover:text-brand" href={`tel:${contact.phone}`}>
                  {contact.phone}
                </a>
              ) : null}
              {contact.url ? (
                <Link className="hover:text-brand" href={contact.url} target="_blank" rel="noreferrer">
                  Website
                </Link>
              ) : null}
              {contact.notes ? <p className="md:col-span-2 text-slate-500">{contact.notes}</p> : null}
              {contact.hours ? <p className="text-slate-500">{contact.hours}</p> : null}
            </div>
          </article>
        ))}
      </div>
      {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
    </section>
  );
}
