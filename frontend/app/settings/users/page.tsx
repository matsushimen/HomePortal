import { fetchMe } from "@/lib/api";
import { config } from "@/lib/config";

async function fetchUsers() {
  const response = await fetch(`${config.apiBase}/users`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to load users");
  }
  return response.json() as Promise<{ id: number; name: string; role: string; email: string | null }[]>;
}

export default async function UsersSettingsPage() {
  const [currentUser, users] = await Promise.all([
    fetchMe().catch(() => ({ id: 0, name: "Household", role: "admin", email: null })),
    fetchUsers().catch(() => [])
  ]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-slate-400">
          Manage household roles. Toggle authentication via <code>APP_AUTH_ENABLED</code>.
        </p>
      </header>
      <section className="card space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Current Session</h2>
          <p className="text-sm text-slate-400">{currentUser.name}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Household Members</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {users.map((user) => (
              <li key={user.id} className="flex items-center justify-between rounded border border-slate-800/60 px-3 py-2">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email ?? "No email"}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs uppercase tracking-wide">
                  {user.role}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
