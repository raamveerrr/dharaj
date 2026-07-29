import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { AuthShell, AuthField, AuthButton } from "@/components/auth/AuthShell";
import { getFirebaseAuth, firebaseAuthErrorMessage } from "@/lib/firebase";

const searchSchema = z.object({
  oobCode: z.string().optional(),
  mode: z.string().optional(),
});

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Reset Password — DHARAJ" },
      { name: "description", content: "Set a new password for your DHARAJ account." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const { oobCode } = Route.useSearch();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [validEmail, setValidEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setVerifying(false);
      return;
    }
    verifyPasswordResetCode(getFirebaseAuth(), oobCode)
      .then((email) => setValidEmail(email))
      .catch((err) => toast.error(firebaseAuthErrorMessage(err)))
      .finally(() => setVerifying(false));
  }, [oobCode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");
    if (!oobCode) return;
    setLoading(true);
    try {
      await confirmPasswordReset(getFirebaseAuth(), oobCode, password);
      toast.success("Password updated. Please sign in.");
      navigate({ to: "/auth/login" });
    } catch (err) {
      toast.error(firebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle={validEmail ? `for ${validEmail}` : "Set a new password to sign back in."}
      footer={
        <Link to="/auth/login" className="font-semibold text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {verifying ? (
        <p className="text-center text-sm text-muted-foreground">Verifying link…</p>
      ) : !oobCode || !validEmail ? (
        <div className="rounded-2xl bg-destructive/5 p-5 text-center text-sm">
          <p className="font-semibold text-foreground">Invalid or expired link</p>
          <p className="mt-2 text-muted-foreground">
            Please request a new{" "}
            <Link to="/auth/forgot-password" className="font-semibold text-primary hover:underline">
              password reset link
            </Link>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <AuthField
            id="password"
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <AuthField
            id="confirm"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <AuthButton type="submit" loading={loading}>
            Update password
          </AuthButton>
        </form>
      )}
    </AuthShell>
  );
}
