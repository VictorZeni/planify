type XpLevelCardProps = {
  xp: number;
  level: number;
  progressToNextLevel: number;
};

export function XpLevelCard({ xp, level, progressToNextLevel }: XpLevelCardProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-600/30 to-violet-600/20 p-5 backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Gamificacao</p>
      <h2 className="mt-2 text-xl font-bold text-white">Nivel {level}</h2>
      <p className="mt-1 text-sm text-cyan-100">XP total: {xp}</p>
      <div className="mt-4 h-2 rounded-full bg-slate-900/70">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-cyan-300 to-lime-300"
          style={{ width: `${progressToNextLevel}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-cyan-100">
        {progressToNextLevel}% para o proximo nivel
      </p>
    </section>
  );
}
