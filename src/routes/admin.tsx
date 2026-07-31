import { Outlet, createFileRoute, useRouterState, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Leaf, ShieldAlert, LogOut } from "lucide-react";
import { toast } from "sonner";
import { ClientOnly } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AuthInit } from "@/components/auth/AuthInit";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { useAuth } from "@/stores/auth";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

const titles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/coupons": "Coupons",
  "/admin/homepage": "Homepage",
  "/admin/reviews": "Reviews",
  "/admin/inventory": "Inventory",
  "/admin/analytics": "Analytics",
  "/admin/settings": "Settings",
};

function AdminRoute() {
  return (
    <ClientOnly fallback={<LoadingScreen label="Loading admin…" />}>
      <AuthInit />
      <AdminGate />
    </ClientOnly>
  );
}

function AdminGate() {
  const { user, profile, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isLoginRoute = pathname === "/admin/login";
  // While navigating away from /admin/* this component can still be mounted for
  // one render — never redirect back into the admin area in that case.
  const inAdminArea = pathname.startsWith("/admin");

  useEffect(() => {
    if (loading || isLoginRoute || !inAdminArea) return;
    if (!user) {
      navigate({ to: "/admin/login", replace: true });
      return;
    }
    if (profile && profile.role !== "admin") {
      toast.error("Access Denied", {
        description: "This area is restricted to administrators.",
      });
      const t = setTimeout(() => navigate({ to: "/profile", replace: true }), 1800);
      return () => clearTimeout(t);
    }
  }, [loading, user, profile, isLoginRoute, inAdminArea, navigate]);


  // The admin login screen renders itself, outside the gate.
  if (isLoginRoute) return <Outlet />;
  if (loading) return <LoadingScreen label="Loading admin…" />;
  if (!user) return <LoadingScreen label="Redirecting…" />;
  if (profile?.role !== "admin") return <NotAuthorizedScreen />;
  return <AdminLayout />;
}

function NotAuthorizedScreen() {
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);
  return (
    <AuthShell
      title="Access Denied"
      subtitle={user?.email ? `${user.email} is not an admin.` : "Unauthorized access."}
      footer={
        <Link to="/auth/login" className="font-semibold text-primary hover:underline">
          Back to login page
        </Link>
      }
    >
      <div className="mb-5 grid place-items-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
      </div>
      <p className="mb-5 text-center text-sm text-muted-foreground">
        Unauthorized access. This dashboard is restricted to administrators.
      </p>
      <div className="space-y-3">
        <Link
          to="/auth/login"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Back to login page
        </Link>
        <Link
          to="/profile"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-secondary"
        >
          Go to my profile
        </Link>
        <button
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-secondary"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </AuthShell>
  );
}

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title = titles[pathname] ?? "Admin";

  return (
    <div className="flex min-h-dvh bg-secondary/30">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground lg:hidden"
            >
              <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-turmeric text-foreground">
                  <Leaf className="h-5 w-5" />
                </span>
                <span className="text-lg font-extrabold">DHARAJ</span>
                <button onClick={() => setMobileOpen(false)} className="ml-auto" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-2 text-sm">
                {Object.entries(titles).map(([to, label]) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="mb-1 block rounded-xl px-3 py-2.5 font-medium hover:bg-sidebar-accent"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onMenu={() => setMobileOpen(true)} title={title} />
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
