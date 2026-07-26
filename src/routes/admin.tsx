import { Outlet, createFileRoute, useRouterState, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Leaf } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const titles: Record<string, string> = {
  "/admin": "Dashboard",
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
