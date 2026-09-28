/** Storage de auth para preview embutido (Lovable). Em produção usa localStorage. */
export function brokeredPreviewStorage(): Storage {
  return localStorage;
}
