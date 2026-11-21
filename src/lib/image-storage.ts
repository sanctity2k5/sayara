export const MAX_IMAGES_PER_LISTING = 6;
const MAX_DIMENSION = 1200;
const WEBP_QUALITY = 0.78;

export function isQuotaExceededError(err: unknown): boolean {
  if (!(err instanceof DOMException)) return false;
  return (
    err.code === 22 ||
    err.code === 1014 ||
    err.name === "QuotaExceededError" ||
    err.name === "NS_ERROR_DOM_QUOTA_REACHED"
  );
}

export function estimateLocalStorageBytes(): number {
  if (typeof window === "undefined") return 0;
  let total = 0;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      const val = window.localStorage.getItem(key) ?? "";
      total += (key.length + val.length) * 2;
    }
  } catch {
    return 0;
  }
  return total;
}

export async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Invalid image format."));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/webp", WEBP_QUALITY);
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
