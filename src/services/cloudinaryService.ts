import type { ProductImage } from "../types/product";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

export class CloudinaryService {

  /**
   * Upload a single image
   */
  static async uploadImage(
    file: File,
    folder: string
  ): Promise<ProductImage> {

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", `dharaj/${folder}`);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image.");
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
    folder: string
  ): Promise<ProductImage[]> {

    const uploads = files.map((file) =>
      this.uploadImage(file, folder)
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