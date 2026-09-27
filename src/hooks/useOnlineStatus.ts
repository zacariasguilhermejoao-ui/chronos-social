import { useCallback, useEffect, useState } from "react";

export function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const retry = useCallback(async () => {
    setChecking(true);
    try {
      await fetch("/" + "?_ping=" + Date.now(), { method: "HEAD", cache: "no-store" });
      setOnline(true);
    } catch {
      setOnline(navigator.onLine);
    } finally {
      setChecking(false);
    }
  }, []);

  return { online, checking, retry };
}
