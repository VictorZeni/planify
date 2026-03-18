"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SectionCard } from "@/components/ui/section-card";

type Habit = {
  id: string;
  name: string;
  target_frequency: "daily" | "weekly";
};

type HabitCheckin = {
  habit_id: string;
  checkin_date: string;
};

export function HabitsClient({
  initialHabits,
  initialCheckins,
}: {
  initialHabits: Habit[];
  initialCheckins: HabitCheckin[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [habits, setHabits] = useState(initialHabits);
  const [checkins, setCheckins] = useState(initialCheckins);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  async function createHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setMessage("Digite um nome de hábito válido.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: user.id,
        name: name.trim(),
      })
      .select("id, name, target_frequency")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setHabits((prev) => [data, ...prev]);
    setName("");
    setMessage("Hábito criado.");
  }

  async function toggleCheckin(habitId: string) {
    const already = checkins.some(
      (row) => row.habit_id === habitId && row.checkin_date === today,
    );

    if (already) {
      const { error } = await supabase
        .from("habit_checkins")
        .delete()
        .eq("habit_id", habitId)
        .eq("checkin_date", today);
      if (error) {
        setMessage(error.message);
        return;
      }
      setCheckins((prev) =>
        prev.filter((row) => !(row.habit_id === habitId && row.checkin_date === today)),
      );
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("habit_checkins").insert({
      habit_id: habitId,
      user_id: user.id,
      checkin_date: today,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setCheckins((prev) => [...prev, { habit_id: habitId, checkin_date: today }]);
  }

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  return (
    <div className="space-y-6">
      <SectionCard
        title="Novo hábito"
        subtitle="Construa consistência diária com pequenas ações."
      >
        <form onSubmit={createHabit} className="flex flex-col gap-3 md:flex-row">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Ler 20 minutos"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Criar
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Tracker de hábitos" subtitle="Marque sua execução de hoje.">
        <div className="space-y-3">
          {habits.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum hábito ainda.</p>
          ) : (
            habits.map((habit) => {
              const doneToday = checkins.some(
                (row) => row.habit_id === habit.id && row.checkin_date === today,
              );
              const weekHits = weekDays.filter((day) =>
                checkins.some((row) => row.habit_id === habit.id && row.checkin_date === day),
              ).length;

              return (
                <div
                  key={habit.id}
                  className="rounded-xl border border-slate-700 bg-slate-900/60 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-100">{habit.name}</p>
                      <p className="text-xs text-slate-400">Consistência semanal: {weekHits}/7</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggleCheckin(habit.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        doneToday
                          ? "border border-emerald-600 bg-emerald-500/20 text-emerald-200"
                          : "border border-slate-600 text-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {doneToday ? "Feito hoje" : "Marcar hoje"}
                    </button>
                  </div>
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
