import { createFileRoute } from "@tanstack/react-router";
import { customers } from "@/lib/data";
import { inr } from "@/lib/format";
import { DataTable } from "@/components/admin/DataTable";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminCustomers,
});

function AdminCustomers() {
  return (
    <DataTable
      columns={[
        {
          key: "name",
          label: "Customer",
          render: (c) => (
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {c.name[0]}
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
