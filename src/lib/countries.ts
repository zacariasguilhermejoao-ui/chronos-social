/** Lista curta de países (código + nome) para formulários. */
export const COUNTRIES: { code: string; name: string; dial: string }[] = [
  { code: "AO", name: "Angola", dial: "+244" },
  { code: "PT", name: "Portugal", dial: "+351" },
  { code: "BR", name: "Brasil", dial: "+55" },
  { code: "MZ", name: "Moçambique", dial: "+258" },
  { code: "CV", name: "Cabo Verde", dial: "+238" },
  { code: "ST", name: "São Tomé e Príncipe", dial: "+239" },
  { code: "GW", name: "Guiné-Bissau", dial: "+245" },
  { code: "US", name: "Estados Unidos", dial: "+1" },
  { code: "GB", name: "Reino Unido", dial: "+44" },
  { code: "FR", name: "França", dial: "+33" },
  { code: "DE", name: "Alemanha", dial: "+49" },
  { code: "ES", name: "Espanha", dial: "+34" },
  { code: "ZA", name: "África do Sul", dial: "+27" },
  { code: "NG", name: "Nigéria", dial: "+234" },
  { code: "KE", name: "Quénia", dial: "+254" },
  { code: "CN", name: "China", dial: "+86" },
  { code: "IN", name: "Índia", dial: "+91" },
];

export function countryByCode(code: string) {
  return COUNTRIES.find((c) => c.code === code);
}
