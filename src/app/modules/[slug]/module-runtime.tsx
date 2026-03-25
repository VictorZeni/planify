"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input, Select, Textarea } from "@/components/ui/input";

type ModuleRuntimeProps = {
  slug: string;
};

type Task = {
  id: string;
  title: string;
  completed: boolean;
  due_at: string | null;
  created_at: string;
  completed_at?: string | null;
};

type Dream = {
  id: string;
  title: string | null;
  content: string;
};

type Habit = {
  id: string;
  name: string;
};

type HabitCheckin = {
  habit_id: string;
  checkin_date: string;
};

type Goal = {
  id: string;
  title: string;
};

type GoalStep = {
  id: string;
  goal_id: string;
  title: string;
  completed: boolean;
  sort_order: number;
};

type Course = {
  id: string;
  name: string;
  progress: number;
};

type Book = {
  id: string;
  name: string;
  status: "lendo" | "concluido";
};

type Ikigai = {
  love: string;
  goodAt: string;
  needs: string;
  paidFor: string;
};

const STORAGE_COURSES = "planify.modules.courses";
const STORAGE_BOOKS = "planify.modules.books";
const STORAGE_IKIGAI = "planify.modules.ikigai";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function ModuleRuntime({ slug }: ModuleRuntimeProps) {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [dreamFile, setDreamFile] = useState<File | null>(null);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitName, setHabitName] = useState("");
  const [habitCheckins, setHabitCheckins] = useState<HabitCheckin[]>([]);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalSteps, setGoalSteps] = useState<GoalStep[]>([]);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTasksText, setGoalTasksText] = useState("");
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalStepDrafts, setGoalStepDrafts] = useState<Record<string, string>>({});

  const [courses, setCourses] = useState<Course[]>([]);
  const [courseName, setCourseName] = useState("");
  const [courseProgress, setCourseProgress] = useState("0");

  const [books, setBooks] = useState<Book[]>([]);
  const [bookName, setBookName] = useState("");
  const [bookStatus, setBookStatus] = useState<Book["status"]>("lendo");

  const [dailyTitle, setDailyTitle] = useState("");

  const [ikigai, setIkigai] = useState<Ikigai>({
    love: "",
    goodAt: "",
    needs: "",
    paidFor: "",
  });

  useEffect(() => {
    void loadModuleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (courses.length > 0 || localStorage.getItem(STORAGE_COURSES)) {
      localStorage.setItem(STORAGE_COURSES, JSON.stringify(courses));
    }
  }, [courses]);

  useEffect(() => {
    if (books.length > 0 || localStorage.getItem(STORAGE_BOOKS)) {
      localStorage.setItem(STORAGE_BOOKS, JSON.stringify(books));
    }
  }, [books]);

  useEffect(() => {
    const hasAnyIkigai = Object.values(ikigai).some((value) => value.trim().length > 0);
    if (hasAnyIkigai || localStorage.getItem(STORAGE_IKIGAI)) {
      localStorage.setItem(STORAGE_IKIGAI, JSON.stringify(ikigai));
    }
  }, [ikigai]);

  async function loadModuleData() {
    setLoading(true);
    setMessage("");

    try {
      if (slug === "equilibrio" || slug === "grafico-de-produtividade" || slug === "planejamento-diario") {
        const { data, error } = await supabase
          .from("tasks")
          .select("id, title, completed, due_at, created_at, completed_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setTasks((data ?? []) as Task[]);
      }

      if (slug === "quadro-dos-sonhos") {
        const { data, error } = await supabase
          .from("notes")
          .select("id, title, content")
          .eq("category", "SONHOS_FOTO")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setDreams((data ?? []) as Dream[]);
      }

      if (slug === "habitos-atomicos") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [{ data: habitsData, error: habitsError }, { data: checkinsData, error: checkinsError }] =
          await Promise.all([
            supabase.from("habits").select("id, name").order("created_at", { ascending: false }),
            supabase
              .from("habit_checkins")
              .select("habit_id, checkin_date")
              .gte("checkin_date", thirtyDaysAgo.toISOString().slice(0, 10)),
          ]);

        if (habitsError) throw habitsError;
        if (checkinsError) throw checkinsError;
        setHabits((habitsData ?? []) as Habit[]);
        setHabitCheckins((checkinsData ?? []) as HabitCheckin[]);
      }

      if (slug === "plano-de-acao") {
        const [{ data: goalsData, error: goalsError }, { data: stepsData, error: stepsError }] = await Promise.all([
          supabase.from("goals").select("id, title").order("created_at", { ascending: false }),
          supabase
            .from("goal_steps")
            .select("id, goal_id, title, completed, sort_order")
            .order("sort_order", { ascending: true }),
        ]);
        if (goalsError) throw goalsError;
        if (stepsError) throw stepsError;
        setGoals((goalsData ?? []) as Goal[]);
        setGoalSteps((stepsData ?? []) as GoalStep[]);
      }

      if (slug === "listas-de-cursos") {
        setCourses(parseJson<Course[]>(localStorage.getItem(STORAGE_COURSES), []));
      }

      if (slug === "lista-de-leitura") {
        setBooks(parseJson<Book[]>(localStorage.getItem(STORAGE_BOOKS), []));
      }

      if (slug === "ikigai") {
        setIkigai(
          parseJson<Ikigai>(localStorage.getItem(STORAGE_IKIGAI), {
            love: "",
            goodAt: "",
            needs: "",
            paidFor: "",
          }),
        );
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }  async function addDream(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dreamFile) {
      setMessage("Selecione uma foto.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const extension = dreamFile.name.includes(".") ? dreamFile.name.split(".").pop() : "jpg";
    const storagePath = `${user.id}/dreams/${uid()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(storagePath, dreamFile, { upsert: false });

    if (uploadError) {
      setMessage(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(storagePath);

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        title: storagePath,
        content: publicUrl,
        category: "SONHOS_FOTO",
      })
      .select("id, title, content")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setDreams((prev) => [data as Dream, ...prev]);
    setDreamFile(null);
    setMessage("Foto adicionada.");
  }

  async function removeDream(id: string) {
    const target = dreams.find((item) => item.id === id);
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (target?.title) {
      await supabase.storage.from("avatars").remove([target.title]);
    }
    setDreams((prev) => prev.filter((item) => item.id !== id));
    setMessage("Foto removida.");
  }
  async function addHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (habitName.trim().length < 2) {
      setMessage("Nome de hÃ¡bito invÃ¡lido.");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("habits")
      .insert({ user_id: user.id, name: habitName.trim() })
      .select("id, name")
      .single();
    if (error) {
      setMessage(error.message);
      return;
    }
    setHabits((prev) => [data as Habit, ...prev]);
    setHabitName("");
  }

  async function toggleHabitCheckin(habitId: string) {
    const today = todayKey();
    const already = habitCheckins.some((row) => row.habit_id === habitId && row.checkin_date === today);

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
      setHabitCheckins((prev) => prev.filter((row) => !(row.habit_id === habitId && row.checkin_date === today)));
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("habit_checkins")
      .insert({ user_id: user.id, habit_id: habitId, checkin_date: today });
    if (error) {
      setMessage(error.message);
      return;
    }
    setHabitCheckins((prev) => [...prev, { habit_id: habitId, checkin_date: today }]);
  }

  async function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (goalTitle.trim().length < 3) {
      setMessage("TÃ­tulo da meta invÃ¡lido.");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const tasksFromText = goalTasksText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (editingGoalId) {
      const { error } = await supabase
        .from("goals")
        .update({ title: goalTitle.trim() })
        .eq("id", editingGoalId);
      if (error) {
        setMessage(error.message);
        return;
      }
      setGoals((prev) => prev.map((goal) => (goal.id === editingGoalId ? { ...goal, title: goalTitle.trim() } : goal)));
      setEditingGoalId(null);
      setMessage("Meta atualizada.");
    } else {
      const { data, error } = await supabase
        .from("goals")
        .insert({ user_id: user.id, title: goalTitle.trim() })
        .select("id, title")
        .single();
      if (error) {
        setMessage(error.message);
        return;
      }
      const created = data as Goal;
      setGoals((prev) => [created, ...prev]);

      if (tasksFromText.length > 0) {
        const { error: stepsError } = await supabase.from("goal_steps").insert(
          tasksFromText.map((title, index) => ({
            user_id: user.id,
            goal_id: created.id,
            title,
            sort_order: index,
          })),
        );
        if (!stepsError) {
          await loadModuleData();
        }
      }

      setMessage("Meta criada.");
    }

    setGoalTitle("");
    setGoalTasksText("");
  }

  async function removeGoal(goalId: string) {
    const { error } = await supabase.from("goals").delete().eq("id", goalId);
    if (error) {
      setMessage(error.message);
      return;
    }
    setGoals((prev) => prev.filter((item) => item.id !== goalId));
    setGoalSteps((prev) => prev.filter((step) => step.goal_id !== goalId));
    setMessage("Meta removida.");
  }

  async function addStep(goalId: string, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const currentGoalSteps = goalSteps.filter((item) => item.goal_id === goalId);
    const nextOrder = currentGoalSteps.length;
    const { data, error } = await supabase
      .from("goal_steps")
      .insert({
        user_id: user.id,
        goal_id: goalId,
        title: trimmed,
        sort_order: nextOrder,
      })
      .select("id, goal_id, title, completed, sort_order")
      .single();
    if (error) {
      setMessage(error.message);
      return;
    }
    setGoalSteps((prev) => [...prev, data as GoalStep]);
  }

  async function toggleStep(step: GoalStep) {
    const { error } = await supabase
      .from("goal_steps")
      .update({ completed: !step.completed })
      .eq("id", step.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setGoalSteps((prev) =>
      prev.map((item) => (item.id === step.id ? { ...item, completed: !item.completed } : item)),
    );
  }

  async function addDailyTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (dailyTitle.trim().length < 3) {
      setMessage("TÃ­tulo invÃ¡lido.");
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const today = todayKey();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: dailyTitle.trim().toUpperCase(),
        due_at: `${today}T12:00:00.000Z`,
        priority: "medium",
      })
      .select("id, title, completed, due_at, created_at, completed_at")
      .single();
    if (error) {
      setMessage(error.message);
      return;
    }
    setTasks((prev) => [data as Task, ...prev]);
    setDailyTitle("");
    setMessage("Tarefa do dia criada.");
  }

  async function toggleDailyTask(task: Task) {
    const updatePayload = task.completed
      ? { completed: false, completed_at: null }
      : { completed: true, completed_at: new Date().toISOString() };
    const { error } = await supabase.from("tasks").update(updatePayload).eq("id", task.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setTasks((prev) =>
      prev.map((item) => (item.id === task.id ? { ...item, ...updatePayload } : item)),
    );
  }

  function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (courseName.trim().length < 2) {
      setMessage("Nome do curso invÃ¡lido.");
      return;
    }
    const parsedProgress = Math.max(0, Math.min(100, Number(courseProgress) || 0));
    setCourses((prev) => [
      { id: uid(), name: courseName.trim(), progress: parsedProgress },
      ...prev,
    ]);
    setCourseName("");
    setCourseProgress("0");
  }

  function updateCourseProgress(id: string, progress: number) {
    setCourses((prev) =>
      prev.map((course) => (course.id === id ? { ...course, progress: Math.max(0, Math.min(100, progress)) } : course)),
    );
  }

  function removeCourse(id: string) {
    setCourses((prev) => prev.filter((course) => course.id !== id));
  }

  function addBook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (bookName.trim().length < 2) {
      setMessage("Nome do livro invÃ¡lido.");
      return;
    }
    setBooks((prev) => [{ id: uid(), name: bookName.trim(), status: bookStatus }, ...prev]);
    setBookName("");
    setBookStatus("lendo");
  }

  function updateBookStatus(id: string, status: Book["status"]) {
    setBooks((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  function removeBook(id: string) {
    setBooks((prev) => prev.filter((item) => item.id !== id));
  }

  function saveIkigai(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem(STORAGE_IKIGAI, JSON.stringify(ikigai));
    setMessage("Ikigai salvo.");
  }

  const today = todayKey();
  const plannedTodayTasks = tasks.filter(
    (task) => task.due_at?.slice(0, 10) === today || task.created_at.slice(0, 10) === today,
  );
  const completedToday = plannedTodayTasks.filter((task) => task.completed).length;
  const plannedToday = plannedTodayTasks.length;

  const equilibrioStatus = (() => {
    if (plannedToday <= 3) return "leve";
    const completionRate = plannedToday === 0 ? 0 : completedToday / plannedToday;
    if (plannedToday >= 8 && completionRate < 0.5) return "sobrecarregado";
    return "equilibrado";
  })();

  const productivityPoints = Array.from({ length: 14 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    const key = dayKey(date);
    const value = tasks.filter((task) => task.completed_at?.slice(0, 10) === key).length;
    return { key, value };
  });

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 text-sm text-[var(--app-text-muted)]">
        Carregando dados do mÃ³dulo...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {slug === "equilibrio" ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--app-text-muted)]">Tarefas planejadas hoje: {plannedToday}</p>
          <p className="text-sm text-[var(--app-text-muted)]">Tarefas concluÃ­das hoje: {completedToday}</p>
          <p className="text-sm">
            ClassificaÃ§Ã£o atual: <strong>{equilibrioStatus}</strong>
          </p>
        </div>
      ) : null}

            {slug === "quadro-dos-sonhos" ? (
        <div className="space-y-4">
          <form onSubmit={addDream} className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(event) => setDreamFile(event.target.files?.[0] ?? null)}
            />
            <Button type="submit" variant="primary">
              Adicionar foto
            </Button>
          </form>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {dreams.map((dream) => (
              <div key={dream.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3">
                <img src={dream.content} alt="Foto do quadro dos sonhos" className="h-56 w-full rounded-lg object-cover" />
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="danger" onClick={() => void removeDream(dream.id)}>
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {slug === "habitos-atomicos" ? (
        <div className="space-y-4">
          <form onSubmit={addHabit} className="flex gap-2">
            <Input value={habitName} onChange={(event) => setHabitName(event.target.value)} placeholder="Novo hÃ¡bito" />
            <Button type="submit" variant="primary">Adicionar</Button>
          </form>
          <div className="space-y-2">
            {habits.map((habit) => {
              const doneToday = habitCheckins.some(
                (row) => row.habit_id === habit.id && row.checkin_date === today,
              );
              return (
                <label key={habit.id} className="flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3 text-sm">
                  <Checkbox checked={doneToday} onChange={() => void toggleHabitCheckin(habit.id)} />
                  <span>{habit.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      {slug === "grafico-de-produtividade" ? (
        <div className="space-y-2">
          {productivityPoints.map((point) => (
            <div key={point.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--app-text-muted)]">
                <span>{point.key}</span>
                <span>{point.value} concluÃ­das</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--app-surface-soft)]">
                <div
                  className="h-2 rounded-full bg-[var(--app-primary)]"
                  style={{ width: `${Math.min(100, point.value * 20)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {slug === "plano-de-acao" ? (
        <div className="space-y-4">
          <form onSubmit={saveGoal} className="space-y-2">
            <Input
              placeholder="TÃ­tulo da meta"
              value={goalTitle}
              onChange={(event) => setGoalTitle(event.target.value)}
            />
            {!editingGoalId ? (
              <Textarea
                rows={4}
                placeholder="Tarefas da meta (uma por linha)"
                value={goalTasksText}
                onChange={(event) => setGoalTasksText(event.target.value)}
              />
            ) : null}
            <Button type="submit" variant="primary">
              {editingGoalId ? "Salvar meta" : "Criar meta"}
            </Button>
          </form>

          <div className="space-y-3">
            {goals.map((goal) => {
              const steps = goalSteps.filter((step) => step.goal_id === goal.id);
              return (
                <div key={goal.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3">
                  <p className="font-semibold">{goal.title}</p>
                  <div className="mt-2 space-y-2">
                    {steps.map((step) => (
                      <label key={step.id} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={step.completed} onChange={() => void toggleStep(step)} />
                        <span className={step.completed ? "line-through opacity-70" : ""}>{step.title}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="Nova tarefa da meta"
                      value={goalStepDrafts[goal.id] ?? ""}
                      onChange={(event) =>
                        setGoalStepDrafts((prev) => ({ ...prev, [goal.id]: event.target.value }))
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        void addStep(goal.id, goalStepDrafts[goal.id] ?? "");
                        setGoalStepDrafts((prev) => ({ ...prev, [goal.id]: "" }));
                      }}
                    >
                      Adicionar
                    </Button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingGoalId(goal.id);
                        setGoalTitle(goal.title);
                        setGoalTasksText("");
                      }}
                    >
                      Editar
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => void removeGoal(goal.id)}>
                      Remover
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {slug === "listas-de-cursos" ? (
        <div className="space-y-4">
          <form onSubmit={addCourse} className="grid gap-2 md:grid-cols-3">
            <Input value={courseName} onChange={(event) => setCourseName(event.target.value)} placeholder="Nome do curso" />
            <Input
              type="number"
              min={0}
              max={100}
              value={courseProgress}
              onChange={(event) => setCourseProgress(event.target.value)}
              placeholder="Progresso %"
            />
            <Button type="submit" variant="primary">Adicionar</Button>
          </form>
          <div className="space-y-2">
            {courses.map((course) => (
              <div key={course.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3">
                <p className="font-semibold">{course.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={String(course.progress)}
                    onChange={(event) => updateCourseProgress(course.id, Number(event.target.value))}
                  />
                  <Button size="sm" variant="danger" onClick={() => removeCourse(course.id)}>Remover</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {slug === "lista-de-leitura" ? (
        <div className="space-y-4">
          <form onSubmit={addBook} className="grid gap-2 md:grid-cols-3">
            <Input value={bookName} onChange={(event) => setBookName(event.target.value)} placeholder="Nome do livro" />
            <Select value={bookStatus} onChange={(event) => setBookStatus(event.target.value as Book["status"])}>
              <option value="lendo">Lendo</option>
              <option value="concluido">ConcluÃ­do</option>
            </Select>
            <Button type="submit" variant="primary">Adicionar</Button>
          </form>
          <div className="space-y-2">
            {books.map((book) => (
              <div key={book.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3">
                <p className="font-semibold">{book.name}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Select
                    value={book.status}
                    onChange={(event) => updateBookStatus(book.id, event.target.value as Book["status"])}
                  >
                    <option value="lendo">Lendo</option>
                    <option value="concluido">ConcluÃ­do</option>
                  </Select>
                  <Button size="sm" variant="danger" onClick={() => removeBook(book.id)}>Remover</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {slug === "planejamento-diario" ? (
        <div className="space-y-4">
          <form onSubmit={addDailyTask} className="flex gap-2">
            <Input
              value={dailyTitle}
              onChange={(event) => setDailyTitle(event.target.value)}
              placeholder="Nova tarefa do dia"
            />
            <Button type="submit" variant="primary">Adicionar</Button>
          </form>
          <div className="space-y-2">
            {tasks
              .filter((task) => task.due_at?.slice(0, 10) === today)
              .map((task) => (
                <label key={task.id} className="flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3 text-sm">
                  <Checkbox checked={task.completed} onChange={() => void toggleDailyTask(task)} />
                  <span className={task.completed ? "line-through opacity-70" : ""}>{task.title}</span>
                </label>
              ))}
          </div>
          <p className="text-xs text-[var(--app-text-muted)]">
            A lista Ã© reiniciada automaticamente por data: apenas tarefas com data de hoje aparecem.
          </p>
        </div>
      ) : null}

      {slug === "ikigai" ? (
        <form onSubmit={saveIkigai} className="space-y-3">
          <Input
            placeholder="O que vocÃª ama"
            value={ikigai.love}
            onChange={(event) => setIkigai((prev) => ({ ...prev, love: event.target.value }))}
          />
          <Input
            placeholder="No que vocÃª Ã© bom"
            value={ikigai.goodAt}
            onChange={(event) => setIkigai((prev) => ({ ...prev, goodAt: event.target.value }))}
          />
          <Input
            placeholder="O que o mundo precisa"
            value={ikigai.needs}
            onChange={(event) => setIkigai((prev) => ({ ...prev, needs: event.target.value }))}
          />
          <Input
            placeholder="Pelo que pode ser pago"
            value={ikigai.paidFor}
            onChange={(event) => setIkigai((prev) => ({ ...prev, paidFor: event.target.value }))}
          />
          <Button type="submit" variant="primary">Salvar Ikigai</Button>
        </form>
      ) : null}

      {![
        "equilibrio",
        "quadro-dos-sonhos",
        "habitos-atomicos",
        "grafico-de-produtividade",
        "plano-de-acao",
        "listas-de-cursos",
        "lista-de-leitura",
        "planejamento-diario",
        "ikigai",
      ].includes(slug) ? (
        <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 text-sm text-[var(--app-text)]">
          MÃ³dulo sem implementaÃ§Ã£o especÃ­fica.
        </div>
      ) : null}

      {message ? <p className="text-sm text-[var(--app-primary-strong)]">{message}</p> : null}
    </div>
  );
}

