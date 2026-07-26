import { Link } from "@tanstack/react-router";
import { Heart, Plus, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Product } from "@/lib/data";
import { inr, pct } from "@/lib/format";
import { useWishlist } from "@/stores/wishlist";
import { useCart } from "@/stores/cart";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";

export function ProductCard({ product }: { product: Product }) {
  const wished = useWishlist((s) => s.has(product.id));
  const toggle = useWishlist((s) => s.toggle);
  const add = useCart((s) => s.add);
  const discount = pct(product.mrp, product.price);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
    >
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="relative">
          <ImagePlaceholder className="aspect-square w-full" rounded="rounded-none" />
          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded-full bg-sale px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
              {discount}% off
            </span>
          )}
          {product.bestSeller && (
            <span className="absolute right-3 top-3 rounded-full bg-turmeric/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground">
              Best
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
            aria-label="Wishlist"
            className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-card/95 shadow-card backdrop-blur transition hover:scale-110"
          >
            <Heart
              className="h-4 w-4"
              fill={wished ? "currentColor" : "none"}
              style={{ color: wished ? "var(--sale)" : undefined }}
            />
          </button>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {product.weight}
        </div>
        <Link to="/product/$id" params={{ id: product.id }}>
          <h3 className="mt-0.5 line-clamp-2 min-h-10 text-sm font-semibold hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-turmeric text-turmeric" />
          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
          <span>({product.reviewsCount})</span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <div className="text-base font-bold text-primary">{inr(product.price)}</div>
            {product.mrp > product.price && (
              <div className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</div>
            )}
          </div>
          <button
            onClick={() => {
              add(product);
              toast.success(`${product.name} added to cart`);
            }}
            aria-label="Add to cart"
            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground transition hover:scale-110 hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
