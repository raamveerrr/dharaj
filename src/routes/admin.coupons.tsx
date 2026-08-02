import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { CouponService } from "@/services/couponService";
import type { Coupon } from "@/types/coupon";

export const Route = createFileRoute("/admin/coupons")({
  head: () => ({ meta: [{ title: "Coupons — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminCoupons,
});

type CouponDraft = {
  code: string;
  description: string;
  type: Coupon["type"];
  discount: string;
  minOrder: string;
  maxDiscount: string;
  expiry: string;
  active: boolean;
  usageLimit: string;
  singleUse: boolean;
};

const emptyDraft = (): CouponDraft => ({
  code: "",
  description: "",
  type: "percent",
  discount: "",
  minOrder: "",
  maxDiscount: "",
  expiry: "",
  active: true,
  usageLimit: "",
  singleUse: false,
});

function AdminCoupons() {
  const queryClient = useQueryClient();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponDraft>(emptyDraft());

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await CouponService.listCoupons();
      setCoupons(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load coupons.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCoupons();
  }, []);

  const resetForm = () => {
    setForm(emptyDraft());
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      discount: String(coupon.discount),
      minOrder: String(coupon.minOrder),
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
      expiry: coupon.expiry,
      active: coupon.active,
      usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      singleUse: Boolean(coupon.singleUse),
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) {
      toast.error("Coupon code is required.");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Description is required.");
      return;
    }
    if (!form.discount || Number(form.discount) <= 0) {
      toast.error("Discount must be greater than 0.");
      return;
    }
    if (!form.minOrder || Number(form.minOrder) < 0) {
      toast.error("Minimum order must be valid.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        code: form.code.trim(),
        description: form.description.trim(),
        type: form.type,
        discount: Number(form.discount),
        minOrder: Number(form.minOrder),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        expiry: form.expiry,
        active: form.active,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        singleUse: form.singleUse,
      };

      if (editingId) {
        await CouponService.updateCoupon(editingId, payload);
        await queryClient.invalidateQueries({ queryKey: ["coupons"] });
        toast.success("Coupon updated successfully");
      } else {
        await CouponService.createCoupon(payload);
        await queryClient.invalidateQueries({ queryKey: ["coupons"] });
        toast.success("Coupon created successfully");
      }

      await loadCoupons();
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save coupon.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSaving(true);
    try {
      await CouponService.deleteCoupon(id);
      await queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
      toast.success("Coupon deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete coupon.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setShowForm((prev) => !prev);
            if (!showForm) {
              setForm(emptyDraft());
              setEditingId(null);
            }
          }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> {showForm ? "Close" : "New Coupon"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Code" value={form.code} onChange={(value) => setForm((prev) => ({ ...prev, code: value }))} />
            <Field label="Description" value={form.description} onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} />
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Type</span>
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as Coupon["type"] }))}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </label>
            <Field label="Discount" type="number" value={form.discount} onChange={(value) => setForm((prev) => ({ ...prev, discount: value }))} />
            <Field label="Min Order" type="number" value={form.minOrder} onChange={(value) => setForm((prev) => ({ ...prev, minOrder: value }))} />
            <Field label="Max Discount" type="number" value={form.maxDiscount} onChange={(value) => setForm((prev) => ({ ...prev, maxDiscount: value }))} />
            <Field label="Expiry" type="date" value={form.expiry} onChange={(value) => setForm((prev) => ({ ...prev, expiry: value }))} />
            <Field label="Usage Limit" type="number" value={form.usageLimit} onChange={(value) => setForm((prev) => ({ ...prev, usageLimit: value }))} />
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                className="h-4 w-4 rounded border-border bg-background"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <input
                type="checkbox"
                checked={form.singleUse}
                onChange={(e) => setForm((prev) => ({ ...prev, singleUse: e.target.checked }))}
                className="h-4 w-4 rounded border-border bg-background"
              />
              Single Use
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="rounded-full border border-border px-4 py-2 text-sm font-bold hover:bg-secondary"
            >
              <span className="inline-flex items-center gap-2"><X className="h-4 w-4" /> Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="inline-flex items-center gap-2"><Save className="h-4 w-4" /> {isSaving ? "Saving..." : editingId ? "Save Coupon" : "Create Coupon"}</span>
            </button>
          </div>
        </div>
      )}

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
              render: (c) => (
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => handleEdit(c)}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => void handleDelete(c.id)}
                    className="grid h-8 w-8 place-items-center rounded-full text-sale hover:bg-sale/10"
                  >
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

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
