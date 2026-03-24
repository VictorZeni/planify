export const THEMES = [
  {
    id: "foco",
    label: "Foco (Azul)",
    description: "Aumenta concentraÃ§Ã£o e clareza mental.",
  },
  {
    id: "energia",
    label: "Energia (Laranja)",
    description: "Estimula aÃ§Ã£o e senso de urgÃªncia.",
  },
  {
    id: "calma",
    label: "Calma (Verde)",
    description: "Reduz ansiedade e favorece consistÃªncia.",
  },
  {
    id: "equilibrio",
    label: "EquilÃ­brio (Roxo)",
    description: "Combina criatividade com disciplina.",
  },
  {
    id: "impacto",
    label: "Impacto (Vermelho)",
    description: "Aumenta senso de urgÃªncia e intensidade de execuÃ§Ã£o.",
  },
] as const;

export type ThemeName = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeName = "foco";

export function isThemeName(value: string): value is ThemeName {
  return THEMES.some((theme) => theme.id === value);
}

