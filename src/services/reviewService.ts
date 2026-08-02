import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase";
import type { Review, ReviewStatus } from "@/types/review";

const COLLECTION = "reviews";

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

function formatRelativeDate(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;

  const diffYears = Math.round(diffMonths / 12);
  return `${diffYears} year${diffYears === 1 ? "" : "s"} ago`;
}

function normalizeReview(raw: Record<string, unknown> & { id?: string }): Review {
  const rating = Number(raw.rating ?? 0);
  const createdAt = toDate(raw.createdAt ?? new Date());

  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? "Verified Buyer"),
    productId: String(raw.productId ?? ""),
    productName: String(raw.productName ?? raw.product ?? "Product"),
    rating: (rating >= 1 && rating <= 5 ? rating : 5) as 1 | 2 | 3 | 4 | 5,
    title: String(raw.title ?? ""),
    text: String(raw.text ?? ""),
    date: typeof raw.date === "string" ? raw.date : formatRelativeDate(createdAt),
    createdAt,
    verified: Boolean(raw.verified ?? true),
    helpful: Number(raw.helpful ?? 0),
    status: (raw.status as ReviewStatus | undefined) ?? "approved",
    variant: typeof raw.variant === "string" ? raw.variant : undefined,
    photos: Array.isArray(raw.photos) ? raw.photos.map((photo) => String(photo)) : [],
    isDeleted: Boolean(raw.isDeleted ?? false),
  };
}

export class ReviewService {
  static async getAllReviews(): Promise<Review[]> {
    const db = getFirebaseDb();
    const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc")));
    return snapshot.docs
      .map((item) => normalizeReview({ id: item.id, ...item.data() }))
      .filter((item) => !item.isDeleted);
  }

  static async getReviewsByProduct(productId: string): Promise<Review[]> {
    const db = getFirebaseDb();
    const snapshot = await getDocs(query(collection(db, COLLECTION), where("productId", "==", productId)));

    return snapshot.docs
      .map((item) => normalizeReview({ id: item.id, ...item.data() }))
      .filter((item) => !item.isDeleted && item.status === "approved")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static subscribeReviewsByProduct(productId: string, callback: (reviews: Review[]) => void) {
    const db = getFirebaseDb();
    return onSnapshot(query(collection(db, COLLECTION), where("productId", "==", productId)), (snapshot) => {
      const reviews = snapshot.docs
        .map((item) => normalizeReview({ id: item.id, ...item.data() }))
        .filter((item) => !item.isDeleted && item.status === "approved")
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      callback(reviews);
    });
  }

  static async createReview(
    review: Omit<Review, "id" | "date" | "createdAt"> & { productId: string; productName: string },
  ): Promise<Review> {
    const db = getFirebaseDb();
    const payload = {
      ...review,
      createdAt: serverTimestamp(),
      helpful: Number(review.helpful ?? 0),
      verified: Boolean(review.verified ?? true),
      photos: review.photos ?? [],
      status: review.status ?? "approved",
    };

    const ref = await addDoc(collection(db, COLLECTION), payload);
    const createdAt = new Date();

    return {
      id: ref.id,
      ...review,
      date: "just now",
      createdAt,
      helpful: Number(review.helpful ?? 0),
      verified: Boolean(review.verified ?? true),
      photos: review.photos ?? [],
      status: review.status ?? "pending",
      isDeleted: false,
    };
  }

  static async updateReviewStatus(id: string, status: ReviewStatus) {
    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTION, id), { status });
  }

  static async deleteReview(id: string) {
    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTION, id), { isDeleted: true });
  }
}
