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
    <span className="inline-flex items-center gap-1 rounded-md border border-rose-700 bg-rose-950/50 px-2 py-0.5 text-[10px] font-semibold text-rose-200">
      <AlertTriangle className="h-3 w-3" />
      {countdown.isExpired ? "Prazo vencido" : countdown.label}
    </span>
  );
}
