"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { TaskCard } from "@/components/dashboard/task-card";
import { normalizePriority, type Priority } from "@/lib/priority";
import { DailyMission } from "@/components/dashboard/daily-mission";
import { AlertState, LoadingState } from "@/components/ui/feedback-state";
import { addDaysToDateInput, dateInputToEndOfDayIso, toDateInputValue } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";

type Category = {
  id: string;
  name: string;
  color: string;
};

type Task = {
  id: string;
  title: string;
  due_at: string | null;
  completed: boolean;
  category_id: string | null;
  priority: Priority;
  created_at: string;
};

type TaskFormState = {
  title: string;
  deadline: string;
  priority: Priority;
  category: string;
};

const defaultCategoryColors: Record<string, string> = {
  pessoal: "#22c55e",
  estudo: "#16a34a",
  trabalho: "#65a30d",
};

const initialFormState: TaskFormState = {
  title: "",
  deadline: "",
  priority: "medium",
  category: "",
};

function smartFeedback(xpGain: number, streak: number) {
  if (streak >= 7) return `+${xpGain} XP. Você está evoluindo com constância.`;
  if (streak >= 3) return `Boa. Você manteve consistência hoje. +${xpGain} XP`;
  return `Mais um passo concluído. +${xpGain} XP`;
}

