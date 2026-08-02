import { Outlet, createFileRoute, useRouterState, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Leaf } from "lucide-react";
import { toast } from "sonner";
import { ClientOnly } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AuthInit } from "@/components/auth/AuthInit";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { useAuth } from "@/stores/auth";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

const titles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/categories": "Categories",
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
      <ProtectedAdminRoute />
    </ClientOnly>
  );
}

function ProtectedAdminRoute() {
  const { user, profile, loading } = useAuth();
  const logout = useAuth((s) => s.logout);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const isLoginRoute = pathname === "/admin/login";
  const inAdminArea = pathname.startsWith("/admin");

  useEffect(() => {
    if (!inAdminArea || isLoginRoute || loading) return;

    const redirectToLogin = async () => {
      try {
        if (user && (!profile || profile.role !== "admin")) {
          await logout();
        }
      } finally {
        navigate({ to: "/auth/login", replace: true });
      }
    };

    if (!user) {
      navigate({ to: "/auth/login", replace: true });
      return;
    }

    if (!profile || profile.role !== "admin") {
      toast.error("Access Denied", {
        description: "This area is restricted to administrators.",
      });
      redirectToLogin();
    }
  }, [inAdminArea, isLoginRoute, loading, user, profile, logout, navigate]);

  if (isLoginRoute) return <Outlet />;
  if (loading || !user || !profile || profile.role !== "admin") {
    return <LoadingScreen label="Redirecting to admin login…" />;
  }

  return <AdminLayout />;
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
