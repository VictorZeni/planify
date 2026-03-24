"use client";

import { AlertTriangle } from "lucide-react";
import { useCountdown } from "@/hooks/use-countdown";
import type { Priority } from "@/lib/priority";

type CountdownBadgeProps = {
  deadline: string | null;
  priority: Priority;
};

export function CountdownBadge({ deadline, priority }: CountdownBadgeProps) {
  const countdown = useCountdown(deadline);

  if (priority !== "high") return null;
  if (!countdown.isUrgent && !countdown.isExpired) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-[var(--app-danger-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--app-danger-text)]">
      <AlertTriangle className="h-3 w-3" />
      {countdown.isExpired ? "Prazo vencido" : countdown.label}
    </span>
  );
}

