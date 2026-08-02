import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  documentId,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type { Category } from "@/types/category";

const COLLECTION = "categories";
const FEATURED_COLLECTION = "featuredCategories";

function isBrowserEnvironment() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function normalizeCategory(id: string, raw: Record<string, unknown>): Category {
  return {
    id,
    slug: String(raw.slug ?? id),
    name: String(raw.name ?? id),
    image: String(raw.image ?? raw.imageUrl ?? ""),
    description: String(raw.description ?? ""),
    isActive: Boolean(raw.isActive ?? true),
    featured: Boolean(raw.featured ?? false),
    order: Number(raw.order ?? 0),
  };
}

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    if (!isBrowserEnvironment()) return [];

    try {
      const db = getFirebaseDb();
      const snapshot = await getDocs(collection(db, COLLECTION));
      const categories = snapshot.docs.map((docSnap) => normalizeCategory(docSnap.id, docSnap.data() as Record<string, unknown>));
      return categories.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    } catch (error) {
      console.warn("Failed to load categories", error);
      return [];
    }
  }

  static subscribeCategories(callback: (categories: Category[]) => void) {
    if (!isBrowserEnvironment()) {
      return () => {};
    }

    const db = getFirebaseDb();
    return onSnapshot(collection(db, COLLECTION), (snapshot) => {
      const categories = snapshot.docs
        .map((docSnap) => normalizeCategory(docSnap.id, docSnap.data() as Record<string, unknown>))
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      callback(categories);
    });
  }

  static async getCategoryById(id: string): Promise<Category | undefined> {
    if (!isBrowserEnvironment()) return undefined;

    try {
      const db = getFirebaseDb();
      const snap = await getDoc(doc(db, COLLECTION, id));
      if (!snap.exists()) return undefined;
      return normalizeCategory(snap.id, snap.data() as Record<string, unknown>);
    } catch (error) {
      console.warn(`Failed to load category ${id}`, error);
      return undefined;
    }
  }

  static async getCategory(slug: string): Promise<Category | undefined> {
    return this.getCategoryBySlug(slug);
  }

  static async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    if (!isBrowserEnvironment()) return undefined;

    try {
      const db = getFirebaseDb();
      const q = query(collection(db, COLLECTION), where("slug", "==", slug));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return undefined;
      const docSnap = snapshot.docs[0];
      return normalizeCategory(docSnap.id, docSnap.data() as Record<string, unknown>);
    } catch (error) {
      console.warn(`Failed to load category ${slug}`, error);
      return undefined;
    }
  }

  static subscribeCategoryBySlug(slug: string, callback: (category: Category | undefined) => void) {
    if (!isBrowserEnvironment()) {
      return () => {};
    }

    const db = getFirebaseDb();
    return onSnapshot(query(collection(db, COLLECTION), where("slug", "==", slug)), (snapshot) => {
      if (snapshot.empty) {
        callback(undefined);
        return;
      }

      const docSnap = snapshot.docs[0];
      callback(normalizeCategory(docSnap.id, docSnap.data() as Record<string, unknown>));
    });
  }

  static async getCategoriesByIds(ids: string[]) {
    if (!isBrowserEnvironment() || ids.length === 0) {
      return [];
    }

    const db = getFirebaseDb();
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
    const chunks: string[][] = [];
    for (let i = 0; i < uniqueIds.length; i += 10) {
      chunks.push(uniqueIds.slice(i, i + 10));
    }

    const categories = new Map<string, Category>();
    for (const chunk of chunks) {
      const q = query(collection(db, COLLECTION), where(documentId(), "in", chunk));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((docSnap) => {
        categories.set(docSnap.id, normalizeCategory(docSnap.id, docSnap.data() as Record<string, unknown>));
      });
    }

    return ids.map((id) => categories.get(id)).filter((category): category is Category => Boolean(category));
  }

  static async getCategoriesBySlugs(slugs: string[]) {
    if (!isBrowserEnvironment() || slugs.length === 0) {
      return [];
    }

    const db = getFirebaseDb();
    const categories: Category[] = [];
    for (const slug of slugs) {
      const category = await this.getCategoryBySlug(slug);
      if (category) categories.push(category);
    }

    return categories;
  }

  static async createCategory(input: Omit<Category, "id">) {
    if (!isBrowserEnvironment()) {
      throw new Error("Category creation is only available in the browser.");
    }

    const db = getFirebaseDb();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...input,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return ref.id;
  }

  static async updateCategory(id: string, data: Partial<Category>) {
    if (!isBrowserEnvironment()) {
      throw new Error("Category updates are only available in the browser.");
    }

    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  static async deleteCategory(id: string) {
    if (!isBrowserEnvironment()) {
      throw new Error("Category deletion is only available in the browser.");
    }

    const db = getFirebaseDb();
    const featuredSnap = await getDocs(collection(db, FEATURED_COLLECTION));
    const deleteRefs = featuredSnap.docs.filter((docSnap) => String((docSnap.data() as Record<string, unknown>).categoryId ?? "") === id);
    const batchDelete = deleteRefs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(batchDelete);
    await deleteDoc(doc(db, COLLECTION, id));
  }
}
