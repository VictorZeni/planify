"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SectionCard } from "@/components/ui/section-card";
import { addDaysToDateInput, toDateInputValue } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Goal = {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: "active" | "paused" | "completed";
};

type GoalProgress = {
  goalId: string;
  total: number;
  completed: number;
};

export function GoalsClient({
  initialGoals,
  initialProgress,
}: {
  initialGoals: Goal[];
  initialProgress: GoalProgress[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [goals, setGoals] = useState(initialGoals);
  const [progress, setProgress] = useState(initialProgress);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [message, setMessage] = useState("");

  const progressMap = useMemo(
    () => new Map(progress.map((row) => [row.goalId, row])),
    [progress],
  );

  async function createGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length < 3) {
      setMessage("Título muito curto.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        target_date: targetDate || null,
      })
      .select("id, title, description, target_date, status")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setGoals((prev) => [data as Goal, ...prev]);
    setProgress((prev) => [{ goalId: data.id, total: 0, completed: 0 }, ...prev]);
    setTitle("");
    setDescription("");
    setTargetDate("");
    setMessage("Meta criada.");
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Nova meta" subtitle="Defina objetivos de curto, médio e longo prazo.">
        <form onSubmit={createGoal} className="grid gap-3 md:grid-cols-2">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Conseguir certificação em 90 dias"
          />
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descrição (opcional)"
          />
          <Input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            {[
              { label: "+30 dias", value: addDaysToDateInput(30) },
              { label: "+90 dias", value: addDaysToDateInput(90) },
              { label: "+365 dias", value: addDaysToDateInput(365) },
              { label: "Hoje", value: toDateInputValue(new Date()) },
            ].map((preset) => (
              <Button
                key={preset.label}
                type="button"
                onClick={() => setTargetDate(preset.value)}
                size="sm"
                variant="secondary"
              >
                {preset.label}
              </Button>
            ))}
            <Button type="button" onClick={() => setTargetDate("")} size="sm" variant="secondary">
              Sem data
            </Button>
          </div>
          <Button type="submit" variant="primary" className="md:col-span-2">
            Salvar meta
          </Button>
        </form>
      </SectionCard>

      <SectionCard title="Metas ativas" subtitle="Acompanhe evolução visualmente.">
        <div className="space-y-3">
          {goals.length === 0 ? (
            <p className="text-sm text-[var(--app-text-muted)]">Nenhuma meta cadastrada.</p>
          ) : (
            goals.map((goal) => {
              const p = progressMap.get(goal.id) ?? { total: 0, completed: 0 };
              const percent = p.total === 0 ? 0 : Math.round((p.completed / p.total) * 100);
              return (
                <div key={goal.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                  <p className="font-semibold text-[var(--app-text)]">{goal.title}</p>
                  {goal.description ? (
                    <p className="mt-1 text-sm text-[var(--app-text-muted)]">{goal.description}</p>
                  ) : null}
                  {goal.target_date ? (
                    <p className="mt-1 text-xs text-[var(--app-primary-strong)]">
                      Data alvo: {new Date(`${goal.target_date}T00:00:00`).toLocaleDateString("pt-BR")}
                    </p>
                  ) : null}
                  <div className="mt-3 h-2 rounded-full bg-white">
                    <div className="h-2 rounded-full bg-gradient-to-r from-[var(--app-primary)] to-[#4ade80]" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-[var(--app-text-muted)]">
                    Progresso: {percent}% ({p.completed}/{p.total} etapas)
                  </p>
                </div>
              );
            })
          )}
        </div>
        {message ? <p className="mt-4 text-sm text-[var(--app-primary-strong)]">{message}</p> : null}
      </SectionCard>
    </div>
  );
}

