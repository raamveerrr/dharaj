import { collection, getDocs } from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase";
import type { Customer } from "@/types/customer";

const COLLECTION = "users";

function normalizeCustomer(raw: Record<string, unknown> & { id?: string }): Customer {
  const role = String(raw.role ?? "customer");
  const isCustomer = role === "customer" || (!raw.role && !raw.isAdmin);

  if (!isCustomer) {
    return {
      id: String(raw.id ?? ""),
      name: String(raw.displayName ?? "Admin"),
      email: String(raw.email ?? ""),
      phone: String(raw.phone ?? ""),
      orders: Number(raw.orders ?? 0),
      spent: Number(raw.spent ?? 0),
      joined: typeof raw.createdAt === "string" ? raw.createdAt : "—",
      status: "active",
    };
  }

  return {
    id: String(raw.id ?? ""),
    name: String(raw.displayName ?? raw.name ?? "Customer"),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    orders: Number(raw.orders ?? 0),
    spent: Number(raw.spent ?? 0),
    joined: typeof raw.createdAt === "string" ? raw.createdAt : "—",
    status: raw.isActive === false ? "inactive" : "active",
  };
}

export class CustomerService {
  static async listCustomers(): Promise<Customer[]> {
    const db = getFirebaseDb();
    const snapshot = await getDocs(collection(db, COLLECTION));

    return snapshot.docs
      .map((docSnap) => normalizeCustomer({ id: docSnap.id, ...docSnap.data() }))
      .filter((customer) => customer.email || customer.name !== "Admin");
  }
}
