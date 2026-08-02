import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { inr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { OrderService } from "@/services/orderService";
import { useAllOrders } from "@/hooks/useOrders";
import { ORDER_STATUSES, type Order, type OrderStatus, type PaymentStatus } from "@/types/order";

const statusColor: Record<OrderStatus, string> = {
  Pending: "bg-turmeric/20 text-brown",
  Confirmed: "bg-primary/15 text-primary",
  Packed: "bg-accent text-foreground",
  Shipped: "bg-leaf/20 text-primary",
  Delivered: "bg-primary text-primary-foreground",
  Cancelled: "bg-sale/15 text-sale",
};

const payColor: Record<PaymentStatus, string> = {
  "Awaiting Payment": "bg-turmeric/20 text-brown",
  Paid: "bg-primary text-primary-foreground",
  Rejected: "bg-sale/15 text-sale",
};

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const [filter, setFilter] = useState<OrderStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const { data: orders = [], isLoading, isError, error } = useAllOrders();

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === "All" || o.orderStatus === filter) &&
        (!q ||
          o.orderId.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q)),
    );
  }, [orders, filter, search]);

  const open = orders.find((o) => o.orderId === openId) ?? null;

  const run = async (id: string, label: string, fn: () => Promise<void>) => {
    setBusy(id);
    try {
      await fn();
      toast.success(label);
    } catch (err) {
      toast.error((err as Error)?.message ?? "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const setOrderStatus = (o: Order, s: OrderStatus) =>
    run(o.orderId, `${o.orderId} marked ${s}`, () => OrderService.setOrderStatus(o.orderId, s));
  const setPayment = (o: Order, s: PaymentStatus) =>
    run(o.orderId, `${o.orderId} payment ${s}`, () => OrderService.setPaymentStatus(o.orderId, s));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order ID, customer or phone…"
          className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:border-primary sm:max-w-xs"
        />
      </div>
      <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {(["All", ...ORDER_STATUSES] as const).map((s) => (
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

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Loading orders…
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-sale/40 bg-sale/5 p-4 text-sm text-sale">
          Could not load orders. {(error as Error)?.message}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No orders yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                {["Order", "Customer", "Phone", "Products", "Total", "Created", "Payment", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((o) => (
                <tr key={o.orderId} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 font-semibold">{o.orderId}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {o.items.length} item{o.items.length === 1 ? "" : "s"}
                  </td>
                  <td className="px-4 py-3 font-semibold">{inr(o.total)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {o.createdAt ? o.createdAt.toLocaleString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${payColor[o.paymentStatus]}`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[o.orderStatus]}`}>
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setOpenId(o.orderId)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-bold hover:bg-secondary"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm" onClick={() => setOpenId(null)}>
          <div
            className="h-full w-full max-w-md overflow-y-auto bg-background p-5 shadow-xl sm:rounded-l-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">{open.orderId}</h2>
              <button onClick={() => setOpenId(null)} className="rounded-full p-2 hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-1 rounded-2xl border border-border bg-card p-4 text-sm">
              <div className="font-bold">{open.customerName}</div>
              <div className="text-muted-foreground">{open.phone}</div>
              <div className="text-muted-foreground">{open.email}</div>
              <div className="pt-2 text-muted-foreground">
                {open.address}, {open.city}, {open.state} — {open.pincode}
                {open.landmark ? ` (${open.landmark})` : ""}
              </div>
              {open.notes && <div className="pt-2 text-xs text-muted-foreground">Notes: {open.notes}</div>}
            </div>

            <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
              {open.items.map((it) => (
                <li key={it.productId} className="flex items-center gap-3 p-3 text-sm">
                  {it.image ? (
                    <img src={it.image} alt={it.productName} className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-secondary" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{it.productName}</div>
                    <div className="text-xs text-muted-foreground">
                      {inr(it.price)} × {it.quantity}
                    </div>
                  </div>
                  <div className="font-semibold">{inr(it.subtotal)}</div>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-1.5 rounded-2xl border border-border bg-card p-4 text-sm">
              <Row k="Subtotal" v={inr(open.subtotal)} />
              <Row k="Delivery" v={open.deliveryCharge === 0 ? "Free" : inr(open.deliveryCharge)} />
              {open.discount > 0 && <Row k="Discount" v={`− ${inr(open.discount)}`} />}
              <Row k="Total" v={inr(open.total)} bold />
              <Row k="WhatsApp sent" v={open.whatsappSent ? "Yes" : "No"} />
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Action onClick={() => setPayment(open, "Paid")} busy={busy === open.orderId} label="Verify Payment" primary />
                  <Action onClick={() => setPayment(open, "Rejected")} busy={busy === open.orderId} label="Reject Payment" danger />
                  <Action onClick={() => setPayment(open, "Awaiting Payment")} busy={busy === open.orderId} label="Awaiting" />
                </div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Order</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Action onClick={() => setOrderStatus(open, "Confirmed")} busy={busy === open.orderId} label="Confirm" primary />
                  <Action onClick={() => setOrderStatus(open, "Packed")} busy={busy === open.orderId} label="Pack" />
                  <Action onClick={() => setOrderStatus(open, "Shipped")} busy={busy === open.orderId} label="Ship" />
                  <Action onClick={() => setOrderStatus(open, "Delivered")} busy={busy === open.orderId} label="Deliver" />
                  <Action onClick={() => setOrderStatus(open, "Cancelled")} busy={busy === open.orderId} label="Cancel" danger />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Action({
  label,
  onClick,
  busy,
  primary,
  danger,
}: {
  label: string;
  onClick: () => void;
  busy?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold disabled:opacity-60",
        primary
          ? "bg-primary text-primary-foreground hover:bg-primary-hover"
          : danger
            ? "border border-sale/40 bg-sale/10 text-sale"
            : "border border-border bg-card hover:bg-secondary",
      )}
    >
      {busy && <Loader2 className="h-3 w-3 animate-spin" />}
      {label}
    </button>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-extrabold" : ""}`}>
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}
