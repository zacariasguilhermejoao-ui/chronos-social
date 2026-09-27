import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Users } from "@/lib/icons";

export default function Groups() {
  useEffect(() => {
    /* redirect via <Navigate/> below */
  }, []);
  return <Navigate to="/messages" replace />;
}

export function GroupAvatar({ url, name, size = 44 }: { url?: string | null; name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="rounded-full overflow-hidden grid place-items-center bg-gradient-violet text-white font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials || <Users className="w-5 h-5" />
      )}
    </div>
  );
}
