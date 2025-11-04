"use client";

import useSWR from "swr";

import { CreateTodoForm } from "@/components/CreateTodoForm";
import { TodoList } from "@/components/TodoList";
import { type Todo, fetchTodos } from "@/lib/api";

export default function TodosPage() {
  const { data: todos, error, mutate } = useSWR<Todo[]>("todos", fetchTodos);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Shared Tasks</h1>
        <p className="text-sm text-slate-400">Plan chores, errands, and repeatable routines.</p>
      </header>
      <CreateTodoForm
        onCreated={async () => {
          await mutate();
        }}
      />
      {error ? (
        <div className="card text-sm text-red-400">Failed to load todos. Ensure the backend is reachable.</div>
      ) : (
        <TodoList
          todos={todos ?? []}
          onChanged={async () => {
            await mutate();
          }}
        />
      )}
    </div>
  );
}
