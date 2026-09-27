import { useEffect, useState, useCallback } from "react";

export function useOnlineStatus() {
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [checking, setChecking] = useState(false);

  const probe = useCallback(async (): Promise<boolean> => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 5000);
      const res = await fetch("/favicon.ico?_=" + Date.now(), {
        method: "HEAD",
        cache: "no-store",
        signal: ctrl.signal,
      });
      clearTimeout(t);
      return res.ok || res.status === 0;
    } catch {
      return false;
    }
  }, []);

  const retry = useCallback(async () => {
    setChecking(true);
    const ok = await probe();
    setOnline(ok);
    setChecking(false);
    if (ok) {
      window.dispatchEvent(new Event("app:online"));
    }
    return ok;
  }, [probe]);

  useEffect(() => {
    const handleOnline = async () => {
      const ok = await probe();
      setOnline(ok);
      if (ok) window.dispatchEvent(new Event("app:online"));
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const id = setInterval(async () => {
      if (!navigator.onLine) {
        setOnline(false);
        return;
      }
      if (!online) {
        const ok = await probe();
        if (ok) {
          setOnline(true);
          window.dispatchEvent(new Event("app:online"));
        }
      }
    }, 8000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(id);
    };
  }, [online, probe]);

  return { online, checking, retry };
}
