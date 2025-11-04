import { LoginForm } from "@/components/LoginForm";
import { config } from "@/lib/config";

export default function LoginPage() {
  if (!config.authEnabled) {
    return (
      <section className="card space-y-3">
        <h1 className="text-xl font-semibold">Authentication Disabled</h1>
        <p className="text-sm text-slate-400">
          This deployment relies on Tailscale ACLs. Enable authentication by setting <code>APP_AUTH_ENABLED=true</code> in the environment.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-slate-400">Access dashboard features with email and password.</p>
      </header>
      <LoginForm />
    </div>
  );
}

