export function friendlyAuthError(err: any): string {
  if (!err) return "Não foi possível iniciar sessão.";
  if (typeof err === "string") return err;
  if (err?.name === "AuthRetryableFetchError" || /failed to fetch|network/i.test(String(err?.message))) {
    return "O servidor está temporariamente indisponível. Tenta novamente dentro de instantes.";
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
