import { ComponentType, lazy } from "react";

export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  name = "chunk",
) {
  return lazy(async () => {
    const key = `__chunk_reload_${name}`;
    let lastErr: unknown;
    for (let i = 0; i < 3; i++) {
      try {
        const mod = await factory();
        sessionStorage.removeItem(key);
        return mod;
      } catch (err) {
        lastErr = err;
        await new Promise((r) => setTimeout(r, 250 * (i + 1)));
      }
    }
    if (typeof window !== "undefined" && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      window.location.reload();
    }
    throw lastErr;
  });
}
