"use client";

import { useState } from "react";

import { createTodo, type Todo } from "@/lib/api";

type Props = {
  onCreated?: (todo: Todo) => void | Promise<void>;
};

export function CreateTodoForm({ onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const [listId, setListId] = useState("");
  const [repeatRule, setRepeatRule] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const todo = await createTodo({
        title,
        due: due ? new Date(due).toISOString() : undefined,
        list_id: listId || undefined,
        repeat_rule: repeatRule || undefined
      });
      setTitle("");
      setDue("");
      setListId("");
      setRepeatRule("");
      setSuccess("ToDo を追加しました");
      await onCreated?.(todo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-lg font-semibold">ToDo を追加</h2>
        <p className="text-xs text-slate-400">締切やリスト名を追加できます。</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-400" htmlFor="todo-title">
            タイトル
          </label>
          <input
            id="todo-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="例: 牛乳を買う"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-400" htmlFor="todo-due">
              締切
            </label>
            <input
              id="todo-due"
              type="datetime-local"
              value={due}
              onChange={(event) => setDue(event.target.value)}
              className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400" htmlFor="todo-list">
              リスト名
            </label>
            <input
              id="todo-list"
              value={listId}
              onChange={(event) => setListId(event.target.value)}
              className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="買い物 / 家事 など"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400" htmlFor="todo-repeat">
            繰り返しルール
          </label>
          <input
            id="todo-repeat"
            value={repeatRule}
            onChange={(event) => setRepeatRule(event.target.value)}
            className="mt-1 w-full rounded border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            placeholder="毎週月曜 など"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "保存中..." : "ToDo を追加"}
        </button>
      </form>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {success ? <p className="text-xs text-emerald-400">{success}</p> : null}
    </section>
  );
}

