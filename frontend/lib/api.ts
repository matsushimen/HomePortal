import { config } from "./config";

async function resolveAuthToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    const match = document.cookie.split(";").find((cookie) => cookie.trim().startsWith("homeportal_token="));
    if (!match) {
      return null;
    }
    const value = match.split("=")[1];
    return value ? decodeURIComponent(value) : null;
  }
  try {
    const { cookies } = await import("next/headers");
    return cookies().get("homeportal_token")?.value ?? null;
  } catch (error) {
    return null;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  const contentType = response.headers.get("content-type") ?? "";
  if (response.status === 204 || contentType.trim() === "" || response.headers.get("content-length") === "0") {
    return undefined as T;
  }
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Authorization")) {
    const token = await resolveAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${config.apiBase}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    credentials: "include"
  });
  return handleResponse<T>(response);
}

export type Link = {
  id: number;
  title: string;
  url: string;
  tags: string[];
  click_count: number;
  last_accessed_at?: string | null;
};

export type LinkCreateRequest = {
  title: string;
  url: string;
  tags?: string[];
};

export type Contact = {
  id: number;
  name: string;
  category: string;
  phone?: string | null;
  hours?: string | null;
  url?: string | null;
  notes?: string | null;
  last_verified_at?: string | null;
};

export type ContactCreateRequest = {
  name: string;
  category: string;
  phone?: string | null;
  hours?: string | null;
  url?: string | null;
  notes?: string | null;
};

export type Todo = {
  id: number;
  title: string;
  status: "open" | "done";
  due?: string | null;
  assignee_id?: number | null;
  repeat_rule?: string | null;
  list_id?: string | null;
  completed_at?: string | null;
};

export type TodoCreateRequest = {
  title: string;
  due?: string | null;
  assignee_id?: number | null;
  repeat_rule?: string | null;
  list_id?: string | null;
};

export type CalendarEvent = {
  id: number;
  title: string;
  start: string;
  end: string;
  all_day: boolean;
  color?: string | null;
  notes?: string | null;
  created_by?: string | null;
  assignee_id?: number | null;
  source: "local" | "google" | "caldav";
};

export type EventCreateRequest = {
  title: string;
  start: string;
  end: string;
  all_day?: boolean;
  color?: string | null;
  notes?: string | null;
  created_by?: string | null;
  assignee_id?: number | null;
};

export type EventUpdateRequest = Partial<EventCreateRequest> & {
  source?: "local" | "google" | "caldav";
};

export type AssetSummaryItem = {
  month: string;
  totals: Record<string, number>;
};

export async function fetchLinks(): Promise<Link[]> {
  return apiFetch<Link[]>("/links");
}

export async function searchLinks(query?: string, tags?: string[]): Promise<Link[]> {
  const params = new URLSearchParams();
  if (query) {
    params.append("q", query);
  }
  if (tags) {
    tags.forEach((tag) => params.append("tags", tag));
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const response = await apiFetch<{ results: Link[] }>(`/links/search${suffix}`);
  return response.results;
}

export async function createLink(request: LinkCreateRequest): Promise<Link> {
  return apiFetch<Link>("/links", {
    method: "POST",
    body: JSON.stringify({
      ...request,
      tags: request.tags ?? []
    })
  });
}

export async function deleteLink(id: number): Promise<void> {
  await apiFetch<void>(`/links/${id}`, { method: "DELETE" });
}

export async function createContact(request: ContactCreateRequest): Promise<Contact> {
  return apiFetch<Contact>("/contacts", {
    method: "POST",
    body: JSON.stringify(request)
  });
}

export async function deleteContact(id: number): Promise<void> {
  await apiFetch<void>(`/contacts/${id}`, { method: "DELETE" });
}

export async function createTodo(request: TodoCreateRequest): Promise<Todo> {
  return apiFetch<Todo>("/todos", {
    method: "POST",
    body: JSON.stringify({
      ...request,
      status: "open"
    })
  });
}

export async function deleteTodo(id: number): Promise<void> {
  await apiFetch<void>(`/todos/${id}`, { method: "DELETE" });
}

export async function completeTodo(id: number): Promise<Todo> {
  return apiFetch<Todo>(`/todos/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "done" })
  });
}

export async function fetchContacts(): Promise<Contact[]> {
  return apiFetch<Contact[]>("/contacts");
}

export async function fetchTodos(): Promise<Todo[]> {
  return apiFetch<Todo[]>("/todos");
}

export async function fetchAssetSummary(): Promise<AssetSummaryItem[]> {
  const response = await apiFetch<{ items: AssetSummaryItem[] }>("/assets/summary");
  return response.items;
}

export async function fetchEvents(params?: { start?: string; end?: string }) {
  const query = new URLSearchParams();
  if (params?.start) {
    query.set("start", params.start);
  }
  if (params?.end) {
    query.set("end", params.end);
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<CalendarEvent[]>(`/events${suffix}`);
}

export async function createEvent(request: EventCreateRequest): Promise<CalendarEvent> {
  return apiFetch<CalendarEvent>("/events", {
    method: "POST",
    body: JSON.stringify(request)
  });
}

export async function updateEvent(id: number, request: EventUpdateRequest): Promise<CalendarEvent> {
  return apiFetch<CalendarEvent>(`/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(request)
  });
}

export async function deleteEvent(id: number): Promise<void> {
  await apiFetch<void>(`/events/${id}`, { method: "DELETE" });
}

export async function fetchMe() {
  return apiFetch<{ id: number; name: string; role: string; email: string | null }>("/me");
}
