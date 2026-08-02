import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { NewOrderInput, Order, OrderStatus, PaymentStatus } from "@/types/order";

const COLLECTION = "orders";
const COUNTER_DOC = "counters/orderNumber";
const START_NUMBER = 1000;

function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return undefined;
}

export function normalizeOrder(raw: Record<string, unknown>, id: string): Order {
  return {
    orderId: (raw.orderId as string) ?? id,
    customerId: (raw.customerId as string) ?? "",
    customerName: (raw.customerName as string) ?? "",
    phone: (raw.phone as string) ?? "",
    email: (raw.email as string) ?? "",
    address: (raw.address as string) ?? "",
    city: (raw.city as string) ?? "",
    state: (raw.state as string) ?? "",
    pincode: (raw.pincode as string) ?? "",
    landmark: (raw.landmark as string) ?? "",
    notes: (raw.notes as string) ?? "",
    items: Array.isArray(raw.items) ? (raw.items as Order["items"]) : [],
    subtotal: Number(raw.subtotal ?? 0),
    deliveryCharge: Number(raw.deliveryCharge ?? 0),
    discount: Number(raw.discount ?? 0),
    total: Number(raw.total ?? 0),
    paymentStatus: (raw.paymentStatus as PaymentStatus) ?? "Awaiting Payment",
    orderStatus: (raw.orderStatus as OrderStatus) ?? "Pending",
    whatsappSent: Boolean(raw.whatsappSent),
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt),
  };
}

/** Atomically reserves the next readable order number, e.g. DHJ-1001. */
async function nextOrderId(): Promise<string> {
  const db = getFirebaseDb();
  const [col, id] = COUNTER_DOC.split("/");
  const ref = doc(db, col, id);
  const next = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists() ? Number(snap.data().value ?? START_NUMBER) : START_NUMBER;
    const value = current + 1;
    tx.set(ref, { value, updatedAt: serverTimestamp() }, { merge: true });
    return value;
  });
  return `DHJ-${next}`;
}

export class OrderService {
  static async createOrder(input: NewOrderInput): Promise<Order> {
    const db = getFirebaseDb();
    const orderId = await nextOrderId();
    const payload = {
      ...input,
      orderId,
      paymentStatus: "Awaiting Payment" as PaymentStatus,
      orderStatus: "Pending" as OrderStatus,
      whatsappSent: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(doc(db, COLLECTION, orderId), payload);
    return normalizeOrder({ ...payload, createdAt: new Date(), updatedAt: new Date() }, orderId);
  }

  static async getOrder(orderId: string): Promise<Order | null> {
    const db = getFirebaseDb();
    const snap = await getDoc(doc(db, COLLECTION, orderId));
    return snap.exists() ? normalizeOrder(snap.data(), snap.id) : null;
  }

  /** Admin: all orders, newest first. */
  static async listOrders(): Promise<Order[]> {
    const db = getFirebaseDb();
    const snap = await getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => normalizeOrder(d.data(), d.id));
  }

  static async listUserOrders(userId: string): Promise<Order[]> {
    const db = getFirebaseDb();
    const snap = await getDocs(query(collection(db, COLLECTION), where("customerId", "==", userId)));
    return snap.docs
      .map((d) => normalizeOrder(d.data(), d.id))
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }

  /** Admin realtime listener. Returns an unsubscribe function. */
  static subscribeOrders(
    onData: (orders: Order[]) => void,
    onError?: (err: unknown) => void,
  ): () => void {
    const db = getFirebaseDb();
    return onSnapshot(
      query(collection(db, COLLECTION), orderBy("createdAt", "desc")),
      (snap) => onData(snap.docs.map((d) => normalizeOrder(d.data(), d.id))),
      (err) => onError?.(err),
    );
  }

  /** Customer realtime listener scoped to their own orders. */
  static subscribeUserOrders(
    userId: string,
    onData: (orders: Order[]) => void,
    onError?: (err: unknown) => void,
  ): () => void {
    const db = getFirebaseDb();
    return onSnapshot(
      query(collection(db, COLLECTION), where("customerId", "==", userId)),
      (snap) =>
        onData(
          snap.docs
            .map((d) => normalizeOrder(d.data(), d.id))
            .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)),
        ),
      (err) => onError?.(err),
    );
  }

  static async markWhatsappSent(orderId: string) {
    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTION, orderId), {
      whatsappSent: true,
      updatedAt: serverTimestamp(),
    });
  }

  /** Admin only (enforced by Firestore rules). */
  static async setPaymentStatus(orderId: string, paymentStatus: PaymentStatus) {
    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTION, orderId), { paymentStatus, updatedAt: serverTimestamp() });
  }

  /** Admin only (enforced by Firestore rules). */
  static async setOrderStatus(orderId: string, orderStatus: OrderStatus) {
    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTION, orderId), { orderStatus, updatedAt: serverTimestamp() });
  }
}
