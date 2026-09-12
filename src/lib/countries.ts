// Lista de países com indicativo telefónico internacional (E.164)
// Bandeira gerada por código ISO de 2 letras (regional indicator emoji)
export type Country = {
  code: string; // ISO-2
  name: string;
  dial: string; // sem o "+"
};

export const COUNTRIES: Country[] = [
  { code: "AO", name: "Angola", dial: "244" },
  { code: "PT", name: "Portugal", dial: "351" },
  { code: "BR", name: "Brasil", dial: "55" },
  { code: "MZ", name: "Moçambique", dial: "258" },
  { code: "CV", name: "Cabo Verde", dial: "238" },
  { code: "GW", name: "Guiné-Bissau", dial: "245" },
  { code: "ST", name: "São Tomé e Príncipe", dial: "239" },
  { code: "TL", name: "Timor-Leste", dial: "670" },
  { code: "GQ", name: "Guiné Equatorial", dial: "240" },
  { code: "ZA", name: "África do Sul", dial: "27" },
  { code: "NA", name: "Namíbia", dial: "264" },
  { code: "CD", name: "RD Congo", dial: "243" },
  { code: "CG", name: "Congo", dial: "242" },
  { code: "CM", name: "Camarões", dial: "237" },
  { code: "NG", name: "Nigéria", dial: "234" },
  { code: "KE", name: "Quénia", dial: "254" },
  { code: "GH", name: "Gana", dial: "233" },
  { code: "CI", name: "Costa do Marfim", dial: "225" },
  { code: "SN", name: "Senegal", dial: "221" },
  { code: "MA", name: "Marrocos", dial: "212" },
  { code: "EG", name: "Egito", dial: "20" },
  { code: "TN", name: "Tunísia", dial: "216" },
  { code: "DZ", name: "Argélia", dial: "213" },
  { code: "ES", name: "Espanha", dial: "34" },
  { code: "FR", name: "França", dial: "33" },
  { code: "IT", name: "Itália", dial: "39" },
  { code: "DE", name: "Alemanha", dial: "49" },
  { code: "GB", name: "Reino Unido", dial: "44" },
  { code: "IE", name: "Irlanda", dial: "353" },
  { code: "NL", name: "Países Baixos", dial: "31" },
  { code: "BE", name: "Bélgica", dial: "32" },
  { code: "CH", name: "Suíça", dial: "41" },
  { code: "LU", name: "Luxemburgo", dial: "352" },
  { code: "US", name: "Estados Unidos", dial: "1" },
  { code: "CA", name: "Canadá", dial: "1" },
  { code: "MX", name: "México", dial: "52" },
  { code: "AR", name: "Argentina", dial: "54" },
  { code: "CL", name: "Chile", dial: "56" },
  { code: "CO", name: "Colômbia", dial: "57" },
  { code: "PE", name: "Peru", dial: "51" },
  { code: "UY", name: "Uruguai", dial: "598" },
  { code: "VE", name: "Venezuela", dial: "58" },
  { code: "CN", name: "China", dial: "86" },
  { code: "JP", name: "Japão", dial: "81" },
  { code: "KR", name: "Coreia do Sul", dial: "82" },
  { code: "IN", name: "Índia", dial: "91" },
  { code: "AE", name: "Emirados Árabes Unidos", dial: "971" },
  { code: "AU", name: "Austrália", dial: "61" },
  { code: "NZ", name: "Nova Zelândia", dial: "64" },
];

export const DEFAULT_COUNTRY: Country =
  COUNTRIES.find((c) => c.code === "AO")!;

export function flagEmoji(code: string) {
  if (!code || code.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  const cc = code.toUpperCase();
  return String.fromCodePoint(
    A + cc.charCodeAt(0) - 65,
    A + cc.charCodeAt(1) - 65
  );
}
