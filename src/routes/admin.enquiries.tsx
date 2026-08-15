import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Eye, Loader2, Trash2, X, Search } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { EnquiryService } from "@/services/enquiryService";
import { ENQUIRY_STATUSES, type BusinessEnquiry, type EnquiryStatus } from "@/types/enquiry";
import { useAuth } from "@/stores/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/enquiries")({
  head: () => ({
    meta: [{ title: "Enquiries — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminEnquiries,
});

const statusClass: Record<EnquiryStatus, string> = {
  New: "bg-turmeric/20 text-foreground",
  Contacted: "bg-primary/15 text-primary",
  Closed: "bg-secondary text-muted-foreground",
};

function formatDate(date?: Date) {
  if (!date) return "—";
  return date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function AdminEnquiries() {
  const [rows, setRows] = useState<BusinessEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<EnquiryStatus | "All">("All");
  const [selected, setSelected] = useState<BusinessEnquiry | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { user, profile, loading: authLoading } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      setRows(await EnquiryService.listEnquiries());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !user || !profile || profile.role !== "admin") {
      return;
    }
    void load();
  }, [authLoading, user, profile]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "All" && r.status !== filter) return false;
      if (!q) return true;
      return [r.name, r.company, r.email, r.phone, r.city, r.state, r.enquiryType, r.message]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, search, filter]);

  const changeStatus = async (enquiry: BusinessEnquiry, status: EnquiryStatus) => {
    setBusyId(enquiry.id);
    try {
      await EnquiryService.updateStatus(enquiry.id, status);
      setRows((prev) => prev.map((r) => (r.id === enquiry.id ? { ...r, status } : r)));
      setSelected((s) => (s && s.id === enquiry.id ? { ...s, status } : s));
      toast.success(`Marked as ${status}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update status.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (enquiry: BusinessEnquiry) => {
    if (!window.confirm(`Delete enquiry from ${enquiry.name}?`)) return;
    setBusyId(enquiry.id);
    try {
      await EnquiryService.deleteEnquiry(enquiry.id);
      setRows((prev) => prev.filter((r) => r.id !== enquiry.id));
      setSelected((s) => (s && s.id === enquiry.id ? null : s));
      toast.success("Enquiry deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete enquiry.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold">Business Enquiries</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} total · {rows.filter((r) => r.status === "New").length} new
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enquiries…"
              className="w-44 bg-transparent text-sm outline-none"
            />
          </div>
          {(["All", ...ENQUIRY_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                filter === s
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card hover:bg-secondary",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {authLoading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking admin access…
        </div>
      ) : !user || !profile || profile.role !== "admin" ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          You must be signed in as an administrator to view business enquiries.
        </div>
      ) : loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading enquiries…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No enquiries found.
        </div>
      ) : (
        <DataTable<BusinessEnquiry>
          rows={filtered}
          columns={[
            { key: "name", label: "Name" },
            { key: "company", label: "Company", render: (r) => r.company || "—" },
            { key: "phone", label: "Phone" },
            { key: "email", label: "Email" },
            { key: "city", label: "City", render: (r) => r.city || "—" },
            { key: "enquiryType", label: "Type" },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    statusClass[r.status],
                  )}
                >
                  {r.status}
                </span>
              ),
            },
            { key: "createdAt", label: "Created", render: (r) => formatDate(r.createdAt) },
            {
              key: "actions",
              label: "Actions",
              render: (r) => (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelected(r)}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                    aria-label="View enquiry"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {r.status !== "Contacted" && (
                    <button
                      onClick={() => void changeStatus(r, "Contacted")}
                      disabled={busyId === r.id}
                      className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold hover:bg-secondary disabled:opacity-60"
                    >
                      Contacted
                    </button>
                  )}
                  {r.status !== "Closed" && (
                    <button
                      onClick={() => void changeStatus(r, "Closed")}
                      disabled={busyId === r.id}
                      className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold hover:bg-secondary disabled:opacity-60"
                    >
                      Close
                    </button>
                  )}
                  <button
                    onClick={() => void remove(r)}
                    disabled={busyId === r.id}
                    className="grid h-8 w-8 place-items-center rounded-full text-destructive hover:bg-destructive/10 disabled:opacity-60"
                    aria-label="Delete enquiry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-6">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-6 shadow-lift sm:rounded-3xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold">{selected.name}</h2>
                <p className="text-xs text-muted-foreground">{formatDate(selected.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ["Email", selected.email],
                ["Phone", selected.phone],
                ["Company", selected.company || "—"],
                ["City", selected.city || "—"],
                ["State", selected.state || "—"],
                ["Enquiry Type", selected.enquiryType],
                ["Status", selected.status],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-3">
                  <dt className="w-28 shrink-0 text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
              <div>
                <dt className="text-muted-foreground">Message</dt>
                <dd className="mt-1 whitespace-pre-wrap rounded-xl bg-secondary/50 p-3">
                  {selected.message}
                </dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => void changeStatus(selected, "Contacted")}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                Mark as Contacted
              </button>
              <button
                onClick={() => void changeStatus(selected, "Closed")}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                Mark as Closed
              </button>
              <button
                onClick={() => void remove(selected)}
                className="rounded-full border border-destructive px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
