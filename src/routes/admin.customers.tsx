import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { inr } from "@/lib/format";
import { DataTable } from "@/components/admin/DataTable";
import { CustomerService } from "@/services/customerService";
import type { Customer } from "@/types/customer";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await CustomerService.listCustomers();
        if (active) setCustomers(data);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  return loading ? (
    <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
      Loading customers...
    </div>
  ) : (
    <DataTable
      columns={[
        {
          key: "name",
          label: "Customer",
          render: (c) => (
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {c.name?.[0] ?? "C"}
              </div>
              <div>
                <div className="font-semibold">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.email}</div>
              </div>
            </div>
          ),
        },
        { key: "phone", label: "Phone" },
        { key: "orders", label: "Orders" },
        { key: "spent", label: "Total Spent", render: (c) => inr(c.spent) },
        { key: "joined", label: "Joined" },
        {
          key: "status",
          label: "Status",
          render: (c) => (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                c.status === "active" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}
            >
              {c.status}
            </span>
          ),
        },
      ]}
      rows={customers}
    />
  );
}
