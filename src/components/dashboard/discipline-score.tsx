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
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Disciplina</p>
      <p className="mt-2 text-2xl font-bold text-white">{score}/100</p>
      <div className="mt-3 h-2 rounded-full bg-slate-800">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-lime-300 transition-all duration-300"
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-300">Atualizado por execução, frequência e sequência.</p>
    </section>
  );
}
