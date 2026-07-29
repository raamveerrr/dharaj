import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { AuthInit } from "@/components/auth/AuthInit";
import { LoadingScreen } from "@/components/auth/LoadingScreen";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <ClientOnly fallback={<LoadingScreen />}>
      <AuthInit />
      <Outlet />
    </ClientOnly>
  );
}
