"use client";

import { useState } from "react";

import { createLink, type Link } from "@/lib/api";

type Props = {
  defaultTags?: string[];
  onCreated?: (link: Link) => void | Promise<void>;
};

const parseTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export function CreateLinkForm({ defaultTags = [], onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tagsInput, setTagsInput] = useState(defaultTags.join(", "));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const link = await createLink({
        title,
        url,
        tags: parseTags(tagsInput)
      });
      setTitle("");
      setUrl("");
      setTagsInput(defaultTags.join(", "));
      setSuccess("リンクを追加しました");
      await onCreated?.(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-lg font-semibold">リンクを追加</h2>
        <p className="text-xs text-slate-400">タイトルと URL を入力して保存します。</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-400" htmlFor="link-title">
            タイトル
          </label>
          <input
            id="link-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="例: 家族カレンダー"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400" htmlFor="link-url">
            URL
          </label>
          <input
            id="link-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            required
            type="url"
            className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400" htmlFor="link-tags">
            タグ（カンマ区切り）
          </label>
          <input
            id="link-tags"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="family, calendar"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "保存中..." : "リンクを追加"}
        </button>
      </form>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {success ? <p className="text-xs text-emerald-400">{success}</p> : null}
    </section>
  );
}

