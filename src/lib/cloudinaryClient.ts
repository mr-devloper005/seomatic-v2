// src/lib/cloudinaryClient.ts
export const CLOUDINARY_CLOUD_NAME = "dq3wtgqmt"; // your cloud name
export const CLOUDINARY_UPLOAD_PRESET = "frontend_upload"; // your unsigned preset name

/**
 * Uploads file to Cloudinary unsigned preset and returns secure_url.
 * If preset or cloud name missing, returns local object URL (dev fallback).
 */
export async function uploadToCloudinaryUnsigned(file: File): Promise<string> {
  if (!file) throw new Error("No file provided");
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.warn("Cloudinary config missing - returning local object URL for testing.");
    return URL.createObjectURL(file);
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`;
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  // optional: fd.append("folder", "my_app_pool");

  const resp = await fetch(url, { method: "POST", body: fd });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${resp.status} ${txt}`);
  }
  const data = await resp.json();
  if (!data) throw new Error("Cloudinary returned empty response");
  return data.secure_url || data.url;
}


