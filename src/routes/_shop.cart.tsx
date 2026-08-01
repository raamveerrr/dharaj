import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Tag, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { ImagePlaceholder } from "@/components/common/ImagePlaceholder";
import { CouponService } from "@/services/couponService";
import { useCart } from "@/stores/cart";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_shop/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — DHARAJ" },
      { name: "description", content: "Review items in your cart before checkout." },
      { property: "og:title", content: "Your Cart — DHARAJ" },
      { property: "og:description", content: "Review your organic goodies." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const applyCoupon = useCart((s) => s.applyCoupon);
  const setCouponDiscount = useCart((s) => s.setCouponDiscount);
  const coupon = useCart((s) => s.coupon);
  const subtotal = useCart((s) => s.subtotal());
  const discount = useCart((s) => s.discount());
  const shipping = useCart((s) => s.shipping());
  const gst = useCart((s) => s.gst());
  const total = useCart((s) => s.total());
  const [code, setCode] = useState(coupon ?? "");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      applyCoupon(null);
      setCouponDiscount(0);
      toast.success("Coupon cleared");
      return;
    }

    setIsApplyingCoupon(true);

    try {
      const result = await CouponService.validateCoupon(trimmed, subtotal);
      applyCoupon(result.coupon.code);
      setCouponDiscount(result.discount);
      setCode(result.coupon.code);
      toast.success(`Coupon ${result.coupon.code} applied — you save ${inr(result.discount)}`);
    } catch (error) {
      applyCoupon(null);
      setCouponDiscount(0);
      const message = error instanceof Error ? error.message : "Unable to apply coupon.";
      toast.error(message);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-secondary">
          <ShoppingBag className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse our pure, handmade collection and add something delicious.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Your Cart</h1>
      <p className="text-sm text-muted-foreground">
        {lines.length} item{lines.length > 1 ? "s" : ""}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Lines */}
        <ul className="space-y-3">
          {lines.map((l) => (
            <li
              key={l.productId}
              className="grid grid-cols-[80px_minmax(0,1fr)] gap-3 rounded-2xl border border-border bg-card p-3 shadow-card sm:grid-cols-[100px_minmax(0,1fr)_auto]"
            >
              <ImagePlaceholder className="aspect-square" rounded="rounded-xl" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{l.name}</div>
                <div className="text-xs text-muted-foreground">{l.weight}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-bold text-primary">{inr(l.price)}</span>
                  {l.mrp > l.price && (
                    <span className="text-xs text-muted-foreground line-through">{inr(l.mrp)}</span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-3 sm:hidden">
                  <QtyControl qty={l.qty} onChange={(q) => setQty(l.productId, q)} />
                  <button
                    onClick={() => remove(l.productId)}
                    aria-label="Remove"
                    className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="hidden flex-col items-end justify-between sm:flex">
                <button
                  onClick={() => remove(l.productId)}
                  aria-label="Remove"
                  className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <QtyControl qty={l.qty} onChange={(q) => setQty(l.productId, q)} />
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-4 w-4 text-primary" /> Apply Coupon
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="DHARAJ15"
                className="flex-1 rounded-full border border-border bg-secondary/60 px-4 py-2 text-sm outline-none"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isApplyingCoupon ? "Applying..." : "Apply"}
              </button>
            </div>
            {coupon && discount > 0 && (
              <p className="mt-2 text-xs font-medium text-primary">
                Coupon "{coupon}" applied — you save {inr(discount)}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Truck className="h-4 w-4 text-primary" /> Delivery
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Estimated delivery in 3–5 days · Free shipping over ₹499
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h3 className="text-sm font-bold uppercase tracking-widest">Order Summary</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Row k="Subtotal" v={inr(subtotal)} />
              {discount > 0 && <Row k="Discount" v={`− ${inr(discount)}`} pos />}
              <Row k="Shipping" v={shipping === 0 ? "Free" : inr(shipping)} />
              <Row k="GST (5%)" v={inr(gst)} />
              <div className="border-t border-border pt-2" />
              <Row k="Total" v={inr(total)} bold />
            </dl>
            <Link
              to="/checkout"
              className="mt-4 flex items-center justify-center rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
            >
              Proceed to Checkout
            </Link>
          </div>
        </aside>
      </div>

      {/* Mobile sticky checkout */}
      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-border bg-card p-3 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-extrabold text-primary">{inr(total)}</div>
          </div>
          <Link
            to="/checkout"
            className="flex-1 rounded-full bg-primary py-3 text-center text-sm font-bold text-primary-foreground"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

function QtyControl({ qty, onChange }: { qty: number; onChange: (q: number) => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-1 py-1">
      <button
        onClick={() => onChange(qty - 1)}
        className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary"
        aria-label="Decrease"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-5 text-center text-sm font-bold">{qty}</span>
      <button
        onClick={() => onChange(qty + 1)}
        className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary"
        aria-label="Increase"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Row({ k, v, bold, pos }: { k: string; v: string; bold?: boolean; pos?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-extrabold" : ""}`}>
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={pos ? "font-semibold text-primary" : ""}>{v}</dd>
    </div>
  );
}
