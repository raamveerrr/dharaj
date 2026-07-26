import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductCard } from "@/components/customer/ProductCard";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { getCategory, getProductsByCategory } from "@/lib/data";

export const Route = createFileRoute("/_shop/category/$slug")({
  loader: ({ params }) => {
    const cat = getCategory(params.slug);
    if (!cat) throw notFound();
    return { cat, list: getProductsByCategory(params.slug) };
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
  const { cat, list } = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center gap-4 overflow-hidden rounded-3xl bg-secondary/50 p-4 sm:p-6">
        <ImagePlaceholder className="h-20 w-20 sm:h-28 sm:w-28 shrink-0" rounded="rounded-2xl" />
        <div className="min-w-0">
          <div className="text-2xl">{cat.icon}</div>
          <h1 className="truncate text-xl font-extrabold sm:text-3xl">{cat.name}</h1>
          <p className="text-sm text-muted-foreground">{cat.tagline}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
