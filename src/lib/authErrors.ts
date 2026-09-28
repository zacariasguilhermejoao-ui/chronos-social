export function isTransportError(err: any): boolean {
  const msg = String(err?.message ?? err ?? "").toLowerCase();
  return msg.includes("fetch") || msg.includes("network") || msg.includes("failed to fetch");
}

export function authErrorMessage(err: any): string {
  if (isTransportError(err)) return "Sem ligação. Verifica a internet e tenta de novo.";
  const msg = String(err?.message ?? err ?? "");
  const m = msg.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid credentials")) return "Email ou palavra-passe incorrectos.";
  if (m.includes("email not confirmed")) return "Confirma o teu email antes de entrar.";
  if (m.includes("user already registered")) return "Este email já tem conta.";
  if (m.includes("password")) return "Palavra-passe inválida.";
  return msg || "Algo correu mal. Tenta de novo.";
}
