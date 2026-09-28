import { useEffect, useRef } from "react";

/** QR simples via API pública (fallback visual). */
export function ProfileQR({ url, size = 180 }: { url: string; size?: number }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;
  return (
    <img src={src} alt="QR Code" width={size} height={size} className="rounded-xl bg-white p-2" />
  );
}
