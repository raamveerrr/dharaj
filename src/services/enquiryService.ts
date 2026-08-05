import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import type {
  BusinessEnquiry,
  BusinessEnquiryInput,
  EnquiryStatus,
  EnquiryType,
} from "@/types/enquiry";
import { ENQUIRY_STATUSES, ENQUIRY_TYPES } from "@/types/enquiry";

const COLLECTION = "businessEnquiries";

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (
    value &&
    typeof value === "object" &&
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

function normalize(raw: Record<string, unknown> & { id: string }): BusinessEnquiry {
  const type = ENQUIRY_TYPES.includes(raw.enquiryType as EnquiryType)
    ? (raw.enquiryType as EnquiryType)
    : "Other";
  const status = ENQUIRY_STATUSES.includes(raw.status as EnquiryStatus)
    ? (raw.status as EnquiryStatus)
    : "New";

  return {
    id: raw.id,
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    phone: String(raw.phone ?? ""),
    company: String(raw.company ?? ""),
    city: String(raw.city ?? ""),
    state: String(raw.state ?? ""),
    enquiryType: type,
    message: String(raw.message ?? ""),
    status,
    createdAt: toDate(raw.createdAt),
  };
}

export class EnquiryService {
  static async createEnquiry(input: BusinessEnquiryInput) {
    const db = getFirebaseDb();
    const ref = await addDoc(collection(db, COLLECTION), {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      company: input.company.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      enquiryType: input.enquiryType,
      message: input.message.trim(),
      status: "New" as EnquiryStatus,
      createdAt: serverTimestamp(),
    });
    return ref.id;
  }

  static async listEnquiries(): Promise<BusinessEnquiry[]> {
    const db = getFirebaseDb();
    try {
      const snapshot = await getDocs(
        query(collection(db, COLLECTION), orderBy("createdAt", "desc")),
      );
      return snapshot.docs.map((d) => normalize({ id: d.id, ...d.data() }));
    } catch {
      const snapshot = await getDocs(collection(db, COLLECTION));
      return snapshot.docs
        .map((d) => normalize({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
    }
  }

  static async updateStatus(id: string, status: EnquiryStatus) {
    const db = getFirebaseDb();
    await updateDoc(doc(db, COLLECTION, id), { status, updatedAt: serverTimestamp() });
  }

  static async deleteEnquiry(id: string) {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, COLLECTION, id));
  }
}

/** Fire-and-forget notification emails (admin + customer) via the server route. */
export async function sendEnquiryEmails(input: BusinessEnquiryInput) {
  try {
    const res = await fetch("/api/public/business-enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      console.warn("Enquiry email notification failed", res.status, await res.text());
    }
  } catch (error) {
    console.warn("Enquiry email notification failed", error);
  }
}
