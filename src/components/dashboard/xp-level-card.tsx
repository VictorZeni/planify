type XpLevelCardProps = {
  xp: number;
  level: number;
  progressToNextLevel: number;
};

export function XpLevelCard({ xp, level, progressToNextLevel }: XpLevelCardProps) {
  return (
    <section className="rounded-xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Gamificação</p>
      <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">Nível {level}</h2>
      <p className="mt-1 text-sm text-[var(--app-text-muted)]">XP total: {xp}</p>
      <div className="mt-4 h-2 rounded-full bg-[var(--app-surface-soft)]">
        <div className="h-2 rounded-full bg-gradient-to-r from-[var(--app-primary)] to-[#4ade80]" style={{ width: `${progressToNextLevel}%` }} />
      </div>
      <p className="mt-2 text-xs text-[var(--app-text-muted)]">{progressToNextLevel}% para o próximo nível</p>
    </section>
  );
}

