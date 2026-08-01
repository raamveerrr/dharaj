import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Coupon, CouponType } from "@/types/coupon";

const COLLECTION = "coupons";

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function normalizeCoupon(raw: Record<string, unknown> & { id?: string }): Coupon {
  const type = (raw.type as CouponType) === "fixed" ? "fixed" : "percent";

  return {
    id: (raw.id as string) ?? "",
    code: String(raw.code ?? "").toUpperCase(),
    description: (raw.description as string) ?? "",
    type,
    discount: Number(raw.discount ?? 0),
    minOrder: Number(raw.minOrder ?? 0),
    maxDiscount: Number(raw.maxDiscount ?? 0) || undefined,
    expiry: (raw.expiry as string) ?? "",
    active: Boolean(raw.active ?? true),
    usageLimit: Number(raw.usageLimit ?? 0) || undefined,
    usedCount: Number(raw.usedCount ?? 0) || undefined,
    singleUse: Boolean(raw.singleUse ?? false),
    createdAt: raw.createdAt ? toDate(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? toDate(raw.updatedAt) : undefined,
  };
}

export class CouponService {
  static async listCoupons() {
    const db = getFirebaseDb();
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs
      .map((docSnap) => normalizeCoupon({ id: docSnap.id, ...docSnap.data() }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }

  static async getCouponByCode(code: string) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return null;

    const db = getFirebaseDb();
    const snapshot = await getDocs(query(collection(db, COLLECTION), where("code", "==", normalized)));
    if (snapshot.empty) return null;

    return normalizeCoupon({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
  }

  static async getActiveCouponByCode(code: string) {
    const coupon = await this.getCouponByCode(code);
    if (!coupon) return null;
    if (!coupon.active) return null;
    if (coupon.expiry && new Date(coupon.expiry).getTime() < Date.now()) return null;
    return coupon;
  }

  static async validateCoupon(code: string, subtotal: number) {
    const coupon = await this.getActiveCouponByCode(code);
    if (!coupon) {
      throw new Error("Coupon is invalid or expired.");
    }
    if (subtotal < coupon.minOrder) {
      throw new Error(`Minimum order amount is ₹${coupon.minOrder}.`);
    }

    const expiry = coupon.expiry ? new Date(coupon.expiry) : null;
    if (expiry && expiry.getTime() < Date.now()) {
      throw new Error("This coupon has expired.");
    }

    const usageLimit = coupon.usageLimit ?? 0;
    const usedCount = coupon.usedCount ?? 0;
    if (usageLimit > 0 && usedCount >= usageLimit) {
      throw new Error("This coupon has reached its usage limit.");
    }

    let discount = coupon.discount;
    if (coupon.type === "percent") {
      const calculated = (subtotal * coupon.discount) / 100;
      const maxDiscount = coupon.maxDiscount && coupon.maxDiscount > 0 ? coupon.maxDiscount : subtotal;
      discount = Math.min(calculated, maxDiscount);
    }

    return { coupon, discount };
  }

  static async createCoupon(data: Omit<Coupon, "id" | "createdAt" | "updatedAt">) {
    const db = getFirebaseDb();
    const normalizedCode = data.code.trim().toUpperCase();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...data,
      code: normalizedCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  }

  static async updateCoupon(id: string, data: Partial<Coupon>) {
    const db = getFirebaseDb();
    const payload: Record<string, unknown> = { ...data };
    if (payload.code && typeof payload.code === "string") {
      payload.code = payload.code.trim().toUpperCase();
    }
    await updateDoc(doc(db, COLLECTION, id), {
      ...payload,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteCoupon(id: string) {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, COLLECTION, id));
  }
}
