"use client";

import { useState } from "react";
import clsx from "clsx";

import { completeTodo, deleteTodo, type Todo } from "@/lib/api";

type Props = {
  todos: Todo[];
  heading?: string;
  onChanged?: () => Promise<void> | void;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "";
  }
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit"
  }).format(new Date(value));
}

export function TodoList({ todos, heading = "ToDo", onChanged }: Props) {
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const interactive = typeof onChanged === "function";

  const handleDelete = async (id: number) => {
    if (!interactive) {
      return;
    }
    if (!window.confirm("このToDoを削除しますか？")) {
      return;
    }
    setPendingId(id);
    setError(null);
    try {
      await deleteTodo(id);
      await onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setPendingId(null);
    }
  };

  const handleComplete = async (id: number) => {
    if (!interactive) {
      return;
    }
    setPendingId(id);
    setError(null);
    try {
      await completeTodo(id);
      await onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{heading}</h2>
        <span className="text-xs text-slate-400">{todos.length} items</span>
      </div>
      <ul className="mt-4 space-y-2">
        {todos.map((todo) => {
          const isDone = todo.status === "done";
          const isPending = pendingId === todo.id;
          return (
            <li key={todo.id} className="flex items-center gap-3 rounded border border-slate-800/60 px-3 py-2">
              <span
                aria-label={isDone ? "Completed" : "Open"}
                className={clsx(
                  "h-3 w-3 rounded-full border-2",
                  isDone ? "border-emerald-400 bg-emerald-400" : "border-slate-500"
                )}
              />
              <div className="flex-1">
                <p className={clsx("text-sm", isDone && "line-through text-slate-500")}>{todo.title}</p>
                {todo.due ? <span className="text-xs text-slate-400">Due {formatDate(todo.due)}</span> : null}
              </div>
              <div className="flex items-center gap-2 text-xs">
                {interactive ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleComplete(todo.id)}
                      disabled={isDone || isPending}
                      className="rounded border border-emerald-400 px-3 py-1 text-emerald-300 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDone ? "完了済" : isPending ? "処理中" : "完了"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(todo.id)}
                      disabled={isPending}
                      className="rounded border border-red-400 px-3 py-1 text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPending ? "処理中" : "削除"}
                    </button>
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}
    </section>
  );
}
