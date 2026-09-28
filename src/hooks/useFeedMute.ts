import { useCallback, useState } from "react";

const KEY = "chronos:feed-mute";

export function useFeedMute() {
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem(KEY) === "1"; } catch { return true; }
  });

  const toggle = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try { localStorage.setItem(KEY, next ? "1" : "0"); } catch {}
      return next;
    });
  }, []);

  return { muted, toggle, setMuted };
}
