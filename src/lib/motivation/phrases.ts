export const MOTIVATION_PHRASES = [
  "Hoje Ã© o dia de fazer acontecer.",
  "Pequenos passos ainda sÃ£o progresso.",
  "Disciplina vence motivaÃ§Ã£o.",
  "VocÃª estÃ¡ mais perto do que imagina.",
  "Comece antes de estar pronto.",
  "ConsistÃªncia cria resultados.",
  "Foque no processo, nÃ£o sÃ³ no resultado.",
  "Seu esforÃ§o de hoje constrÃ³i seu amanhÃ£.",
  "NÃ£o pare agora.",
  "FaÃ§a mesmo sem vontade.",
  "VocÃª consegue mais do que pensa.",
  "Menos desculpas, mais aÃ§Ã£o.",
  "Um passo de cada vez.",
  "Seja melhor que ontem.",
  "AÃ§Ã£o gera motivaÃ§Ã£o.",
  "VocÃª jÃ¡ comeÃ§ou, continue.",
  "Resultados exigem constÃ¢ncia.",
  "Sem esforÃ§o, sem evoluÃ§Ã£o.",
  "PersistÃªncia Ã© o segredo.",
  "VocÃª estÃ¡ no caminho certo.",
  "Execute, ajuste, evolua.",
  "Hoje nÃ£o Ã© dia de desistir.",
  "Foque no que depende de vocÃª.",
  "Melhore 1% hoje.",
  "Disciplina Ã© liberdade.",
  "Transforme intenÃ§Ã£o em aÃ§Ã£o.",
  "Continue, mesmo devagar.",
  "VocÃª nÃ£o veio atÃ© aqui Ã  toa.",
  "O progresso vem da repetiÃ§Ã£o.",
  "Termine o que comeÃ§ou.",
] as const;

export function getPhraseForToday(date = new Date()) {
  const day = date.getDate();
  const index = (day - 1) % MOTIVATION_PHRASES.length;
  return MOTIVATION_PHRASES[index];
}

