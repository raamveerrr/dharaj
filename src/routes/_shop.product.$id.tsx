import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Heart, Minus, Plus, ShieldCheck, Star, Truck, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { ProductGallery } from "@/components/customer/ProductGallery";
import { ProductReviews } from "@/components/customer/ProductReviews";
import { ProductCard } from "@/components/customer/ProductCard";
import { inr, pct } from "@/lib/format";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/wishlist";
import { ProductService } from "@/services/productService";
import type { Product } from "@/types/product";

export const Route = createFileRoute("/_shop/product/$id")({
  loader: async ({ params }) => {
    const product = await ProductService.getProduct(params.id);
    if (!product) throw notFound();
    const relatedProducts = (await ProductService.getProducts())
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4);
    return { product, relatedProducts };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — DHARAJ` },
          { name: "description", content: loaderData.product.description.slice(0, 155) },
          { property: "og:title", content: `${loaderData.product.name} — DHARAJ` },
          { property: "og:description", content: loaderData.product.description.slice(0, 155) },
        ]
      : [{ title: "Product — DHARAJ" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const initial = Route.useLoaderData();
  const navigate = useNavigate();
  const [product, setProduct] = useState(initial.product);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeProduct = ProductService.subscribeProduct(initial.product.id, (nextProduct) => {
      if (!nextProduct) return;
      setProduct(nextProduct);
      setLoading(false);
    });
    const unsubscribeProducts = ProductService.subscribeProducts((nextProducts) => {
      setAllProducts(nextProducts);
    });

    return () => {
      unsubscribeProduct();
      unsubscribeProducts();
    };
  }, [initial.product.id]);

  const relatedProducts = useMemo(() => {
    return allProducts
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4);
  }, [allProducts, product.category, product.id]);

  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.has(product.id));
  const toggle = useWishlist((s) => s.toggle);
  const discount = pct(product.mrp, product.price);
  const gallery = useMemo(() => {
    if (product.images?.length) {
      return product.images.map((image: { url: string }) => image.url);
    }

    return [] as string[];
  }, [product.id, product.category, product.images]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Loading product details…
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <ProductGallery
            productId={product.id}
            images={gallery}
            alt={product.name}
            badge={
              discount > 0 ? (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-sale px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-soft">
                  {discount}% off
                </span>
              ) : null
            }
          />
        </div>

        {/* Info */}
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {(product.brand ?? "Dharaj")} · {product.weight}
          </div>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 rounded-full bg-turmeric/20 px-2 py-0.5 font-semibold">
              <Star className="h-3.5 w-3.5 fill-turmeric text-turmeric" />
              {product.rating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-3xl font-extrabold text-primary">{inr(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-base text-muted-foreground line-through">{inr(product.mrp)}</span>
            )}
            {discount > 0 && <span className="text-sm font-bold text-sale">Save {discount}%</span>}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {/* Qty */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-2 py-1.5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                aria-label="Decrease"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"
                aria-label="Increase"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => toggle(product.id)}
              className="grid h-11 w-11 place-items-center rounded-full border border-border hover:bg-secondary"
              aria-label="Wishlist"
            >
              <Heart
                className="h-5 w-5"
                fill={wished ? "currentColor" : "none"}
                style={{ color: wished ? "var(--sale)" : undefined }}
              />
            </button>
          </div>

          {/* Trust */}
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { i: Leaf, t: "100% Natural" },
              { i: ShieldCheck, t: "Lab Tested" },
              { i: Truck, t: "Fast Ship" },
            ].map(({ i: Icon, t }) => (
              <div key={t} className="flex flex-col items-center gap-1 rounded-xl bg-secondary/60 p-3 text-center">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-[11px] font-semibold">{t}</span>
              </div>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="mt-6 hidden gap-3 sm:flex">
            <button
              onClick={() => {
                add(product, qty);
                toast.success("Added to cart");
              }}
              className="flex-1 rounded-full border-2 border-primary py-3 text-sm font-bold text-primary hover:bg-primary/5"
            >
              Add to Cart
            </button>
            <button
              onClick={() => {
                add(product, qty);
                toast.success("Proceeding to checkout");
                void navigate({ to: "/checkout" });
              }}
              className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Description</h3>
          <p className="mt-3 text-sm text-muted-foreground">{product.description}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Specifications</h3>
          <dl className="mt-3 space-y-2 text-sm">
            {[
              ["Brand", product.brand ?? "Dharaj"],
              ["Weight", product.weight],
              ["SKU", product.sku],
              ["Category", product.category],
              ["Stock", `${product.stock} in stock`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border pb-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <ProductReviews productId={product.id} productName={product.name} />

      {/* Related */}
      <div className="mt-12">
        <h2 className="mb-4 text-xl font-extrabold">You may also like</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      {/* Sticky mobile bottom bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed inset-x-0 bottom-16 z-20 border-t border-border bg-card p-3 shadow-lift sm:hidden"
      >
        <div className="mx-auto flex max-w-lg gap-2">
          <button
            onClick={() => {
              add(product, qty);
              toast.success("Added to cart");
            }}
            className="flex-1 rounded-full border-2 border-primary py-2.5 text-sm font-bold text-primary"
          >
            Add to Cart
          </button>
          <button
            onClick={() => {
              add(product, qty);
              void navigate({ to: "/checkout" });
            }}
            className="flex-1 rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground"
          >
            Buy Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}
