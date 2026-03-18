"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SectionCard } from "@/components/ui/section-card";

type Goal = {
  id: string;
  title: string;
  description: string | null;
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
      })
      .select("id, title, description, status")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setGoals((prev) => [data as Goal, ...prev]);
    setProgress((prev) => [{ goalId: data.id, total: 0, completed: 0 }, ...prev]);
    setTitle("");
    setDescription("");
    setMessage("Meta criada.");
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Nova meta" subtitle="Defina objetivos de curto, médio e longo prazo.">
        <form onSubmit={createGoal} className="grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Conseguir certificação em 90 dias"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descrição (opcional)"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 md:col-span-2"
          >
            Salvar meta
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Metas ativas" subtitle="Acompanhe evolução visualmente.">
        <div className="space-y-3">
          {goals.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhuma meta cadastrada.</p>
          ) : (
            goals.map((goal) => {
              const p = progressMap.get(goal.id) ?? { total: 0, completed: 0 };
              const percent = p.total === 0 ? 0 : Math.round((p.completed / p.total) * 100);
              return (
                <div
                  key={goal.id}
                  className="rounded-xl border border-slate-700 bg-slate-900/60 p-4"
                >
                  <p className="font-semibold text-slate-100">{goal.title}</p>
                  {goal.description ? (
                    <p className="mt-1 text-sm text-slate-300">{goal.description}</p>
                  ) : null}
                  <div className="mt-3 h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-lime-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Progresso: {percent}% ({p.completed}/{p.total} etapas)
                  </p>
                </div>
              );
            })
          )}
        </div>
        {message ? <p className="mt-4 text-sm text-cyan-200">{message}</p> : null}
      </SectionCard>
    </div>
  );
}
