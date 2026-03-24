"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SectionCard } from "@/components/ui/section-card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

type WeeklyPlan = {
  id: string;
  week_start: string;
  weekly_goal: string | null;
  top_tasks: string[] | null;
  weekly_review: string | null;
};

function currentWeekStart() {
  const today = new Date();
  const day = (today.getDay() + 6) % 7;
  today.setDate(today.getDate() - day);
  return today.toISOString().slice(0, 10);
}

export function WeeklyClient({ initialPlan }: { initialPlan: WeeklyPlan | null }) {
  const supabase = useMemo(() => createClient(), []);
  const [plan, setPlan] = useState<WeeklyPlan | null>(initialPlan);
  const [goal, setGoal] = useState(initialPlan?.weekly_goal ?? "");
  const [tasks, setTasks] = useState((initialPlan?.top_tasks ?? ["", "", ""]).slice(0, 3));
  const [review, setReview] = useState(initialPlan?.weekly_review ?? "");
  const [message, setMessage] = useState("");

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      user_id: user.id,
      week_start: currentWeekStart(),
      weekly_goal: goal.trim() || null,
      top_tasks: tasks.map((t) => t.trim()).filter(Boolean).slice(0, 3),
      weekly_review: review.trim() || null,
    };

    const { data, error } = await supabase
      .from("weekly_plans")
      .upsert(payload, { onConflict: "user_id,week_start" })
      .select("id, week_start, weekly_goal, top_tasks, weekly_review")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setPlan(data as WeeklyPlan);
    setMessage("Planejamento semanal salvo.");
  }

  return (
    <SectionCard title="Planejamento semanal" subtitle="Defina meta da semana, tarefas principais e revisão.">
      <form onSubmit={savePlan} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-[var(--app-text-muted)]">Meta da semana</label>
          <Input value={goal} onChange={(event) => setGoal(event.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm text-[var(--app-text-muted)]">Top 3 tarefas</label>
          <div className="grid gap-2 md:grid-cols-3">
            {tasks.map((task, index) => (
              <Input
                key={`weekly-task-${index}`}
                value={task}
                onChange={(event) =>
                  setTasks((prev) => prev.map((item, i) => (i === index ? event.target.value : item)))
                }
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-[var(--app-text-muted)]">Revisão semanal</label>
          <Textarea value={review} onChange={(event) => setReview(event.target.value)} rows={4} />
        </div>

        <Button type="submit" variant="primary">
          Salvar semana
        </Button>
      </form>

      {plan ? (
        <p className="mt-4 text-xs text-[var(--app-text-muted)]">Semana referência: {plan.week_start}</p>
      ) : null}
      {message ? <p className="mt-2 text-sm text-[var(--app-primary-strong)]">{message}</p> : null}
    </SectionCard>
  );
}

