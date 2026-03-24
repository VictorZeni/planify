"use client";

import { useStreak } from "@/hooks/use-streak";

type StreakIndicatorProps = {
  currentStreak: number;
  hasCompletedToday: boolean;
};

export function StreakIndicator({ currentStreak, hasCompletedToday }: StreakIndicatorProps) {
  const streak = useStreak(currentStreak, hasCompletedToday);

  return (
    <section className="rounded-xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Sequência inteligente</p>
      <p className="mt-2 text-xl font-semibold text-[var(--app-text)]">{streak.label}</p>
      {streak.riskMessage ? (
        <p className="mt-2 text-sm text-[var(--app-warning-text)]">{streak.riskMessage}</p>
      ) : (
        <p className="mt-2 text-sm text-[var(--app-primary-strong)]">Boa. Você manteve consistência hoje.</p>
      )}
    </section>
  );
}

