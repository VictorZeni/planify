import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { requireUserContext } from "@/lib/server/require-user";
import { WeeklyClient } from "./weekly-client";

function currentWeekStart() {
  const today = new Date();
  const day = (today.getDay() + 6) % 7;
  today.setDate(today.getDate() - day);
  return today.toISOString().slice(0, 10);
}

export default async function WeeklyPage() {
  const { supabase, userCard, user } = await requireUserContext();

  const { data: plan } = await supabase
    .from("weekly_plans")
    .select("id, week_start, weekly_goal, top_tasks, weekly_review")
    .eq("user_id", user.id)
    .eq("week_start", currentWeekStart())
    .maybeSingle();

  return (
    <AppShell user={userCard}>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          eyebrow="Planejamento semanal"
          title="Semana com clareza"
          description="Meta, tarefas chave e revisão para crescimento contínuo."
        />
        <WeeklyClient
          initialPlan={
            (plan as {
              id: string;
              week_start: string;
              weekly_goal: string | null;
              top_tasks: string[] | null;
              weekly_review: string | null;
            } | null) ?? null
          }
        />
      </div>
    </AppShell>
  );
}
