import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";
import { AuthShell, AuthButton } from "@/components/auth/AuthShell";
import { useAuth } from "@/stores/auth";
import { getFirebaseAuth, firebaseAuthErrorMessage } from "@/lib/firebase";

export const Route = createFileRoute("/auth/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify Email — DHARAJ" },
      { name: "description", content: "Verify your email to secure your DHARAJ account." },
    ],
  }),
  component: VerifyPage,
});

function VerifyPage() {
  const { user, logout, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  // Poll gently: reload the current user every few seconds to detect verification.
  useEffect(() => {
    const auth = getFirebaseAuth();
    const t = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          clearInterval(t);
          toast.success("Email verified!");
          navigate({ to: "/" });
        }
      }
    }, 4000);
    return () => clearInterval(t);
  }, [navigate]);

  async function onResend() {
    setResending(true);
    try {
      await resendVerification();
      toast.success("Verification email sent.");
    } catch (err) {
      toast.error(firebaseAuthErrorMessage(err));
    } finally {
      setResending(false);
    }
  }

  async function onCheck() {
    setChecking(true);
    try {
      const auth = getFirebaseAuth();
      await auth.currentUser?.reload();
      if (auth.currentUser?.emailVerified) {
        toast.success("Email verified!");
        navigate({ to: "/" });
      } else {
        toast.info("Not verified yet. Check your inbox.");
      }
    } finally {
      setChecking(false);
    }
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={user?.email ? `We sent a verification link to ${user.email}.` : "Check your inbox for the verification link."}
      footer={
        <button onClick={() => logout().then(() => navigate({ to: "/auth/login" }))} className="font-semibold text-primary hover:underline">
          Sign out
        </button>
      }
    >
      <div className="mb-5 grid place-items-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="h-7 w-7" />
        </div>
      </div>
      <p className="mb-5 text-center text-sm text-muted-foreground">
        Click the link in your email to activate your account. This page will update automatically once you verify.
      </p>
      <AuthButton type="button" onClick={onCheck} loading={checking}>
        I've verified — continue
      </AuthButton>
      <button
        onClick={onResend}
        disabled={resending}
        className="mt-3 w-full rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-secondary disabled:opacity-60"
      >
        {resending ? "Sending…" : "Resend verification email"}
      </button>
    </AuthShell>
  );
}
