import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  documentId,
  serverTimestamp,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase";
import type { Product } from "../types/product";

const COLLECTION = "products";

function isBrowserEnvironment() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

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

function normalizeProduct(raw: Record<string, unknown> & { id?: string }): Product {
  return {
    id: (raw.id as string) ?? "",
    name: (raw.name as string) ?? "",
    slug: (raw.slug as string) ?? "",
    description: (raw.description as string) ?? "",
    category: (raw.category as string) ?? "",
    brand: (raw.brand as string) ?? "Dharaj",
    categoryId: (raw.categoryId as string) ?? "",
    categoryName: (raw.categoryName as string) ?? "",
    price: Number(raw.price ?? 0),
    mrp: Number(raw.mrp ?? 0),
    discount: Number(raw.discount ?? 0),
    stock: Number(raw.stock ?? 0),
    weight: (raw.weight as string) ?? "",
    sku: (raw.sku as string) ?? "",
    images: Array.isArray(raw.images) ? (raw.images as Product["images"]) : [],
    featured: Boolean(raw.featured),
    bestSeller: Boolean(raw.bestSeller),
    newArrival: Boolean(raw.newArrival),
    rating: Number(raw.rating ?? 0),
    reviewCount: Number(raw.reviewCount ?? 0),
    isActive: Boolean(raw.isActive ?? true),
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt),
  };
}

export class ProductService {

  static async createProduct(product: Omit<Product, "id">) {
    if (!isBrowserEnvironment()) {
      throw new Error("Product creation is only available in the browser.");
    }

    const db = getFirebaseDb();
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  }

  static async updateProduct(id: string, data: Partial<Product>) {
    if (!isBrowserEnvironment()) {
      throw new Error("Product updates are only available in the browser.");
    }

    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteProduct(id: string) {
    if (!isBrowserEnvironment()) {
      throw new Error("Product deletion is only available in the browser.");
    }

    const db = getFirebaseDb();
    await deleteDoc(doc(db, COLLECTION, id));
  }

  static async getProduct(id: string) {
    if (!isBrowserEnvironment()) {
      return null;
    }

    try {
      const db = getFirebaseDb();
      const snap = await getDoc(doc(db, COLLECTION, id));

      if (!snap.exists()) return null;

      return normalizeProduct({ id: snap.id, ...snap.data() });
    } catch (error) {
      console.warn("Failed to load product", error);
      return null;
    }
  }

  static subscribeProduct(id: string, callback: (product: Product | null) => void) {
    if (!isBrowserEnvironment()) {
      return () => {};
    }

    const db = getFirebaseDb();
    return onSnapshot(doc(db, COLLECTION, id), (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }

      callback(normalizeProduct({ id: snap.id, ...snap.data() }));
    });
  }

  static async getProducts() {
    if (!isBrowserEnvironment()) {
      return [];
    }

    try {
      const db = getFirebaseDb();
      const snapshot = await getDocs(collection(db, COLLECTION));

      return snapshot.docs.map((doc) => normalizeProduct({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn("Failed to load products", error);
      return [];
    }
  }

  static subscribeProducts(callback: (products: Product[]) => void) {
    if (!isBrowserEnvironment()) {
      return () => {};
    }

    const db = getFirebaseDb();
    return onSnapshot(collection(db, COLLECTION), (snapshot) => {
      const products = snapshot.docs.map((docSnap) => normalizeProduct({ id: docSnap.id, ...docSnap.data() }));
      callback(products);
    });
  }

  static async getProductsByIds(ids: string[]) {
    if (!isBrowserEnvironment() || ids.length === 0) {
      return [];
    }

    const db = getFirebaseDb();
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    const chunks: string[][] = [];

    for (let i = 0; i < uniqueIds.length; i += 10) {
      chunks.push(uniqueIds.slice(i, i + 10));
    }

    const products: Product[] = [];
    for (const chunk of chunks) {
      const snapshot = await getDocs(query(collection(db, COLLECTION), where(documentId(), "in", chunk)));
      products.push(...snapshot.docs.map((doc) => normalizeProduct({ id: doc.id, ...doc.data() })));
    }

    return ids
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product));
  }

  static async getFeaturedProducts() {
    if (!isBrowserEnvironment()) {
      return [];
    }

    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, COLLECTION),
        where("featured", "==", true)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => normalizeProduct({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn("Failed to load featured products", error);
      return [];
    }
  }

}