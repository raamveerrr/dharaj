import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthShell, AuthField, AuthButton } from "@/components/auth/AuthShell";
import { AuthInit } from "@/components/auth/AuthInit";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { useAuth } from "@/stores/auth";
import { firebaseAuthErrorMessage } from "@/lib/firebase";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — DHARAJ" },
      { name: "description", content: "Restricted staff sign in for the DHARAJ admin dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <ClientOnly fallback={<LoadingScreen label="Loading…" />}>
      <AuthInit />
      <AdminLoginPage />
    </ClientOnly>
  ),
});

function AdminLoginPage() {
  const login = useAuth((s) => s.login);
  const logout = useAuth((s) => s.logout);
  const profile = useAuth((s) => s.profile);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in as an admin → straight to the dashboard.
  useEffect(() => {
    if (user && profile?.role === "admin") {
      navigate({ to: "/admin/dashboard", replace: true });
    }
  }, [user, profile, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      const p = useAuth.getState().profile;
      if (p?.role === "admin") {
        toast.success("Welcome back, admin.");
        navigate({ to: "/admin/dashboard", replace: true });
      } else {
        toast.error("Unauthorized access.");
        await logout();
      }
    } catch (err) {
      toast.error(firebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Admin Sign In"
      subtitle="Restricted area — authorized staff only."
      footer={
        <Link to="/auth/login" className="font-semibold text-primary hover:underline">
          Customer login
        </Link>
      }
    >
      <form onSubmit={onSubmit}>
        <AuthField
          id="admin-email"
          label="Admin email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          id="admin-password"
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <AuthButton type="submit" loading={loading}>
          Sign in to dashboard
        </AuthButton>
      </form>
    </AuthShell>
  );
}
