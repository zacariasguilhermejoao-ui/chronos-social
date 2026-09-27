import { ReactNode } from "react";
import { useLocation } from "react-router-dom";

export function PageTransition({ children }: { children: ReactNode }) {
  const loc = useLocation();
  return (
    <div key={loc.pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
