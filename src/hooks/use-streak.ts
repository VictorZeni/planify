"use client";

import { useMemo } from "react";

export function useStreak(currentStreak: number, hasCompletedToday: boolean) {
  return useMemo(() => {
    const risk = currentStreak > 0 && !hasCompletedToday;
    return {
      currentStreak,
      label: `ðŸ”¥ ${currentStreak} dias`,
      risk,
      riskMessage: risk ? "VocÃª pode perder sua sequÃªncia hoje." : null,
    };
  }, [currentStreak, hasCompletedToday]);
}