export function TasksPanel() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<TaskFormState>(initialFormState);
  const [missionTaskIds, setMissionTaskIds] = useState<string[]>([]);
  const [xpPulse, setXpPulse] = useState<number | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "done">("all");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const ensureDefaultCategories = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, color")
        .order("name", { ascending: true });

      if (error) throw error;

      if (data.length > 0) {
        setCategories(data);
        return;
      }

      const seeds = ["pessoal", "estudo", "trabalho"].map((name) => ({
        user_id: userId,
        name,
        color: defaultCategoryColors[name],
      }));

      const { error: insertError } = await supabase.from("categories").insert(seeds);
      if (insertError) throw insertError;

      const { data: seededData, error: seededError } = await supabase
        .from("categories")
        .select("id, name, color")
        .order("name", { ascending: true });

      if (seededError) throw seededError;
      setCategories(seededData);
    },
    [supabase],
  );

  const loadMissions = useCallback(async () => {
    const response = await fetch("/api/v1/missions/today");
    const payload = await response.json();
    if (response.ok) {
      setMissionTaskIds(payload.data ?? []);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        window.location.href = "/auth";
        return;
      }

      await ensureDefaultCategories(user.id);

      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, due_at, completed, category_id, priority, created_at")
        .order("created_at", { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(
        (tasksData ?? []).map((task) => ({
          ...task,
          priority: normalizePriority(task.priority),
        })),
      );
      await loadMissions();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Erro ao carregar dados.";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  }, [ensureDefaultCategories, supabase, loadMissions]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const updateFormField = useCallback(
    <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => {
      setForm((prev) => {
        if (key === "title" && typeof value === "string") {
          return { ...prev, [key]: value.toUpperCase() as TaskFormState[K] };
        }
        return { ...prev, [key]: value };
      });
    },
    [],
  );

  function validateForm(state: TaskFormState) {
    if (state.title.trim().length < 3) {
      return "Título deve ter ao menos 3 caracteres.";
    }

    if (state.deadline) {
      const parsed = new Date(`${state.deadline}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        return "Prazo invalido.";
      }
    }

    return null;
  }

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateForm(form);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        window.location.href = "/auth";
        return;
      }

      const dueAtIso = dateInputToEndOfDayIso(form.deadline);

      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: form.title.trim().toUpperCase(),
        due_at: dueAtIso,
        category_id: form.category || null,
        priority: form.priority,
      });

      if (error) throw error;

      setForm(initialFormState);
      setMessage("Excelente! Sua tarefa foi registrada. Vamos manter o ritmo.");
      await loadData();
    } catch (error) {
      const text = error instanceof Error ? error.message : "Erro ao criar tarefa.";
      setMessage(text);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleTask(task: Task) {
    setMessage("");

    if (!task.completed) {
      const response = await fetch(`/api/v1/tasks/${task.id}/complete`, {
        method: "POST",
      });

      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Erro ao concluir tarefa.");
        return;
      }

      setXpPulse(payload.data.xpGain);
      setMessage(smartFeedback(payload.data.xpGain, payload.data.currentStreak ?? 0));
      await loadData();
      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({ completed: false, completed_at: null })
      .eq("id", task.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadData();
  }

  async function handleDeleteTask(taskId: string) {
    setMessage("");

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Tarefa removida.");
    await loadData();
  }

  async function handleSaveEdit(taskId: string) {
    const normalizedTitle = editTitle.trim().toUpperCase();
    if (!normalizedTitle) return;

    const { error } = await supabase.from("tasks").update({ title: normalizedTitle }).eq("id", taskId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setEditingTaskId(null);
    setEditTitle("");
    setMessage("Perfeito. Tarefa atualizada com sucesso.");
    await loadData();
  }

  async function handleToggleMission(taskId: string) {
    const already = missionTaskIds.includes(taskId);

    const response = await fetch("/api/v1/missions/today", {
      method: already ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error ?? "Nao foi possivel atualizar missao.");
      return;
    }

    await loadMissions();
  }

  function startEditTask(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title.toUpperCase());
  }

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (statusFilter === "open" && task.completed) return false;
        if (statusFilter === "done" && !task.completed) return false;
        if (categoryFilter && task.category_id !== categoryFilter) return false;
        return true;
      }),
    [tasks, statusFilter, categoryFilter],
  );

  return (
    <section className="space-y-6 rounded-xl border border-[var(--app-border)] bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-[var(--app-text)]">Suas tarefas</h2>
        <p className="mt-1 text-sm text-[var(--app-text-muted)]">
          Foque no progresso diário. Cada tarefa concluída fortalece sua consistência.
        </p>
      </div>

      <DailyMission
        tasks={tasks.map((task) => ({ id: task.id, title: task.title, completed: task.completed }))}
        missionTaskIds={missionTaskIds}
      />

      <form onSubmit={handleCreateTask} className="grid gap-3 md:grid-cols-5">
        <Input
          type="text"
          placeholder="Ex.: Estudar React por 30 min"
          value={form.title}
          onChange={(event) => updateFormField("title", event.target.value)}
          required
          className="md:col-span-2"
        />
        <Input
          type="date"
          value={form.deadline}
          onChange={(event) => updateFormField("deadline", event.target.value)}
        />
        <div className="flex flex-wrap gap-2 md:col-span-2">
          {[
            { label: "Hoje", value: toDateInputValue(new Date()) },
            { label: "Amanhã", value: addDaysToDateInput(1) },
            { label: "+3 dias", value: addDaysToDateInput(3) },
            { label: "+7 dias", value: addDaysToDateInput(7) },
          ].map((preset) => (
            <Button
              key={preset.label}
              type="button"
              onClick={() => updateFormField("deadline", preset.value)}
              variant="secondary"
              size="sm"
            >
              {preset.label}
            </Button>
          ))}
          <Button
            type="button"
            onClick={() => updateFormField("deadline", "")}
            variant="secondary"
            size="sm"
          >
            Sem prazo
          </Button>
        </div>
        <Select value={form.category} onChange={(event) => updateFormField("category", event.target.value)}>
          <option value="">Sem categoria</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select value={form.priority} onChange={(event) => updateFormField("priority", event.target.value as Priority)}>
          <option value="low">Prioridade: Baixa</option>
          <option value="medium">Prioridade: Média</option>
          <option value="high">Prioridade: Alta</option>
        </Select>
        <Button type="submit" disabled={saving} variant="primary" className="md:col-span-5">
          {saving ? "Salvando..." : "Criar tarefa"}
        </Button>
      </form>

      <div className="grid gap-3 md:grid-cols-3">
        <Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "all" | "open" | "done")}
        >
          <option value="all">Todos os status</option>
          <option value="open">Pendentes</option>
          <option value="done">Concluídas</option>
        </Select>

        <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="">Todas categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <Button
          type="button"
          onClick={() => {
            setStatusFilter("all");
            setCategoryFilter("");
          }}
          variant="secondary"
        >
          Limpar filtros
        </Button>
      </div>

      <AnimatePresence>
        {xpPulse ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            onAnimationComplete={() => {
              window.setTimeout(() => setXpPulse(null), 1200);
            }}
            className="rounded-lg border border-green-200 bg-[var(--app-primary-soft)] p-3 text-sm font-semibold text-[var(--app-primary-strong)]"
          >
            +{xpPulse} XP conquistado
          </motion.div>
        ) : null}
      </AnimatePresence>

      {message ? <AlertState text={message} /> : null}

      {loading ? (
        <LoadingState text="Carregando tarefas..." />
      ) : filteredTasks.length === 0 ? (
        <LoadingState text="Nenhuma tarefa encontrada para os filtros selecionados." />
      ) : (
        <ul className="space-y-3">
          {filteredTasks.map((task) => {
            const category = task.category_id ? categoryMap.get(task.category_id) : null;

            return (
              <TaskCard
                key={task.id}
                title={task.title}
                completed={task.completed}
                dueAt={task.due_at}
                categoryName={category?.name ?? null}
                priority={task.priority}
                editing={editingTaskId === task.id}
                editTitle={editTitle}
                onEditTitleChange={(value) => setEditTitle(value.toUpperCase())}
                onStartEdit={() => startEditTask(task)}
                onCancelEdit={() => {
                  setEditingTaskId(null);
                  setEditTitle("");
                }}
                onSaveEdit={() => void handleSaveEdit(task.id)}
                onToggleComplete={() => void handleToggleTask(task)}
                onDelete={() => void handleDeleteTask(task.id)}
                isMission={missionTaskIds.includes(task.id)}
                onToggleMission={() => void handleToggleMission(task.id)}
                focusHref={`/focus-mode?taskId=${task.id}`}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}

