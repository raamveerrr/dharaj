import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export type NotificationItem = {
  id: string;
  title?: string;
  body?: string;
  userId?: string;
  read?: boolean;
  createdAt?: unknown;
};

const COLLECTION = "notifications";

export class NotificationService {
  static subscribeNotifications(userId: string, callback: (items: NotificationItem[]) => void) {
    if (typeof window === "undefined") return () => {};

    const db = getFirebaseDb();
    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const items: NotificationItem[] = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as any) }));
      callback(items);
    });
  }

  static async markAsRead(id: string) {
    if (typeof window === "undefined") return;
    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTION, id), { read: true });
  }
}
