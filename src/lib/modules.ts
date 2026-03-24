export type PlanifyModule = {
  title: string;
  description: string;
  route: string;
};

export const PLANIFY_MODULES: PlanifyModule[] = [
  {
    title: "Equilíbrio Produtivo",
    description:
      "Conquiste uma vida mais equilibrada, maximizando sua produtividade sem sobrecarregar.",
    route: "/modules/equilibrio",
  },
  {
    title: "Quadro dos Sonhos",
    description: "Visualize seus objetivos e transforme-os em realidade.",
    route: "/modules/quadro-dos-sonhos",
  },
  {
    title: "Hábitos Atômicos",
    description: "Desenvolva pequenos hábitos que geram grandes resultados.",
    route: "/modules/habitos-atomicos",
  },
  {
    title: "Gráfico de Produtividade",
    description: "Visualize e acompanhe o aumento da sua produtividade.",
    route: "/modules/grafico-de-produtividade",
  },
  {
    title: "Plano de Ação",
    description: "Defina suas metas e tome ação com clareza.",
    route: "/modules/plano-de-acao",
  },
  {
    title: "Listas de Cursos",
    description: "Organize e acesse cursos relevantes para seu crescimento.",
    route: "/modules/listas-de-cursos",
  },
  {
    title: "Lista de Leitura",
    description: "Organize sua leitura para aprimorar seus conhecimentos.",
    route: "/modules/lista-de-leitura",
  },
  {
    title: "Planejamento Diário",
    description: "Planeje suas tarefas e maximize seu tempo.",
    route: "/modules/planejamento-diario",
  },
  {
    title: "Ikigai",
    description: "Conecte sua paixão, missão e profissão para o equilíbrio.",
    route: "/modules/ikigai",
  },
];

export function getModuleBySlug(slug: string) {
  return PLANIFY_MODULES.find((moduleItem) => moduleItem.route === `/modules/${slug}`) ?? null;
}
