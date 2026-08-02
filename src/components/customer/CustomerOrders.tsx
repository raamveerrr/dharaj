import { useState } from "react";
import { Copy, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { inr } from "@/lib/format";
import { useMyOrders } from "@/hooks/useOrders";
import { buildReceipt } from "@/lib/whatsapp";
import type { Order } from "@/types/order";

export function CustomerOrders({ userId }: { userId?: string }) {
  const { data: orders = [], isLoading, isError } = useMyOrders(userId);
  const [receipt, setReceipt] = useState<Order | null>(null);

  if (!userId) {
    return <p className="text-sm text-muted-foreground">Sign in to see your orders.</p>;
  }
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading your orders…</p>;
  if (isError) return <p className="text-sm text-sale">Could not load your orders. Please retry.</p>;
  if (orders.length === 0)
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        You haven’t placed any orders yet.
      </div>
    );

  return (
    <>
      <ul className="divide-y divide-border">
        {orders.map((o) => (
          <li key={o.orderId} className="space-y-2 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-bold">{o.orderId}</div>
                <div className="text-xs text-muted-foreground">
                  {o.createdAt ? o.createdAt.toLocaleString("en-IN") : "—"} · {o.items.length} items
                </div>
              </div>
              <div className="text-sm font-bold text-primary">{inr(o.total)}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {o.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                Payment: {o.paymentStatus}
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {o.orderStatus}
              </span>
              <button
                onClick={() => setReceipt(o)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-bold hover:bg-secondary"
              >
                <FileText className="h-3.5 w-3.5" /> Receipt
              </button>
            </div>
          </li>
        ))}
      </ul>

      {receipt && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setReceipt(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest">Order Receipt</h3>
              <button onClick={() => setReceipt(null)} className="rounded-full p-2 hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <pre className="mt-3 max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-xl bg-secondary/60 p-4 text-xs leading-relaxed">
{buildReceipt(receipt)}
            </pre>
            <button
              onClick={() => {
                void navigator.clipboard?.writeText(buildReceipt(receipt));
                toast.success("Receipt copied");
              }}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-xs font-bold text-primary-foreground"
            >
              <Copy className="h-3.5 w-3.5" /> Copy receipt
            </button>
          </div>
        </div>
      )}
    </>
  );
}
