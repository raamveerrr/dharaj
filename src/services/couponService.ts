import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Coupon } from "@/types/coupon";

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
  return {
    id: (raw.id as string) ?? "",
    code: (raw.code as string) ?? "",
    description: (raw.description as string) ?? "",
    type: (raw.type as Coupon["type"]) ?? "percent",
    discount: Number(raw.discount ?? 0),
    minOrder: Number(raw.minOrder ?? 0),
    expiry: (raw.expiry as string) ?? "",
    active: Boolean(raw.active ?? true),
    createdAt: raw.createdAt ? toDate(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? toDate(raw.updatedAt) : undefined,
  };
}

export class CouponService {
  static async listCoupons() {
    const db = getFirebaseDb();
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((docSnap) => normalizeCoupon({ id: docSnap.id, ...docSnap.data() }));
  }

  static async createCoupon(data: Omit<Coupon, "id" | "createdAt" | "updatedAt">) {
    const db = getFirebaseDb();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  }

  static async updateCoupon(id: string, data: Partial<Coupon>) {
    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteCoupon(id: string) {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, COLLECTION, id));
  }
}
