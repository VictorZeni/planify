"use client";

import { useStreak } from "@/hooks/use-streak";

type StreakIndicatorProps = {
  currentStreak: number;
  hasCompletedToday: boolean;
};

export function StreakIndicator({ currentStreak, hasCompletedToday }: StreakIndicatorProps) {
  const streak = useStreak(currentStreak, hasCompletedToday);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Sequência Inteligente</p>
      <p className="mt-2 text-xl font-bold text-white">{streak.label}</p>
      {streak.riskMessage ? (
        <p className="mt-2 text-sm text-amber-200">{streak.riskMessage}</p>
      ) : (
        <p className="mt-2 text-sm text-emerald-200">Boa. Você manteve consistência hoje.</p>
      )}
    </section>
  );
}
