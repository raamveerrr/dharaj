import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <div className="space-y-4">
      {[
        { t: "Store", d: "Store name, contact, tax and shipping settings" },
        { t: "Payments", d: "Payment gateways and payout preferences" },
        { t: "Shipping", d: "Delivery zones, rates and free-ship thresholds" },
        { t: "Notifications", d: "Email, SMS and WhatsApp templates" },
        { t: "Team", d: "Admin users and permissions" },
      ].map((s) => (
        <div key={s.t} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card">
          <div>
            <div className="font-bold">{s.t}</div>
            <div className="text-sm text-muted-foreground">{s.d}</div>
          </div>
          <button className="rounded-full border border-border px-4 py-1.5 text-sm font-semibold hover:bg-secondary">
            Configure
          </button>
        </div>
      ))}
    </div>
  );
}
