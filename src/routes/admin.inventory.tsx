import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { ProductService } from "@/services/productService";
import type { Product } from "@/types/product";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminInventory,
});

function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const data = await ProductService.getProducts();
        if (active) setProducts(data);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const low = products.filter((p) => p.stock < 20).length;
  const out = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Total SKUs", v: products.length },
          { l: "Low Stock", v: low },
          { l: "Out of Stock", v: out },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="text-xs font-semibold uppercase text-muted-foreground">{s.l}</div>
            <div className="mt-1 text-2xl font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>
      {loading ? (
        <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading inventory...</div>
      ) : (
        <DataTable
          columns={[
            { key: "sku", label: "SKU" },
            { key: "name", label: "Product" },
            { key: "category", label: "Category" },
            { key: "weight", label: "Weight" },
            {
              key: "stock",
              label: "Stock",
              render: (p) => (
                <span className={p.stock < 10 ? "font-bold text-sale" : "font-semibold text-primary"}>
                  {p.stock}
                </span>
              ),
            },
          ]}
          rows={products}
        />
      )}
    </div>
  );
}
