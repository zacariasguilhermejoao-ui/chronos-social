import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ErrorBoundary } from "./ErrorBoundary";

export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const loc = useLocation();
  return <ErrorBoundary resetKey={loc.pathname}>{children}</ErrorBoundary>;
}
