"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

import { CreateLinkForm } from "@/components/CreateLinkForm";
import { LinkList } from "@/components/LinkList";
import { SearchInput } from "@/components/SearchInput";
import { Link, fetchLinks, searchLinks } from "@/lib/api";

export default function LinksPage() {
  return (
    <Suspense fallback={<LinksPageSkeleton />}>
      <LinksPageContent />
    </Suspense>
  );
}

function LinksPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";
  const initialTags = searchParams.getAll("tags");
  const [query, setQuery] = useState(initialQuery);
  const [tags, setTags] = useState(initialTags.join(","));

  const swrKey: [string, string, string] = ["links", initialQuery, initialTags.sort().join(",")];
  const { data: links, error, mutate } = useSWR<Link[]>(
    swrKey,
    async () => {
      if (initialQuery || initialTags.length > 0) {
        return searchLinks(initialQuery || undefined, initialTags);
      }
      return fetchLinks();
    }
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    const normalizedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    normalizedTags.forEach((tag) => params.append("tags", tag));
    router.push(`/links?${params.toString()}`);
  };

  const activeTags = useMemo(
    () => initialTags.map((tag) => tag.trim()).filter(Boolean),
    [initialTags]
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Links</h1>
          <p className="text-sm text-slate-400">Search, filter, and launch your family resources.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
          <SearchInput value={query} onChange={setQuery} placeholder="Search links" />
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Tags comma separated"
            className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="submit"
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-light"
          >
            Apply
          </button>
        </form>
      </header>
      <CreateLinkForm
        defaultTags={initialTags}
        onCreated={async () => {
          await mutate();
        }}
      />
      {activeTags.length > 0 ? (
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          {activeTags.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-800 px-3 py-1">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
      {error ? (
        <div className="card text-sm text-red-400">Failed to load links. Ensure the backend is reachable.</div>
      ) : (
        <LinkList
          links={links ?? []}
          heading="All Links"
          onDeleted={async () => {
            await mutate();
          }}
        />
      )}
    </div>
  );
}

function LinksPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-800/50" />
      <div className="card space-y-3">
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-800/50" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800/50" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800/50" />
      </div>
    </div>
  );
}
