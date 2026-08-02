import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useWishlist } from "@/stores/wishlist";
import { ProductCard } from "@/components/customer/ProductCard";
import { ProductService } from "@/services/productService";
import type { Product } from "@/types/product";

export const Route = createFileRoute("/_shop/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — DHARAJ" },
      { name: "description", content: "Products you love, saved for later." },
      { property: "og:title", content: "Your Wishlist — DHARAJ" },
      { property: "og:description", content: "Saved for later." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const ids = useWishlist((s) => s.ids);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const data = await ProductService.getProducts();
      if (active) setProducts(data);
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const items = products.filter((p) => ids.includes(p.id));
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Your Wishlist</h1>
      <p className="text-sm text-muted-foreground">{items.length} saved</p>
      {items.length === 0 ? (
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary">
            <Heart className="h-9 w-9 text-primary" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Your wishlist is empty.</p>
          <Link to="/shop" className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
