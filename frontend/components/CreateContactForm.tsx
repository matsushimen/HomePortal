"use client";

import { useState } from "react";

import { createContact, type Contact } from "@/lib/api";

type Props = {
  onCreated?: (contact: Contact) => void | Promise<void>;
};

export function CreateContactForm({ onCreated }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("家庭");
  const [phone, setPhone] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [hours, setHours] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const contact = await createContact({
        name,
        category,
        phone: phone || undefined,
        url: url || undefined,
        notes: notes || undefined,
        hours: hours || undefined
      });
      setName("");
      setPhone("");
      setUrl("");
      setNotes("");
      setHours("");
      setSuccess("連絡先を追加しました");
      await onCreated?.(contact);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-lg font-semibold">連絡先を追加</h2>
        <p className="text-xs text-slate-400">電話番号やメモも登録できます。</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-400" htmlFor="contact-name">
            名称
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="例: 小学校"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400" htmlFor="contact-category">
            カテゴリ
          </label>
          <input
            id="contact-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="家庭 / 医療 / 行政 など"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-400" htmlFor="contact-phone">
              電話番号
            </label>
            <input
              id="contact-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="000-0000-0000"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400" htmlFor="contact-hours">
              受付時間
            </label>
            <input
              id="contact-hours"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="平日 9:00-17:00"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400" htmlFor="contact-url">
            Web サイト
          </label>
          <input
            id="contact-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            type="url"
            className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400" htmlFor="contact-notes">
            メモ
          </label>
          <textarea
            id="contact-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="共有事項を入力"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "保存中..." : "連絡先を追加"}
        </button>
      </form>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {success ? <p className="text-xs text-emerald-400">{success}</p> : null}
    </section>
  );
}

