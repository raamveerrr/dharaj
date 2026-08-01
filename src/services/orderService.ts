import { collection, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Order } from "@/types/order";

const COLLECTION = "orders";

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

function normalizeOrder(raw: Record<string, unknown> & { id?: string }): Order {
  return {
    id: (raw.id as string) ?? "",
    customer: (raw.customer as string) ?? "",
    email: (raw.email as string) ?? "",
    phone: (raw.phone as string) ?? "",
    date: (raw.date as string) ?? "",
    items: Array.isArray(raw.items) ? (raw.items as Order["items"]) : [],
    total: Number(raw.total ?? 0),
    status: (raw.status as Order["status"]) ?? "Pending",
    createdAt: raw.createdAt ? toDate(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? toDate(raw.updatedAt) : undefined,
  };
}

export class OrderService {
  static async listOrders() {
    const db = getFirebaseDb();
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((docSnap) => normalizeOrder({ id: docSnap.id, ...docSnap.data() }));
  }

  static async updateOrderStatus(id: string, status: Order["status"]) {
    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTION, id), {
      status,
      updatedAt: serverTimestamp(),
    });
  }
}
