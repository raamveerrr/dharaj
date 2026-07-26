import { createFileRoute } from "@tanstack/react-router";
import { Bell, MapPin, Package, Settings, User, LogOut, Heart } from "lucide-react";
import { orders } from "@/lib/data";
import { inr } from "@/lib/format";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shop/profile")({
  head: () => ({
    meta: [
      { title: "Your Account — DHARAJ" },
      { name: "description", content: "Manage orders, addresses and account settings." },
      { property: "og:title", content: "Your Account — DHARAJ" },
      { property: "og:description", content: "Orders, addresses and settings." },
    ],
  }),
  component: ProfilePage,
});

const tabs = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

function ProfilePage() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("orders");
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
          <User className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold sm:text-xl">Hi, Guest</h1>
          <p className="text-xs text-muted-foreground">Sign in to track your orders</p>
        </div>
        <button className="ml-auto rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
          Sign In
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="hide-scrollbar flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold lg:justify-start lg:rounded-xl",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground border border-border hover:bg-secondary",
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
          <button className="hidden items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground lg:flex">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </aside>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          {tab === "orders" && (
            <>
              <h2 className="text-lg font-bold">Recent Orders</h2>
              <ul className="mt-4 divide-y divide-border">
                {orders.slice(0, 5).map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <div className="text-sm font-semibold">{o.id}</div>
                      <div className="text-xs text-muted-foreground">{o.date} · {o.items} items</div>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                      {o.status}
                    </span>
                    <div className="text-sm font-bold text-primary">{inr(o.total)}</div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {tab === "wishlist" && <p className="text-sm text-muted-foreground">Your saved items appear on the Wishlist page.</p>}
          {tab === "addresses" && (
            <>
              <h2 className="text-lg font-bold">Saved Addresses</h2>
              <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No addresses yet. Add one at checkout.
              </div>
            </>
          )}
          {tab === "notifications" && (
            <>
              <h2 className="text-lg font-bold">Notifications</h2>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="rounded-xl bg-secondary/60 p-3">Your order ORD-1042 was delivered.</li>
                <li className="rounded-xl bg-secondary/60 p-3">Festive Sale is live — 15% off with DHARAJ15.</li>
              </ul>
            </>
          )}
          {tab === "settings" && (
            <>
              <h2 className="text-lg font-bold">Settings</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Profile settings will appear once you sign in.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
