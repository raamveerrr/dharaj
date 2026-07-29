import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AuthShell, AuthField, AuthButton } from "@/components/auth/AuthShell";
import { useAuth } from "@/stores/auth";
import { firebaseAuthErrorMessage } from "@/lib/firebase";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — DHARAJ" },
      { name: "description", content: "Reset your DHARAJ account password." },
    ],
  }),
  component: ForgotPage,
});

function ForgotPage() {
  const sendReset = useAuth((s) => s.sendReset);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await sendReset(email.trim());
      setSent(true);
      toast.success("Reset link sent. Check your inbox.");
    } catch (err) {
      toast.error(firebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/auth/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="rounded-2xl bg-primary/5 p-5 text-center text-sm">
          <p className="font-semibold text-foreground">Check your email</p>
          <p className="mt-2 text-muted-foreground">
            We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>
      ) : (
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
          <AuthButton type="submit" loading={loading}>
            Send reset link
          </AuthButton>
        </form>
      )}
    </AuthShell>
  );
}
