export const MOTIVATION_PHRASES = [
  "Hoje é o dia de fazer acontecer.",
  "Pequenos passos ainda são progresso.",
  "Disciplina vence motivação.",
  "Você está mais perto do que imagina.",
  "Comece antes de estar pronto.",
  "Consistência cria resultados.",
  "Foque no processo, não só no resultado.",
  "Seu esforço de hoje constrói seu amanhã.",
  "Não pare agora.",
  "Faça mesmo sem vontade.",
  "Você consegue mais do que pensa.",
  "Menos desculpas, mais ação.",
  "Um passo de cada vez.",
  "Seja melhor que ontem.",
  "Ação gera motivação.",
  "Você já começou, continue.",
  "Resultados exigem constância.",
  "Sem esforço, sem evolução.",
  "Persistência é o segredo.",
  "Você está no caminho certo.",
  "Execute, ajuste, evolua.",
  "Hoje não é dia de desistir.",
  "Foque no que depende de você.",
  "Melhore 1% hoje.",
  "Disciplina é liberdade.",
  "Transforme intenção em ação.",
  "Continue, mesmo devagar.",
  "Você não veio até aqui à toa.",
  "O progresso vem da repetição.",
  "Termine o que começou.",
] as const;

export function getPhraseForToday(date = new Date()) {
  const day = date.getDate();
  const index = (day - 1) % MOTIVATION_PHRASES.length;
  return MOTIVATION_PHRASES[index];
}
