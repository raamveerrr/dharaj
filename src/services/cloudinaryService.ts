import type { ProductImage } from "../types/product";
import { uploadImage as uploadToFirebaseStorage } from "@/lib/storage";

/** Fallback uploader: stores the file in Firebase Storage. */
async function uploadToFirebase(file: File | Blob, folder: string): Promise<ProductImage> {
  const asFile =
    file instanceof File ? file : new File([file], `${Date.now()}.jpg`, { type: file.type || "image/jpeg" });
  const url = await uploadToFirebaseStorage(asFile, `dharaj/${folder}`);
  return { url, publicId: url };
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

export interface CloudinaryUploadOptions {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
}

export class CloudinaryService {

  /**
   * Upload a single image
   */
  static async uploadImage(
    file: File | Blob,
    folder: string,
    options?: CloudinaryUploadOptions
  ): Promise<ProductImage> {

    // Cloudinary is optional. When it isn't configured (or the unsigned upload
    // is rejected, e.g. after a domain change), fall back to Firebase Storage
    // so admins can always upload images.
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      return uploadToFirebase(file, folder);
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", `dharaj/${folder}`);

    // Unsigned Cloudinary uploads only allow a small whitelist of request params.
    // Keep the request intentionally minimal and rely on the upload preset (or
    // a signed backend flow) to define image transformations instead of sending
    // them directly in the request body.
    void options;

    let response: Response;
    try {
      response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
    } catch {
      // Network/CORS failure (common right after a domain change) — fall back.
      return uploadToFirebase(file, folder);
    }

    if (!response.ok) {
      let message = "Failed to upload image.";
      try {
        const cloudError = await response.clone().json();
        if (cloudError?.error?.message) {
          message = cloudError.error.message;
        }
      } catch {
        // ignore JSON parse errors and fall back to the generic message
      }
      console.warn(`Cloudinary upload failed (${message}); using Firebase Storage instead.`);
      return uploadToFirebase(file, folder);
    }

    const data: CloudinaryResponse = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  }

  /**
   * Upload multiple images
   */
  static async uploadImages(
    files: File[],
    folder: string,
    options?: CloudinaryUploadOptions
  ): Promise<ProductImage[]> {

    const uploads = files.map((file) =>
      this.uploadImage(file, folder, options)
    );

    return Promise.all(uploads);
  }

  /**
   * Delete an image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      throw new Error("Cloudinary delete is not configured.");
    }

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", API_KEY);
    formData.append("api_secret", API_SECRET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete image.");
    }
  }
}