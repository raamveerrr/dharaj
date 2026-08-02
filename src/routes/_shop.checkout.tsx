import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { CheckCircle2, CreditCard, Loader2, MapPin, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/stores/cart";
import { inr } from "@/lib/format";
import { useAuth } from "@/stores/auth";
import { AuthInit } from "@/components/auth/AuthInit";
import { OrderService } from "@/services/orderService";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import type { NewOrderInput, Order } from "@/types/order";

export const Route = createFileRoute("/_shop/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — DHARAJ" },
      { name: "description", content: "Complete your Dharaj order on WhatsApp." },
      { property: "og:title", content: "Checkout — DHARAJ" },
      { property: "og:description", content: "Address, payment and order summary." },
    ],
  }),
  component: () => (
    <ClientOnly fallback={null}>
      <AuthInit />
      <CheckoutPage />
    </ClientOnly>
  ),
});

type FormState = {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  notes: string;
};

const emptyForm: FormState = {
  customerName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  notes: "",
};

function validate(f: FormState): Partial<Record<keyof FormState, string>> {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (f.customerName.trim().length < 3) e.customerName = "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, "").slice(-10)))
    e.phone = "Enter a valid 10-digit mobile number.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (f.address.trim().length < 6) e.address = "Enter your complete address.";
  if (f.city.trim().length < 2) e.city = "Enter your city.";
  if (f.state.trim().length < 2) e.state = "Enter your state.";
  if (!/^\d{6}$/.test(f.pincode.trim())) e.pincode = "Pincode must be 6 digits.";
  return e;
}

function CheckoutPage() {
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart((s) => s.subtotal());
  const discount = useCart((s) => s.discount());
  const shipping = useCart((s) => s.shipping());
  const total = useCart((s) => s.total());
  const { user, profile } = useAuth();

  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    customerName: profile?.displayName ?? user?.displayName ?? "",
    email: user?.email ?? "",
    phone: profile?.phone ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [pay, setPay] = useState("whatsapp");

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const placeOrder = async () => {
    if (!user) {
      toast.error("Please sign in to place your order.");
      return;
    }
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: NewOrderInput = {
        customerId: user.uid,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        landmark: form.landmark.trim(),
        notes: form.notes.trim(),
        items: lines.map((l) => ({
          productId: l.productId,
          productName: l.name,
          image: l.image ?? "",
          price: l.price,
          quantity: l.qty,
          subtotal: l.price * l.qty,
        })),
        subtotal,
        deliveryCharge: shipping,
        discount,
        total,
      };

      const order = await OrderService.createOrder(payload);
      toast.success(`Order ${order.orderId} created`);

      const url = whatsappOrderUrl(order);
      const win = typeof window !== "undefined" ? window.open(url, "_blank", "noopener") : null;
      if (win) {
        void OrderService.markWhatsappSent(order.orderId).catch(() => {});
      }

      setPlacedOrder({ ...order, whatsappSent: Boolean(win) });
      clear();
    } catch (err) {
      console.error(err);
      toast.error((err as Error)?.message ?? "Could not create your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold">Order successfully created</h1>
        <div className="mt-5 space-y-2 rounded-2xl border border-border bg-card p-5 text-left text-sm shadow-card">
          <Row k="Order ID" v={placedOrder.orderId} bold />
          <Row k="Payment Status" v={placedOrder.paymentStatus} />
          <Row k="Order Status" v={placedOrder.orderStatus} />
          <Row k="Total" v={inr(placedOrder.total)} bold />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Please complete payment after receiving the QR code from DHARAJ on WhatsApp.
        </p>
        <a
          href={whatsappOrderUrl(placedOrder)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex rounded-full border border-border bg-background px-6 py-3 text-sm font-bold hover:bg-secondary"
        >
          Re-open WhatsApp
        </a>
        <div>
          <Link
            to="/profile"
            className="mt-3 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
          >
            View Orders
          </Link>
        </div>
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
      {!user && (
        <div className="mt-4 rounded-2xl border border-border bg-secondary/50 p-4 text-sm">
          Please{" "}
          <Link to="/auth/login" className="font-bold text-primary">
            sign in
          </Link>{" "}
          to place your order and track it later.
        </div>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* Address */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              <MapPin className="h-4 w-4 text-primary" /> Shipping Address
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input label="Full Name" placeholder="Aarav Sharma" value={form.customerName} onChange={set("customerName")} error={errors.customerName} />
              <Input label="Phone" placeholder="9876543210" value={form.phone} onChange={set("phone")} error={errors.phone} />
              <Input label="Email" placeholder="you@example.com" className="sm:col-span-2" value={form.email} onChange={set("email")} error={errors.email} />
              <Input label="Address Line 1" placeholder="Flat / House no." className="sm:col-span-2" value={form.address} onChange={set("address")} error={errors.address} />
              <Input label="City" placeholder="Mumbai" value={form.city} onChange={set("city")} error={errors.city} />
              <Input label="State" placeholder="Maharashtra" value={form.state} onChange={set("state")} error={errors.state} />
              <Input label="Pincode" placeholder="400001" value={form.pincode} onChange={set("pincode")} error={errors.pincode} />
              <Input label="Landmark (optional)" placeholder="Near…" value={form.landmark} onChange={set("landmark")} />
              <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span className="text-xs font-semibold text-muted-foreground">Notes (optional)</span>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={set("notes")}
                  placeholder="Delivery instructions…"
                  className="rounded-xl border border-border bg-secondary/50 px-3 py-2.5 outline-none focus:border-primary"
                />
              </label>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              <Wallet className="h-4 w-4 text-primary" /> Payment Method
            </h2>
            <div className="mt-4 space-y-2">
              {[
                { id: "whatsapp", label: "Pay on WhatsApp (QR)", desc: "We send a payment QR code on WhatsApp" },
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
              <Row k="Delivery" v={shipping === 0 ? "Free" : inr(shipping)} />
              <div className="border-t border-border pt-2" />
              <Row k="Total" v={inr(total)} bold />
            </div>
            <button
              onClick={placeOrder}
              disabled={submitting || !user}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Creating order…" : `Place Order · ${inr(total)}`}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Your order is saved first, then WhatsApp opens with the details ready to send.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Input({
  label,
  className,
  error,
  ...rest
}: { label: string; className?: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className ?? ""}`}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        {...rest}
        className={`rounded-xl border bg-secondary/50 px-3 py-2.5 outline-none focus:border-primary ${
          error ? "border-sale" : "border-border"
        }`}
      />
      {error && <span className="text-[11px] font-medium text-sale">{error}</span>}
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
