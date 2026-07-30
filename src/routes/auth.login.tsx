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
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back${user.displayName ? `, ${user.displayName}` : ""}!`);
      if (!user.emailVerified) {
        navigate({ to: "/auth/verify-email" });
      } else {
        navigate({ to: search.redirect ?? "/" });
      }
    } catch (err) {
      toast.error(firebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
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
