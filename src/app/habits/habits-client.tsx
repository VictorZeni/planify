"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SectionCard } from "@/components/ui/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <SectionCard title="Novo hábito" subtitle="Construa consistência diária com pequenas ações.">
        <form onSubmit={createHabit} className="flex flex-col gap-3 md:flex-row">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Ler 20 minutos"
          />
          <Button type="submit" variant="primary">
            Criar
          </Button>
        </form>
      </SectionCard>

      <SectionCard title="Tracker de hábitos" subtitle="Marque sua execução de hoje.">
        <div className="space-y-3">
          {habits.length === 0 ? (
            <p className="text-sm text-[var(--app-text-muted)]">Nenhum hábito ainda.</p>
          ) : (
            habits.map((habit) => {
              const doneToday = checkins.some(
                (row) => row.habit_id === habit.id && row.checkin_date === today,
              );
              const weekHits = weekDays.filter((day) =>
                checkins.some((row) => row.habit_id === habit.id && row.checkin_date === day),
              ).length;

              return (
                <div key={habit.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[var(--app-text)]">{habit.name}</p>
                      <p className="text-xs text-[var(--app-text-muted)]">Consistência semanal: {weekHits}/7</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => void toggleCheckin(habit.id)}
                      size="sm"
                      variant={doneToday ? "primary" : "secondary"}
                    >
                      {doneToday ? "Feito hoje" : "Marcar hoje"}
                    </Button>
                  </div>
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

