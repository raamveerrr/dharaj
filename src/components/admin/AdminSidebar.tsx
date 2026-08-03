import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Box,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  Leaf,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Ticket,
  Users,
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof Home; exact?: boolean };
const items: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/categories", label: "Categories", icon: Package },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/homepage", label: "Homepage", icon: Home },
  { to: "/admin/branding", label: "Branding", icon: ImageIcon },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },

  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all lg:flex",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-turmeric text-foreground">
          <Leaf className="h-5 w-5" />
        </span>
        {!collapsed && <span className="text-lg font-extrabold tracking-tight">DHARAJ</span>}
        <button
          onClick={onToggle}
          className="ml-auto grid h-8 w-8 place-items-center rounded-full hover:bg-sidebar-accent"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to as any}
              className={cn(
                "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-turmeric text-foreground"
                  : "hover:bg-sidebar-accent",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{it.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-2">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        <Link
          to="/"
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent"
        >
          <Box className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && <span>View storefront</span>}
        </Link>
      </div>
    </aside>
  );
}
