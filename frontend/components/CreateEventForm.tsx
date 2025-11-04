"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

import { CalendarEvent, createEvent } from "@/lib/api";

type Props = {
  selectedDate: Date;
  onCreated?: (event: CalendarEvent) => Promise<void> | void;
};

const presetColors = ["#2563eb", "#f97316", "#10b981", "#ec4899", "#facc15", "#9333ea"];
const defaultColor: string = presetColors[0];

export function CreateEventForm({ selectedDate, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [color, setColor] = useState(defaultColor);
  const [notes, setNotes] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const defaultStart = useMemo(() => format(selectedDate, "yyyy-MM-dd'T'HH:mm"), [selectedDate]);
  const defaultEnd = useMemo(() => format(selectedDate, "yyyy-MM-dd'T'HH:mm"), [selectedDate]);
  const defaultStartDate = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);

  useEffect(() => {
    if (allDay) {
      setStartInput(defaultStartDate);
      setEndInput(defaultStartDate);
    } else {
      setStartInput(defaultStart);
      setEndInput(defaultEnd);
    }
  }, [allDay, defaultStart, defaultEnd, defaultStartDate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payloadStart = allDay ? `${startInput}T00:00:00` : startInput;
      const payloadEnd = allDay ? `${endInput}T23:59:59` : endInput;
      const created = await createEvent({
        title,
        start: payloadStart,
        end: payloadEnd,
        all_day: allDay,
        color,
        notes: notes || undefined,
        created_by: createdBy || undefined
      });
      setTitle("");
      setNotes("");
      setCreatedBy("");
      setColor(defaultColor);
      setSuccess("予定を追加しました");
      await onCreated?.(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-lg font-semibold">予定を追加</h2>
        <p className="text-xs text-slate-400">タイトルと日時を入力してください。</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="event-title" className="block text-xs font-medium text-slate-400">
            タイトル
          </label>
          <input
            id="event-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="例: 家族会議"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <input
            id="event-all-day"
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-900"
          />
          <label htmlFor="event-all-day">終日</label>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="event-start" className="block text-xs font-medium text-slate-400">
              開始
            </label>
            <input
              id="event-start"
              type={allDay ? "date" : "datetime-local"}
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              required
              className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label htmlFor="event-end" className="block text-xs font-medium text-slate-400">
              終了
            </label>
            <input
              id="event-end"
              type={allDay ? "date" : "datetime-local"}
              value={endInput}
              onChange={(e) => setEndInput(e.target.value)}
              required
              className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-slate-400">カラー</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {presetColors.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className={`h-10 w-10 rounded-full border-2 transition ${
                    color === preset ? "border-white" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: preset }}
                  aria-label={`色 ${preset}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="event-created-by" className="block text-xs font-medium text-slate-400">
              作成者
            </label>
            <input
              id="event-created-by"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="例: 母"
            />
          </div>
        </div>
        <div>
          <label htmlFor="event-notes" className="block text-xs font-medium text-slate-400">
            メモ
          </label>
          <textarea
            id="event-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="詳細を入力"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "保存中..." : "予定を追加"}
        </button>
      </form>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {success ? <p className="text-xs text-emerald-400">{success}</p> : null}
    </section>
  );
}
