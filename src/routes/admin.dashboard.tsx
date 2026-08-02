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
import { useEffect, useMemo, useState } from "react";
import { inr } from "@/lib/format";
import { OrderService } from "@/services/orderService";
import { ProductService } from "@/services/productService";
import { CustomerService } from "@/services/customerService";
import type { Order } from "@/types/order";
import type { Product } from "@/types/product";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<{ length: number }>({ length: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [productData, orderData, customerData] = await Promise.all([
          ProductService.getProducts(),
          OrderService.listOrders(),
          CustomerService.listCustomers(),
        ]);

        if (!active) return;
        setProducts(productData);
        setOrders(orderData);
        setCustomers({ length: customerData.length });
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const salesSeries = useMemo(
    () => [
      { day: "Mon", revenue: 12400, orders: 32 },
      { day: "Tue", revenue: 15800, orders: 41 },
      { day: "Wed", revenue: 14200, orders: 38 },
      { day: "Thu", revenue: 19200, orders: 52 },
      { day: "Fri", revenue: 22800, orders: 61 },
      { day: "Sat", revenue: 28500, orders: 74 },
      { day: "Sun", revenue: 24100, orders: 63 },
    ],
    [],
  );

  const stats = [
    { i: IndianRupee, l: "Revenue (7d)", v: inr(137000), c: "+12.4%" },
    { i: ShoppingCart, l: "Orders", v: orders.length || 0, c: "+8.1%" },
    { i: Users, l: "Customers", v: customers.length || 0, c: "+3.6%" },
    { i: Package, l: "Products", v: products.length, c: "" },
  ];

  const topProducts = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);

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
          {loading ? (
            <div className="mt-4 text-sm text-muted-foreground">Loading orders...</div>
          ) : (
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
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-bold uppercase tracking-widest">Top Products</h3>
          {loading ? (
            <div className="mt-4 text-sm text-muted-foreground">Loading products...</div>
          ) : (
            <ul className="mt-4 space-y-3">
              {topProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{p.name}</span>
                  <span className="text-muted-foreground">{p.reviewCount} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
