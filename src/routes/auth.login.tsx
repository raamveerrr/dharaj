import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AuthShell, AuthField, AuthButton } from "@/components/auth/AuthShell";
import { useAuth } from "@/stores/auth";
import { firebaseAuthErrorMessage } from "@/lib/firebase";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign In — DHARAJ" },
      { name: "description", content: "Sign in to your DHARAJ account to track orders and manage your profile." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const login = useAuth((s) => s.login);
  const loginWithGoogle = useAuth((s) => s.loginWithGoogle);
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back${user.displayName ? `, ${user.displayName}` : ""}!`);
      navigate({ to: search.redirect ?? "/" });
    } catch (err) {
      toast.error(firebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      toast.success(`Welcome${user.displayName ? `, ${user.displayName}` : ""}!`);
      navigate({ to: search.redirect ?? "/" });
    } catch (err) {
      toast.error(firebaseAuthErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue shopping."
      footer={
        <>
          New to DHARAJ?{" "}
          <Link to="/auth/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <AuthField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="mb-5 text-right">
          <Link to="/auth/forgot-password" className="text-xs font-semibold text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <AuthButton type="submit" loading={loading}>
          Sign in
        </AuthButton>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={loading || googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-accent disabled:opacity-60"
        >
          {googleLoading ? (
            "Please wait…"
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M21.6 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.53Z"
                />
                <path
                  fill="#34A853"
                  d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.58A10 10 0 0 0 12 22Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.41 13.9a6.02 6.02 0 0 1 0-3.8V7.52H3.07a10 10 0 0 0 0 12.76l3.34-2.38Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.04c1.47 0 2.8.5 3.84 1.49l2.88-2.88A9.96 9.96 0 0 0 12 2a10 10 0 0 0-8.93 5.52l3.34 2.58C7.2 7.8 9.4 6.04 12 6.04Z"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="mt-4 text-center">
          <Link
            to="/admin/login"
            className="text-xs text-muted-foreground hover:text-primary hover:underline"
          >
            Are you an administrator?
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
