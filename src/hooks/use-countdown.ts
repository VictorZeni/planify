"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownState = {
  isActive: boolean;
  isUrgent: boolean;
  isExpired: boolean;
  hours: number;
  minutes: number;
  totalMinutes: number;
};

function getRemaining(deadline: string | null): CountdownState {
  if (!deadline) {
    return {
      isActive: false,
      isUrgent: false,
      isExpired: false,
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
    };
  }

  const now = Date.now();
  const due = new Date(deadline).getTime();
  const diff = due - now;
  const totalMinutes = Math.floor(diff / 60000);

  if (Number.isNaN(due)) {
    return {
      isActive: false,
      isUrgent: false,
      isExpired: false,
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
    };
  }

  if (totalMinutes <= 0) {
    return {
      isActive: false,
      isUrgent: true,
      isExpired: true,
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
    };
  }

  return {
    isActive: true,
    isUrgent: totalMinutes <= 48 * 60,
    isExpired: false,
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    totalMinutes,
  };
}

export function useCountdown(deadline: string | null) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((value) => value + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  void tick;
  const state = getRemaining(deadline);

  const label = useMemo(
    () => `${String(state.hours).padStart(2, "0")}h ${String(state.minutes).padStart(2, "0")}m`,
    [state.hours, state.minutes],
  );

  return { ...state, label };
}
