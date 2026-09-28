/**
 * Storage de auth — só localStorage (sem Lovable / preview broker).
 */
export function brokeredPreviewStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return localStorage;
}
