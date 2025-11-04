"use client";

import useSWR from "swr";

import { CreateContactForm } from "@/components/CreateContactForm";
import { ContactList } from "@/components/ContactList";
import { type Contact, fetchContacts } from "@/lib/api";

export default function ContactsPage() {
  const { data: contacts, error, mutate } = useSWR<Contact[]>("contacts", fetchContacts);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Contacts</h1>
        <p className="text-sm text-slate-400">Important people and services in one place.</p>
      </header>
      <CreateContactForm
        onCreated={async () => {
          await mutate();
        }}
      />
      {error ? (
        <div className="card text-sm text-red-400">Failed to load contacts. Ensure the backend is reachable.</div>
      ) : (
        <ContactList
          contacts={contacts ?? []}
          onDeleted={async () => {
            await mutate();
          }}
        />
      )}
    </div>
  );
}
