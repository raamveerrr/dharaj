import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/customer/ProductCard";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { ProductService } from "@/services/productService";
import { CategoryService } from "@/services/categoryService";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";

export const Route = createFileRoute("/_shop/category/$slug")({
  loader: async ({ params }) => {
    const cat = await CategoryService.getCategoryBySlug(params.slug);
    if (!cat) throw notFound();
    const products = await ProductService.getProducts();
    return {
      cat: {
        ...cat,
        icon: cat.slug.includes("ghee") ? "🧈" : cat.slug.includes("pickle") ? "🥭" : cat.slug.includes("spice") ? "🌶️" : cat.slug.includes("cookie") ? "🍪" : cat.slug.includes("gulkand") ? "🌹" : cat.slug.includes("amla") ? "🟢" : cat.slug.includes("pulse") ? "🌾" : "🥜",
        tagline: cat.description,
      },
      list: products.filter((product) => product.categoryId === cat.id || product.category.toLowerCase() === params.slug.toLowerCase()),
    };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.cat.name} — DHARAJ` },
          { name: "description", content: `${loaderData.cat.tagline}. Shop pure ${loaderData.cat.name} at Dharaj.` },
          { property: "og:title", content: `${loaderData.cat.name} — DHARAJ` },
          { property: "og:description", content: loaderData.cat.tagline },
        ]
      : [{ title: "Category — DHARAJ" }, { name: "robots", content: "noindex" }],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const initial = Route.useLoaderData();
  const [cat, setCat] = useState<Category & { icon: string; tagline: string }>(initial.cat);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeProducts = ProductService.subscribeProducts((nextProducts) => {
      setProducts(nextProducts);
    });
    const unsubscribeCategory = CategoryService.subscribeCategoryBySlug(initial.cat.slug, (nextCategory) => {
      if (!nextCategory) {
        setCat(initial.cat);
        return;
      }

      setCat({
        ...nextCategory,
        icon: nextCategory.slug.includes("ghee") ? "🧈" : nextCategory.slug.includes("pickle") ? "🥭" : nextCategory.slug.includes("spice") ? "🌶️" : nextCategory.slug.includes("cookie") ? "🍪" : nextCategory.slug.includes("gulkand") ? "🌹" : nextCategory.slug.includes("amla") ? "🟢" : nextCategory.slug.includes("pulse") ? "🌾" : "🥜",
        tagline: nextCategory.description,
      });
      setLoading(false);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeCategory();
    };
  }, [initial.cat]);

  const list = useMemo(() => {
    return products.filter((product) => product.categoryId === cat.id || product.category.toLowerCase() === cat.slug.toLowerCase());
  }, [cat.id, cat.slug, products]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center gap-4 overflow-hidden rounded-3xl bg-secondary/50 p-4 sm:p-6">
        <ImagePlaceholder src={cat.image || ""} alt={cat.name} className="h-20 w-20 sm:h-28 sm:w-28 shrink-0" rounded="rounded-2xl" />
        <div className="min-w-0">
          <div className="text-2xl">{cat.icon}</div>
          <h1 className="truncate text-xl font-extrabold sm:text-3xl">{cat.name}</h1>
          <p className="text-sm text-muted-foreground">{cat.tagline}</p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Loading category products…
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
