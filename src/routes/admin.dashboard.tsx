import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, IndianRupee, Package, ShoppingCart, Users } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { orders, products, salesSeries } from "@/lib/data";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — DHARAJ" },
      { name: "description", content: "Overview of revenue, orders and inventory." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const stats = [
    { i: IndianRupee, l: "Revenue (7d)", v: inr(137000), c: "+12.4%" },
    { i: ShoppingCart, l: "Orders", v: 361, c: "+8.1%" },
    { i: Users, l: "Customers", v: 1284, c: "+3.6%" },
    { i: Package, l: "Products", v: products.length, c: "" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.i;
          return (
            <div key={s.l} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                {s.c && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    <ArrowUpRight className="h-3 w-3" />
                    {s.c}
                  </span>
                )}
              </div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {s.l}
              </div>
              <div className="mt-1 text-2xl font-extrabold">{s.v}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-bold uppercase tracking-widest">Revenue</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <LineChart data={salesSeries}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-bold uppercase tracking-widest">Orders</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={salesSeries}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="orders" fill="var(--turmeric)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-bold uppercase tracking-widest">Recent Orders</h3>
          <table className="mt-4 w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="pb-2 text-left font-medium">Order</th>
                <th className="pb-2 text-left font-medium">Customer</th>
                <th className="pb-2 text-left font-medium">Status</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td className="py-2 font-semibold">{o.id}</td>
                  <td className="py-2 text-muted-foreground">{o.customer}</td>
                  <td className="py-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{o.status}</span>
                  </td>
                  <td className="py-2 text-right font-semibold">{inr(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-bold uppercase tracking-widest">Top Products</h3>
          <ul className="mt-4 space-y-3">
            {products.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between text-sm">
                <span className="truncate font-medium">{p.name}</span>
                <span className="text-muted-foreground">{p.reviewsCount} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
