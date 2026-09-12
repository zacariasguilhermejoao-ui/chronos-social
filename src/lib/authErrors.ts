/**
 * Distingue uma falha de transporte (sem internet / servidor inacessível) de
 * um erro devolvido pelo servidor de autenticação (credenciais, rate limit...).
 * Um erro do servidor tem sempre `status`; uma falha de fetch não tem.
 */
export function isTransportError(err: any): boolean {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  if (typeof err?.status === "number" && err.status > 0) return false;
  const m = String(err?.message ?? "").toLowerCase();
  return (
    err?.name === "AuthRetryableFetchError" ||
    err?.name === "TypeError" ||
    /failed to fetch|load failed|networkerror|network request failed|timeout|aborted/.test(m)
  );
}

/** Mensagem exata para o utilizador, sem mascarar a causa real. */
export function authErrorMessage(err: any): string {
  if (isTransportError(err)) {
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    return offline
      ? "Sem ligação à internet. Liga-te à rede e tenta novamente."
      : "O servidor está temporariamente indisponível. Tenta novamente dentro de instantes.";
  }
  const status = err?.status;
  const code = String(err?.code ?? "");
  const msg = String(err?.message ?? "");
  if (code === "invalid_credentials" || /invalid login/i.test(msg)) {
    return "Email/número ou palavra-passe incorretos.";
  }
  if (code === "email_not_confirmed" || /email not confirmed/i.test(msg)) {
    return "Confirma o teu email antes de iniciar sessão.";
  }
  if (status === 429 || code === "over_request_rate_limit") {
    return "Demasiadas tentativas. Aguarda um momento e tenta de novo.";
  }
  if (status === 400 && /phone|sms/i.test(msg)) {
    return "Início de sessão por número não está disponível. Usa o teu email.";
  }
  if (status && status >= 500) {
    return "O servidor de autenticação falhou. Tenta novamente dentro de instantes.";
  }
  return msg || "Não foi possível iniciar sessão.";
}
