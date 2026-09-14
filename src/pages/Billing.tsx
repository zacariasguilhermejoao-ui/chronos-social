import { ComingSoonPage } from "./ComingSoon";

export default function Billing() {
  return (
    <ComingSoonPage
      title="Pagamentos internacionais"
      subtitle="Recarrega Pontos e paga anúncios com cartão ou wallet digital."
      bullets={[
        "Visa, Mastercard e American Express",
        "Google Pay e Apple Pay",
        "Processamento seguro via Stripe",
        "Faturas automáticas e histórico completo",
      ]}
    />
  );
}
