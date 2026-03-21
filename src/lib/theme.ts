export const THEMES = [
  {
    id: "foco",
    label: "Foco (Azul)",
    description: "Aumenta concentração e clareza mental.",
  },
  {
    id: "energia",
    label: "Energia (Laranja)",
    description: "Estimula ação e senso de urgência.",
  },
  {
    id: "calma",
    label: "Calma (Verde)",
    description: "Reduz ansiedade e favorece consistência.",
  },
  {
    id: "equilibrio",
    label: "Equilíbrio (Roxo)",
    description: "Combina criatividade com disciplina.",
  },
] as const;

export type ThemeName = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeName = "foco";

export function isThemeName(value: string): value is ThemeName {
  return THEMES.some((theme) => theme.id === value);
}

