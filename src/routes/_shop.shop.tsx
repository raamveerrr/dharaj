import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/customer/ProductCard";
import { cn } from "@/lib/utils";
import { ProductService } from "@/services/productService";
import { CategoryService } from "@/services/categoryService";
import type { Product } from "@/types/product";

export const Route = createFileRoute("/_shop/shop")({
  loader: async () => ({
    products: await ProductService.getProducts(),
  }),
  head: () => ({
    meta: [
      { title: "Shop All Products — DHARAJ" },
      { name: "description", content: "Browse ghee, pickles, spices, cookies and more natural food." },
      { property: "og:title", content: "Shop All — DHARAJ" },
      { property: "og:description", content: "Every jar, tin and packet — one place." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState("popular");
  const [categories, setCategories] = useState<Array<{ id: string; slug: string; name: string; icon: string }>>([]);

  useEffect(() => {
    const unsubscribeProducts = ProductService.subscribeProducts((nextProducts) => {
      setProducts(nextProducts);
    });
    const unsubscribeCategories = CategoryService.subscribeCategories((nextCategories) => {
      setCategories(
        nextCategories.map((category) => ({
          id: category.id,
          slug: category.slug,
          name: category.name,
          icon: category.slug.includes("ghee") ? "🧈" : category.slug.includes("pickle") ? "🥭" : category.slug.includes("spice") ? "🌶️" : category.slug.includes("cookie") ? "🍪" : category.slug.includes("gulkand") ? "🌹" : category.slug.includes("amla") ? "🟢" : category.slug.includes("pulse") ? "🌾" : "🥜",
        })),
      );
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategories();
    };
  }, []);

  let list = cat ? products.filter((p) => p.category === cat) : products;
  list = [...list].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Shop All Products</h1>
        <p className="text-sm text-muted-foreground">Handpicked. Handmade. Pure.</p>
      </div>

      {/* Category chips */}
      <div className="hide-scrollbar -mx-4 mb-4 flex snap-x gap-2 overflow-x-auto px-4">
        <Chip active={cat === null} onClick={() => setCat(null)}>
          All
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={cat === c.slug} onClick={() => setCat(c.slug)}>
            <span className="mr-1">{c.icon}</span>
            {c.name}
          </Chip>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{list.length} products</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-sm outline-none"
        >
          <option value="popular">Popular</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "snap-start whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}
