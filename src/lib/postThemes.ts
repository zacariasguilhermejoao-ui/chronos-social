export type PostTheme = {
  id: string;
  label: string;
  className: string; // aplicado ao container do post
  textClass: string; // cor do texto
};

// 12 presets — sólidos e degradês. Idênticos em UI de post e Story.
export const POST_THEMES: PostTheme[] = [
  { id: "sunset", label: "Sunset", className: "bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600", textClass: "text-white" },
  { id: "ocean", label: "Ocean", className: "bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700", textClass: "text-white" },
  { id: "forest", label: "Forest", className: "bg-gradient-to-br from-emerald-500 via-teal-600 to-green-800", textClass: "text-white" },
  { id: "royal", label: "Royal", className: "bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600", textClass: "text-white" },
  { id: "gold", label: "Gold", className: "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600", textClass: "text-black" },
  { id: "mono", label: "Mono", className: "bg-gradient-to-br from-neutral-800 via-neutral-900 to-black", textClass: "text-white" },
  { id: "candy", label: "Candy", className: "bg-gradient-to-br from-pink-400 via-rose-400 to-red-400", textClass: "text-white" },
  { id: "lime", label: "Lime", className: "bg-gradient-to-br from-lime-400 via-green-500 to-emerald-600", textClass: "text-black" },
  { id: "crimson", label: "Crimson", className: "bg-gradient-to-br from-red-600 via-rose-700 to-red-900", textClass: "text-white" },
  { id: "sky", label: "Sky", className: "bg-sky-500", textClass: "text-white" },
  { id: "night", label: "Night", className: "bg-slate-900", textClass: "text-white" },
  { id: "cream", label: "Cream", className: "bg-amber-100", textClass: "text-neutral-900" },
];

export const themeById = (id?: string | null) =>
  id ? POST_THEMES.find((t) => t.id === id) ?? null : null;
