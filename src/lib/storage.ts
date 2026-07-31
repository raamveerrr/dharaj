import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getFirebaseStorage } from "@/lib/firebase";

/** Uploads a file to Firebase Storage and returns its public download URL. */
export async function uploadImage(file: File, folder = "products"): Promise<string> {
  const storage = getFirebaseStorage();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type });
  return getDownloadURL(r);
}

/** Best-effort delete of a previously uploaded storage URL. */
export async function deleteImageByUrl(url: string): Promise<void> {
  if (!url.includes("firebasestorage")) return;
  try {
    await deleteObject(ref(getFirebaseStorage(), url));
  } catch {
    /* already gone — ignore */
  }
}
