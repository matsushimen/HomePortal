const isServer = typeof window === "undefined";

const serverApiBase =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://backend:8000";

const clientApiBase = process.env.NEXT_PUBLIC_API_BASE ?? "/api";

const apiBase = isServer ? serverApiBase : clientApiBase;

export const config = {
  apiBase,
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "HomePortal",
  authEnabled: (process.env.NEXT_PUBLIC_APP_AUTH_ENABLED ?? process.env.APP_AUTH_ENABLED ?? "false") === "true"
};
