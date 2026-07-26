import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/data";

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  mrp: number;
  weight: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  coupon: string | null;
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  applyCoupon: (code: string | null) => void;
  subtotal: () => number;
  discount: () => number;
  shipping: () => number;
  gst: () => number;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,
      add: (p, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.productId === p.id);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.productId === p.id ? { ...l, qty: l.qty + qty } : l,
              ),
            };
          }
          return {
            lines: [
              ...s.lines,
              { productId: p.id, name: p.name, price: p.price, mrp: p.mrp, weight: p.weight, qty },
            ],
          };
        }),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          lines: qty <= 0
            ? s.lines.filter((l) => l.productId !== id)
            : s.lines.map((l) => (l.productId === id ? { ...l, qty } : l)),
        })),
      clear: () => set({ lines: [], coupon: null }),
      applyCoupon: (code) => set({ coupon: code }),
      subtotal: () => get().lines.reduce((a, l) => a + l.price * l.qty, 0),
      discount: () => {
        const c = get().coupon;
        const sub = get().subtotal();
        if (!c) return 0;
        if (c.toUpperCase() === "DHARAJ15" && sub >= 499) return Math.round(sub * 0.15);
        if (c.toUpperCase() === "FRESH100" && sub >= 299) return 100;
        return 0;
      },
      shipping: () => (get().subtotal() >= 499 || get().subtotal() === 0 ? 0 : 49),
      gst: () => Math.round((get().subtotal() - get().discount()) * 0.05),
      total: () => {
        const t = get().subtotal() - get().discount() + get().shipping() + get().gst();
        return Math.max(0, t);
      },
      count: () => get().lines.reduce((a, l) => a + l.qty, 0),
    }),
    { name: "dharaj-cart" },
  ),
);
