"use client";

import { useMemo } from "react";

type Input = {
  completionRate: number;
  weeklyCompletions: number;
  streak: number;
};

export function useDisciplineScore({ completionRate, weeklyCompletions, streak }: Input) {
  return useMemo(() => {
    const completionPart = Math.min(completionRate, 100) * 0.45;
    const weeklyPart = Math.min(weeklyCompletions * 8, 100) * 0.25;
    const streakPart = Math.min(streak * 10, 100) * 0.3;
    const score = Math.round(completionPart + weeklyPart + streakPart);
    return { score: Math.max(0, Math.min(score, 100)) };
  }, [completionRate, weeklyCompletions, streak]);
}
