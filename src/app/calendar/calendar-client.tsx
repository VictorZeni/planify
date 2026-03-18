"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";

type TaskEvent = {
  id: string;
  title: string;
  dueAt: string | null;
  completed: boolean;
};

type ViewMode = "month" | "week" | "day";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function CalendarClient({ tasks }: { tasks: TaskEvent[] }) {
  const [view, setView] = useState<ViewMode>("month");
  const [cursor, setCursor] = useState(startOfDay(new Date()));

  const tasksByDay = useMemo(() => {
    const map = new Map<string, TaskEvent[]>();
    tasks.forEach((task) => {
      if (!task.dueAt) return;
      const key = formatKey(new Date(task.dueAt));
      const current = map.get(key) ?? [];
      current.push(task);
      map.set(key, current);
    });
    return map;
  }, [tasks]);

  function shift(direction: -1 | 1) {
    const next = new Date(cursor);
    if (view === "month") next.setMonth(next.getMonth() + direction);
    if (view === "week") next.setDate(next.getDate() + direction * 7);
    if (view === "day") next.setDate(next.getDate() + direction);
    setCursor(next);
  }

  const monthGrid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    const dayOfWeek = (first.getDay() + 6) % 7;
    start.setDate(first.getDate() - dayOfWeek);

    return Array.from({ length: 42 }).map((_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [cursor]);

  const weekDays = useMemo(() => {
    const day = startOfDay(cursor);
    const mondayOffset = ((day.getDay() + 6) % 7) * -1;
    const monday = new Date(day);
    monday.setDate(day.getDate() + mondayOffset);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [cursor]);

  const selectedDayTasks = tasksByDay.get(formatKey(cursor)) ?? [];

  return (
    <div className="space-y-4">
      <SectionCard
        title="Calendário"
        subtitle="Visual mensal, semanal e diário para planejamento completo."
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => shift(-1)}
              className="rounded-lg border border-slate-700 p-2 text-slate-200 transition hover:border-slate-500"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => shift(1)}
              className="rounded-lg border border-slate-700 p-2 text-slate-200 transition hover:border-slate-500"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        }
      >
        <div className="mb-4 flex gap-2">
          {(["month", "week", "day"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                view === mode
                  ? "bg-cyan-400 text-slate-950"
                  : "border border-slate-700 text-slate-200 hover:border-slate-500"
              }`}
            >
              {mode === "month" ? "Mês" : mode === "week" ? "Semana" : "Dia"}
            </button>
          ))}
        </div>

        {view === "month" ? (
          <div className="grid grid-cols-7 gap-2 text-xs">
            {monthGrid.map((date) => {
              const key = formatKey(date);
              const hasTasks = (tasksByDay.get(key)?.length ?? 0) > 0;
              const isCurrentMonth = date.getMonth() === cursor.getMonth();
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setCursor(date);
                    setView("day");
                  }}
                  className={`rounded-lg border p-2 text-left transition ${
                    isCurrentMonth ? "border-slate-700" : "border-slate-800 opacity-60"
                  } ${hasTasks ? "bg-cyan-500/10" : "bg-slate-900/60"}`}
                >
                  <p className="font-semibold text-slate-200">{date.getDate()}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {hasTasks ? `${tasksByDay.get(key)?.length} tarefas` : "Sem tarefas"}
                  </p>
                </button>
              );
            })}
          </div>
        ) : null}

        {view === "week" ? (
          <div className="grid gap-2 md:grid-cols-7">
            {weekDays.map((date) => {
              const key = formatKey(date);
              const dayTasks = tasksByDay.get(key) ?? [];
              return (
                <div key={key} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                  <p className="text-xs font-semibold text-slate-200">{date.toLocaleDateString("pt-BR")}</p>
                  <div className="mt-2 space-y-1">
                    {dayTasks.length === 0 ? (
                      <p className="text-[11px] text-slate-500">Sem tarefas</p>
                    ) : (
                      dayTasks.slice(0, 3).map((task) => (
                        <p key={task.id} className="truncate text-[11px] text-slate-300">
                          • {task.title}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {view === "day" ? (
          <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-sm font-semibold text-slate-100">
              {cursor.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </p>
            <div className="mt-3 space-y-2">
              {selectedDayTasks.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhuma tarefa para este dia.</p>
              ) : (
                selectedDayTasks.map((task) => (
                  <p key={task.id} className="rounded-md border border-slate-700 p-2 text-sm text-slate-200">
                    {task.completed ? "✅" : "•"} {task.title}
                  </p>
                ))
              )}
            </div>
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
