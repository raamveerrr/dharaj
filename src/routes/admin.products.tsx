import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Plus, Search, Trash2, Loader2, Database } from "lucide-react";
import { toast } from "sonner";
import { inr } from "@/lib/format";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { DataTable } from "@/components/admin/DataTable";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProductsToFirestore,
  type DbProduct,
  type ProductInput,
} from "@/lib/db/catalog";
import { categories } from "@/lib/data";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminProducts,
});

const empty: ProductInput = {
  name: "",
  category: "ghee",
  description: "",
  weight: "",
  price: 0,
  mrp: 0,
  stock: 0,
  sku: "",
  imageUrls: [],
  bestSeller: false,
  newArrival: false,
  featured: false,
};

function AdminProducts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ id: string | null; data: ProductInput } | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: listProducts,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-products"] });

  const save = useMutation({
    mutationFn: async ({ id, data }: { id: string | null; data: ProductInput }) =>
      id ? updateProduct(id, data) : createProduct(data),
    onSuccess: (_r, v) => {
      toast.success(v.id ? "Product updated" : "Product created");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not save product"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not delete product"),
  });

  const seed = useMutation({
    mutationFn: seedProductsToFirestore,
    onSuccess: (n) => {
      toast.success(`Imported ${n} demo products`);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message ?? "Import failed"),
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    );
  }, [products, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-56 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          {products.length === 0 && !isLoading && (
            <button
              onClick={() => seed.mutate()}
              disabled={seed.isPending}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold hover:bg-secondary disabled:opacity-60"
            >
              {seed.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              Import demo catalogue
            </button>
          )}
          <button
            onClick={() => setEditing({ id: null, data: { ...empty } })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {editing && (
        <ProductForm
          value={editing.data}
          isEdit={!!editing.id}
          saving={save.isPending}
          onCancel={() => setEditing(null)}
          onChange={(data) => setEditing((s) => (s ? { ...s, data } : s))}
          onSave={() => save.mutate(editing)}
        />
      )}

      {isLoading ? (
        <div className="grid place-items-center rounded-2xl border border-border bg-card p-12 text-muted-foreground shadow-card">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground shadow-card">
          No products yet. Add one, or import the demo catalogue to get started.
        </div>
      ) : (
        <DataTable<DbProduct>
          columns={[
            {
              key: "name",
              label: "Product",
              render: (p) => (
                <div className="flex items-center gap-3">
                  <ImagePlaceholder
                    src={p.imageUrls?.[0] ?? undefined}
                    alt={p.name}
                    className="h-10 w-10"
                    rounded="rounded-lg"
                  />
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.sku}</div>
                  </div>
                </div>
              ),
            },
            { key: "category", label: "Category" },
            { key: "price", label: "Price", render: (p) => inr(p.price) },
            {
              key: "stock",
              label: "Stock",
              render: (p) => (
                <span className={p.stock < 10 ? "font-bold text-sale" : "font-semibold"}>{p.stock}</span>
              ),
            },
            {
              key: "flags",
              label: "Tags",
              render: (p) => (
                <div className="flex flex-wrap gap-1">
                  {p.bestSeller && <Tag c="bg-turmeric/30">Best</Tag>}
                  {p.newArrival && <Tag c="bg-leaf/30">New</Tag>}
                  {p.featured && <Tag c="bg-primary/15 text-primary">Featured</Tag>}
                </div>
              ),
            },
            {
              key: "actions",
              label: "",
              className: "text-right",
              render: (p) => (
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() =>
                      setEditing({
                        id: p.id,
                        data: {
                          name: p.name ?? "",
                          category: p.category ?? "ghee",
                          description: p.description ?? "",
                          weight: p.weight ?? "",
                          price: p.price ?? 0,
                          mrp: p.mrp ?? 0,
                          stock: p.stock ?? 0,
                          sku: p.sku ?? "",
                          imageUrls: p.imageUrls ?? [],
                          bestSeller: !!p.bestSeller,
                          newArrival: !!p.newArrival,
                          featured: !!p.featured,
                        },
                      })
                    }
                    title="Edit product"
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${p.name}"? This cannot be undone.`)) remove.mutate(p.id);
                    }}
                    title="Delete product"
                    className="grid h-8 w-8 place-items-center rounded-full text-sale hover:bg-sale/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      )}
    </div>
  );
}

function ProductForm({
  value,
  isEdit,
  saving,
  onChange,
  onCancel,
  onSave,
}: {
  value: ProductInput;
  isEdit: boolean;
  saving: boolean;
  onChange: (v: ProductInput) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
        {isEdit ? "Edit Product" : "New Product"}
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Product Name" value={value.name} onChange={(v) => set("name", v)} />
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</span>
          <select
            value={value.category}
            onChange={(e) => set("category", e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <Field label="Price (₹)" type="number" value={String(value.price)} onChange={(v) => set("price", Number(v) || 0)} />
        <Field label="MRP (₹)" type="number" value={String(value.mrp)} onChange={(v) => set("mrp", Number(v) || 0)} />
        <Field label="Weight" value={value.weight} onChange={(v) => set("weight", v)} />
        <Field label="Stock" type="number" value={String(value.stock)} onChange={(v) => set("stock", Number(v) || 0)} />
        <Field label="SKU" value={value.sku} onChange={(v) => set("sku", v)} />
        <label className="block sm:col-span-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</span>
          <textarea
            value={value.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <Check label="Best Seller" checked={!!value.bestSeller} onChange={(v) => set("bestSeller", v)} />
        <Check label="New Arrival" checked={!!value.newArrival} onChange={(v) => set("newArrival", v)} />
        <Check label="Featured" checked={!!value.featured} onChange={(v) => set("featured", v)} />
      </div>

      <div className="mt-5">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Product Images (up to 5)
        </label>
        <div className="mt-2">
          <ProductImageUploader
            value={value.imageUrls}
            onChange={(imgs) => set("imageUrls", imgs.filter(Boolean) as string[])}
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-full border border-border px-4 py-2 text-sm font-bold hover:bg-secondary"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving || !value.name.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Save Changes" : "Save Product"}
        </button>
      </div>
    </div>
  );
}

function Tag({ children, c }: { children: React.ReactNode; c: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c}`}>{children}</span>;
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--color-primary)]"
      />
      {label}
    </label>
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
  onChange: (v: string) => void;
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
