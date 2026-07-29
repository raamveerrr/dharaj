import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { AuthShell, AuthButton } from "@/components/auth/AuthShell";
import { useAuth } from "@/stores/auth";

export const Route = createFileRoute("/auth/session-expired")({
  head: () => ({
    meta: [
      { title: "Session Expired — DHARAJ" },
      { name: "description", content: "Your session has expired. Please sign in again." },
    ],
  }),
  component: SessionExpiredPage,
});

function SessionExpiredPage() {
  const navigate = useNavigate();
  const clear = useAuth((s) => s.clearSessionExpired);

  return (
    <AuthShell title="Session expired" subtitle="For your security, we've signed you out.">
      <div className="mb-5 grid place-items-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-turmeric/30 text-foreground">
          <Clock className="h-7 w-7" />
        </div>
      </div>
      <p className="mb-5 text-center text-sm text-muted-foreground">
        Please sign in again to continue where you left off.
      </p>
      <AuthButton
        onClick={() => {
          clear();
          navigate({ to: "/auth/login" });
        }}
      >
        Sign in again
      </AuthButton>
    </AuthShell>
  );
}
