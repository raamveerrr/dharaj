import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, AuthField, AuthButton } from "@/components/auth/AuthShell";
import { useAuth } from "@/stores/auth";
import { firebaseAuthErrorMessage } from "@/lib/firebase";

export const Route = createFileRoute("/auth/register")({
  head: () => ({
    meta: [
      { title: "Create Account — DHARAJ" },
      { name: "description", content: "Create your DHARAJ account to shop premium organic groceries." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const register = useAuth((s) => s.register);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim(), phone.trim() || undefined);
      toast.success("Account created! You can sign in now.");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(firebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join DHARAJ for pure, handmade grocery."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/auth/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit}>
        <AuthField id="name" label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
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
          id="phone"
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <AuthButton type="submit" loading={loading}>
          Create account
        </AuthButton>
      </form>
    </AuthShell>
  );
}
