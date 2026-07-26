import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, MapPin, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/stores/cart";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/_shop/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — DHARAJ" },
      { name: "description", content: "Complete your Dharaj order." },
      { property: "og:title", content: "Checkout — DHARAJ" },
      { property: "og:description", content: "Address, payment and order summary." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart((s) => s.subtotal());
  const discount = useCart((s) => s.discount());
  const shipping = useCart((s) => s.shipping());
  const gst = useCart((s) => s.gst());
  const total = useCart((s) => s.total());
  const [placed, setPlaced] = useState(false);
  const [pay, setPay] = useState("cod");

  if (placed) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold">Order placed!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thank you for shopping with Dharaj. Track your order in your profile.
        </p>
        <Link
          to="/profile"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          View Orders
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p>Your cart is empty.</p>
        <Link to="/shop" className="mt-4 inline-flex text-primary font-semibold">Continue shopping →</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Checkout</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* Address */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              <MapPin className="h-4 w-4 text-primary" /> Shipping Address
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input label="Full Name" placeholder="Aarav Sharma" />
              <Input label="Phone" placeholder="+91 98111 22001" />
              <Input label="Email" placeholder="you@example.com" className="sm:col-span-2" />
              <Input label="Address Line 1" placeholder="Flat / House no." className="sm:col-span-2" />
              <Input label="City" placeholder="Mumbai" />
              <Input label="State" placeholder="Maharashtra" />
              <Input label="Pincode" placeholder="400001" />
              <Input label="Landmark (optional)" placeholder="Near…" />
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              <Wallet className="h-4 w-4 text-primary" /> Payment Method
            </h2>
            <div className="mt-4 space-y-2">
              {[
                { id: "cod", label: "Cash on Delivery", desc: "Pay when it arrives" },
                { id: "upi", label: "UPI", desc: "GPay, PhonePe, Paytm" },
                { id: "card", label: "Credit / Debit Card", desc: "Secure checkout" },
              ].map((o) => (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    pay === o.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={pay === o.id}
                    onChange={() => setPay(o.id)}
                    className="accent-primary"
                  />
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-semibold">{o.label}</div>
                    <div className="text-xs text-muted-foreground">{o.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h3 className="text-sm font-bold uppercase tracking-widest">Order Summary</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {lines.map((l) => (
                <li key={l.productId} className="flex justify-between gap-2">
                  <span className="truncate text-muted-foreground">
                    {l.name} × {l.qty}
                  </span>
                  <span className="font-medium">{inr(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-border pt-3 space-y-1.5 text-sm">
              <Row k="Subtotal" v={inr(subtotal)} />
              {discount > 0 && <Row k="Discount" v={`− ${inr(discount)}`} />}
              <Row k="Shipping" v={shipping === 0 ? "Free" : inr(shipping)} />
              <Row k="GST (5%)" v={inr(gst)} />
              <div className="border-t border-border pt-2" />
              <Row k="Total" v={inr(total)} bold />
            </div>
            <button
              onClick={() => {
                clear();
                setPlaced(true);
                toast.success("Order placed successfully");
              }}
              className="mt-4 flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
            >
              Place Order · {inr(total)}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Input({ label, className, ...rest }: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className ?? ""}`}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        {...rest}
        className="rounded-xl border border-border bg-secondary/50 px-3 py-2.5 outline-none focus:border-primary"
      />
    </label>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-extrabold" : ""}`}>
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}
