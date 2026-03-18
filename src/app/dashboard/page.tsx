import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { TasksPanel } from "./tasks-panel";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ProgressBars } from "@/components/dashboard/progress-bars";
import { HabitHeatmap } from "@/components/dashboard/habit-heatmap";
import { XpLevelCard } from "@/components/dashboard/xp-level-card";
import { AppShell } from "@/components/layout/app-shell";
import { normalizePriority } from "@/lib/priority";
import { StreakIndicator } from "@/components/dashboard/streak-indicator";
import { DisciplineScore } from "@/components/dashboard/discipline-score";
import { RecoveryBanner } from "@/components/dashboard/recovery-banner";

type TaskRow = {
  id: string;
  title: string;
  completed: boolean;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  priority: string;
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDay(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function countStreak(daysWithCompletion: Set<string>) {
  let streak = 0;
  const current = startOfDay(new Date());

  while (daysWithCompletion.has(formatDay(current))) {
    streak += 1;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const metaDisplayName =
    (user.user_metadata?.display_name as string | undefined) ??
    `${user.user_metadata?.first_name ?? ""} ${user.user_metadata?.last_name ?? ""}`.trim();
  const fallbackDisplayName = metaDisplayName || user.email?.split("@")[0] || "Usuario";

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: tasksData }, { data: profileData }, { data: statsData }, { data: missionRows }] =
    await Promise.all([
      supabase
        .from("tasks")
        .select("id, title, completed, due_at, completed_at, created_at, priority")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("display_name, avatar_url, is_admin, is_authorized")
        .eq("id", user.id)
        .maybeSingle(),
      supabase.from("user_stats").select("xp, level, current_streak").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("daily_missions")
        .select("task_id, tasks(id, title, completed)")
        .eq("user_id", user.id)
        .eq("mission_date", today),
    ]);

  const tasks: TaskRow[] = tasksData ?? [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  const previousWeekStart = new Date(now);
  previousWeekStart.setDate(now.getDate() - 14);

  const currentWeekDone = tasks.filter((task) => {
    if (!task.completed_at) return false;
    const date = new Date(task.completed_at);
    return date >= weekStart && date <= now;
  }).length;

  const previousWeekDone = tasks.filter((task) => {
    if (!task.completed_at) return false;
    const date = new Date(task.completed_at);
    return date >= previousWeekStart && date < weekStart;
  }).length;

  const productivityGain =
    previousWeekDone === 0
      ? currentWeekDone > 0
        ? 100
        : 0
      : Math.round(((currentWeekDone - previousWeekDone) / previousWeekDone) * 100);

  const daysWithCompletion = new Set(
    tasks
      .filter((task) => task.completed_at)
      .map((task) => formatDay(new Date(task.completed_at as string))),
  );
  const streak = statsData?.current_streak ?? countStreak(daysWithCompletion);

  const hasCompletedToday = tasks.some((task) => task.completed_at?.startsWith(today));

  const heatmapPoints = Array.from({ length: 98 }).map((_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (97 - index));
    const key = formatDay(day);
    const count = tasks.filter((task) => task.completed_at?.startsWith(key)).length;
    return { day: key, value: count };
  });

  const xp = statsData?.xp ?? completedTasks * 20 + streak * 10;
  const level = statsData?.level ?? Math.max(1, Math.floor(xp / 250) + 1);
  const progressToNextLevel = Math.round(((xp % 250) / 250) * 100);

  const insightText =
    productivityGain >= 0
      ? `Você foi ${productivityGain}% mais produtivo nesta semana.`
      : `Sua produtividade caiu ${Math.abs(productivityGain)}% nesta semana.`;

  const lastCompletion = tasks
    .filter((task) => task.completed_at)
    .map((task) => new Date(task.completed_at as string).getTime())
    .sort((a, b) => b - a)[0];

  const inactiveForDays = lastCompletion
    ? Math.floor((now.getTime() - lastCompletion) / (1000 * 60 * 60 * 24))
    : 999;

  const topImportantTasks = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => {
      const priorityScore = { high: 3, medium: 2, low: 1 };
      const pa = priorityScore[normalizePriority(a.priority)];
      const pb = priorityScore[normalizePriority(b.priority)];
      if (pa !== pb) return pb - pa;
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    })
    .slice(0, 3);

  const procrastinatedTask = tasks
    .filter((task) => !task.completed)
    .find((task) => {
      const days = Math.floor((now.getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 2;
    });

  const missionTasks: Array<{ id: string; title: string; completed: boolean }> = (missionRows ?? [])
    .flatMap((row) => {
      if (!row.tasks) return [];
      return Array.isArray(row.tasks) ? row.tasks : [row.tasks];
    })
    .map((task) => ({
      id: task.id,
      title: task.title,
      completed: task.completed,
    }));

  const missionDone = missionTasks.filter((task) => task.completed).length;

  return (
    <AppShell
      user={{
        displayName: profileData?.display_name ?? fallbackDisplayName,
        email: user.email ?? "",
        avatarUrl: profileData?.avatar_url ?? null,
        isAdmin: profileData?.is_admin ?? false,
        isAuthorized: profileData?.is_authorized ?? false,
      }}
    >
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div>
            <Image
              src="/planify-logo-transparent.png"
              alt="Planify"
              width={220}
              height={60}
              className="h-auto w-44 object-contain"
              priority
            />
            <p className="mt-3 text-sm font-semibold text-cyan-200">
              Olá, {profileData?.display_name ?? fallbackDisplayName}!
            </p>
            <h1 className="mt-2 text-2xl font-bold">Painel de execução e consistência</h1>
            <p className="mt-1 bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-sm font-semibold text-transparent">
              Organize. Execute. Evolua.
            </p>
            <p className="mt-1 text-sm text-slate-300">{user.email}</p>
          </div>
          <LogoutButton />
        </header>

        {(inactiveForDays === 1 || inactiveForDays === 2) ? (
          <RecoveryBanner
            taskId={topImportantTasks[0]?.id ?? null}
            taskTitle={topImportantTasks[0]?.title ?? null}
          />
        ) : null}

        {procrastinatedTask ? (
          <section className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-100">
            <p className="text-sm font-semibold">
              Você está adiando isso. Que tal começar com 10 minutos?
            </p>
            <Link
              href={`/focus-mode?taskId=${procrastinatedTask.id}`}
              className="mt-3 inline-block rounded-lg border border-rose-300/50 bg-rose-200/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-200/20"
            >
              Começar agora
            </Link>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard
            label="Conclusão"
            value={`${completionRate}%`}
            hint={`${completedTasks} de ${totalTasks} tarefas concluídas`}
          />
          <MetricCard label="Sequência" value={`${streak} dias`} hint="Sequência por tarefa concluída" />
          <MetricCard
            label="Semana"
            value={`${currentWeekDone}`}
            hint="Tarefas concluídas nos últimos 7 dias"
          />
          <MetricCard
            label="Insight"
            value={productivityGain >= 0 ? `+${productivityGain}%` : `${productivityGain}%`}
            hint={insightText}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <ProgressBars
              title="Análise semanal e mensal"
              points={[
                {
                  label: "Taxa de conclusão geral",
                  value: completionRate,
                },
                {
                  label: "Consistência semanal",
                  value: Math.min(streak * 14, 100),
                },
                {
                  label: "Execução das prioridades",
                  value: Math.min(Math.round((completedTasks / Math.max(totalTasks, 1)) * 100), 100),
                },
              ]}
            />
            <HabitHeatmap points={heatmapPoints} />
          </div>

          <div className="space-y-4">
            <XpLevelCard xp={xp} level={level} progressToNextLevel={progressToNextLevel} />
            <StreakIndicator currentStreak={streak} hasCompletedToday={hasCompletedToday} />
            <DisciplineScore
              completionRate={completionRate}
              weeklyCompletions={currentWeekDone}
              streak={streak}
            />
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Missão do Dia</p>
              <p className="mt-2 text-sm text-slate-200">
                {missionTasks.length > 0
                  ? `${missionDone}/${missionTasks.length} concluídas nas 3 tarefas principais.`
                  : "Selecione 3 tarefas principais para hoje."}
              </p>
            </section>
          </div>
        </section>

        <TasksPanel />
      </div>
    </AppShell>
  );
}


