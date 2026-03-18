"use client";

import { useMemo } from "react";

export function useStreak(currentStreak: number, hasCompletedToday: boolean) {
  return useMemo(() => {
    const risk = currentStreak > 0 && !hasCompletedToday;
    return {
      currentStreak,
      label: `🔥 ${currentStreak} dias`,
      risk,
      riskMessage: risk ? "Você pode perder sua sequência hoje." : null,
    };
  }, [currentStreak, hasCompletedToday]);
}
