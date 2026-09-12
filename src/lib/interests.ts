// Interesses partilhados entre o registo e o Gestor de Anúncios da Chrónos
export type Interest = { key: string; label: string; emoji: string };

export const INTERESTS: Interest[] = [
  { key: "tech", label: "Tecnologia", emoji: "💻" },
  { key: "music", label: "Música", emoji: "🎵" },
  { key: "fashion", label: "Moda", emoji: "👗" },
  { key: "sports", label: "Desporto", emoji: "⚽" },
  { key: "business", label: "Negócios", emoji: "📈" },
  { key: "games", label: "Jogos", emoji: "🎮" },
  { key: "art", label: "Arte", emoji: "🎨" },
  { key: "humor", label: "Humor", emoji: "😂" },
  { key: "education", label: "Educação", emoji: "📚" },
  { key: "politics", label: "Política", emoji: "🏛️" },
  { key: "cinema", label: "Cinema", emoji: "🎬" },
  { key: "travel", label: "Viagens", emoji: "✈️" },
  { key: "animals", label: "Animais", emoji: "🐾" },
  { key: "cars", label: "Automóveis", emoji: "🚗" },
  { key: "realestate", label: "Imóveis", emoji: "🏠" },
  { key: "jobs", label: "Emprego", emoji: "💼" },
  { key: "food", label: "Comida", emoji: "🍲" },
  { key: "beauty", label: "Beleza", emoji: "💄" },
  { key: "health", label: "Saúde", emoji: "🩺" },
  { key: "finance", label: "Finanças", emoji: "💰" },
  { key: "photo", label: "Fotografia", emoji: "📷" },
];

export const interestLabel = (key: string) =>
  INTERESTS.find((i) => i.key === key)?.label ?? key;

export const ANGOLA_PROVINCES: Record<string, string[]> = {
  Luanda: ["Belas", "Cacuaco", "Cazenga", "Icolo e Bengo", "Luanda", "Quiçama", "Talatona", "Viana"],
  Benguela: ["Benguela", "Baía Farta", "Bocoio", "Catumbela", "Cubal", "Ganda", "Lobito"],
  Huambo: ["Huambo", "Bailundo", "Caála", "Catchiungo", "Ekunha", "Longonjo"],
  Huíla: ["Lubango", "Caconda", "Chibia", "Humpata", "Matala", "Quipungo"],
  Bié: ["Kuito", "Andulo", "Camacupa", "Catabola", "Chinguar"],
  Cabinda: ["Cabinda", "Belize", "Buco-Zau", "Cacongo"],
  Cuanza_Norte: ["N'dalatando", "Cazengo", "Golungo Alto", "Lucala"],
  Cuanza_Sul: ["Sumbe", "Gabela", "Porto Amboim", "Quibala", "Waku Kungo"],
  Cunene: ["Ondjiva", "Cahama", "Curoca", "Namacunde"],
  Huila_Sul: ["Chicomba", "Jamba", "Quilengues"],
  Malanje: ["Malanje", "Cacuso", "Calandula", "Cangandala"],
  Moxico: ["Luena", "Camanongue", "Léua", "Luchazes"],
  Namibe: ["Moçâmedes", "Bibala", "Camucuio", "Tômbwa"],
  Uíge: ["Uíge", "Bembe", "Negage", "Songo"],
  Zaire: ["M'banza Kongo", "Soyo", "N'zeto", "Tomboco"],
  Lunda_Norte: ["Dundo", "Cambulo", "Lucapa"],
  Lunda_Sul: ["Saurimo", "Cacolo", "Dala"],
  Cuando_Cubango: ["Menongue", "Cuito Cuanavale", "Mavinga"],
};

export const PROVINCE_LABEL = (p: string) => p.replace(/_/g, " ");
