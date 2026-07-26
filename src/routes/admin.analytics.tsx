import { createFileRoute } from "@tanstack/react-router";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { salesSeries, products } from "@/lib/data";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Total Revenue", inr(486200)],
          ["Avg Order Value", inr(1140)],
          ["Conversion", "4.2%"],
          ["Return Rate", "1.1%"],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="text-xs font-semibold uppercase text-muted-foreground">{l}</div>
            <div className="mt-1 text-2xl font-extrabold">{v}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-bold uppercase tracking-widest">Revenue Trend</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer>
            <AreaChart data={salesSeries}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-bold uppercase tracking-widest">Top Selling</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {products.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span className="truncate">{p.name}</span>
                <span className="font-bold">{p.reviewsCount}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-bold uppercase tracking-widest">Low Stock</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {products.slice(0, 6).map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span className="truncate">{p.name}</span>
                <span className="font-bold text-sale">{p.stock}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
