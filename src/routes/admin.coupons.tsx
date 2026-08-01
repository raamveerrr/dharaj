import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { DataTable } from "@/components/admin/DataTable";
import { CouponService } from "@/services/couponService";
import type { Coupon } from "@/types/coupon";

export const Route = createFileRoute("/admin/coupons")({
  head: () => ({ meta: [{ title: "Coupons — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminCoupons,
});

function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await CouponService.listCoupons();
        if (active) setCoupons(data);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>
      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Loading coupons...
        </div>
      ) : (
      <DataTable
        columns={[
          { key: "code", label: "Code", render: (c) => <span className="font-mono font-bold">{c.code}</span> },
          { key: "description", label: "Description" },
          {
            key: "discount",
            label: "Discount",
            render: (c) => (c.type === "percent" ? `${c.discount}%` : `₹${c.discount}`),
          },
          { key: "minOrder", label: "Min Order", render: (c) => `₹${c.minOrder}` },
          { key: "expiry", label: "Expires" },
          {
            key: "active",
            label: "Status",
            render: (c) => (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  c.active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {c.active ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "actions",
            label: "",
            className: "text-right",
            render: () => (
              <div className="flex justify-end gap-1">
                <button className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-full text-sale hover:bg-sale/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
        rows={coupons}
      />
      )}
    </div>
  );
}
