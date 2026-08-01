import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { inr } from "@/lib/format";
import { DataTable } from "@/components/admin/DataTable";
import { cn } from "@/lib/utils";
import { OrderService } from "@/services/orderService";
import type { Order } from "@/types/order";

const statuses: Order["status"][] = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled", "Returned"];

const statusColor: Record<Order["status"], string> = {
  Pending: "bg-turmeric/20 text-brown",
  Confirmed: "bg-primary/15 text-primary",
  Packed: "bg-accent text-foreground",
  Shipped: "bg-leaf/20 text-primary",
  Delivered: "bg-primary text-primary-foreground",
  Cancelled: "bg-sale/15 text-sale",
  Returned: "bg-muted text-foreground",
};

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const [filter, setFilter] = useState<Order["status"] | "All">("All");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await OrderService.listOrders();
        if (active) setOrders(data);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const list = filter === "All" ? orders : orders.filter((o) => o.status === filter);
  return (
    <div className="space-y-4">
      <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {(["All", ...statuses] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium",
              filter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-secondary",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Loading orders...
        </div>
      ) : (
      <DataTable
        columns={[
          { key: "id", label: "Order", render: (o) => <span className="font-semibold">{o.id}</span> },
          { key: "customer", label: "Customer" },
          { key: "date", label: "Date" },
          { key: "items", label: "Items" },
          { key: "total", label: "Total", render: (o) => <span className="font-semibold">{inr(o.total)}</span> },
          {
            key: "status",
            label: "Status",
            render: (o) => (
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[o.status]}`}>
                {o.status}
              </span>
            ),
          },
        ]}
        rows={list}
      />
      )}
    </div>
  );
}
