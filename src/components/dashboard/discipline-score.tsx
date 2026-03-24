"use client";

import { useDisciplineScore } from "@/hooks/use-discipline-score";

type DisciplineScoreProps = {
  completionRate: number;
  weeklyCompletions: number;
  streak: number;
};

export function DisciplineScore({
  completionRate,
  weeklyCompletions,
  streak,
}: DisciplineScoreProps) {
  const { score } = useDisciplineScore({ completionRate, weeklyCompletions, streak });

  return (
    <section className="rounded-xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Disciplina</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--app-text)]">{score}/100</p>
      <div className="mt-3 h-2 rounded-full bg-[var(--app-surface-soft)]">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-[var(--app-primary)] to-[#4ade80] transition-all duration-300"
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--app-text-muted)]">Atualizado por execução, frequência e sequência.</p>
    </section>
  );
}

