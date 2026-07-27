import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Edit2, Plus, Search, Trash2, ChevronDown, ChevronUp, Images } from "lucide-react";
import { products } from "@/lib/data";
import { productImages } from "@/lib/mockImages";
import { inr } from "@/lib/format";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { DataTable } from "@/components/admin/DataTable";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminProducts,
});

function AdminProducts() {
  const [showAdd, setShowAdd] = useState(false);
  const [editingImages, setEditingImages] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search products…" className="w-56 bg-transparent text-sm outline-none" />
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Add Product
          {showAdd ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
            New Product
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Product Name" placeholder="e.g. A2 Cow Desi Ghee" />
            <Field label="Category" placeholder="ghee" />
            <Field label="Price (₹)" placeholder="899" />
            <Field label="MRP (₹)" placeholder="1099" />
            <Field label="Weight" placeholder="500 ml" />
            <Field label="Stock" placeholder="24" />
          </div>
          <div className="mt-5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Product Images (up to 5)
            </label>
            <div className="mt-2">
              <ProductImageUploader />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-full border border-border px-4 py-2 text-sm font-bold hover:bg-secondary"
            >
              Cancel
            </button>
            <button className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover">
              Save Product
            </button>
          </div>
        </div>
      )}

      {editingImages && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
              Edit images — {products.find((p) => p.id === editingImages)?.name}
            </h3>
            <button
              onClick={() => setEditingImages(null)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <ProductImageUploader
            initial={productImages(
              editingImages,
              products.find((p) => p.id === editingImages)?.category ?? "ghee",
              5,
              600,
            )}
          />
        </div>
      )}

      <DataTable
        columns={[
          {
            key: "name",
            label: "Product",
            render: (p) => (
              <div className="flex items-center gap-3">
                <ImagePlaceholder
                  src={productImages(p.id, p.category, 1, 200)[0]}
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
          { key: "stock", label: "Stock", render: (p) => (
            <span className={p.stock < 10 ? "font-bold text-sale" : "font-semibold"}>{p.stock}</span>
          ) },
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
        rows={products}
      />
    </div>
  );
}

function Tag({ children, c }: { children: React.ReactNode; c: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c}`}>{children}</span>;
}
