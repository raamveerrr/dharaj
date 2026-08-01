import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase";
import type { Product } from "../types/product";

const COLLECTION = "products";
const db = getFirebaseDb();

export class ProductService {

  static async createProduct(product: Omit<Product, "id">) {

    const docRef = await addDoc(collection(db, COLLECTION), {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  }

  static async updateProduct(id: string, data: Partial<Product>) {

    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });

  }

  static async deleteProduct(id: string) {

    await deleteDoc(doc(db, COLLECTION, id));

  }

  static async getProduct(id: string) {

    const snap = await getDoc(doc(db, COLLECTION, id));

    if (!snap.exists()) return null;

    return {
      id: snap.id,
      ...snap.data(),
    } as Product;

  }

  static async getProducts() {

    const snapshot = await getDocs(collection(db, COLLECTION));

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

  }

  static async getFeaturedProducts() {

    const q = query(
      collection(db, COLLECTION),
      where("featured", "==", true)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

  }

}