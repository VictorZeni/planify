import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { requireUserContext } from "@/lib/server/require-user";
import { GoalsClient } from "./goals-client";

export default async function GoalsPage() {
  const { supabase, userCard, user } = await requireUserContext();

  const [{ data: goals }, { data: steps }] = await Promise.all([
    supabase
      .from("goals")
      .select("id, title, description, target_date, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("goal_steps")
      .select("goal_id, completed")
      .eq("user_id", user.id),
  ]);

  const progressMap = new Map<string, { total: number; completed: number }>();
  (steps ?? []).forEach((step) => {
    const current = progressMap.get(step.goal_id) ?? { total: 0, completed: 0 };
    current.total += 1;
    if (step.completed) current.completed += 1;
    progressMap.set(step.goal_id, current);
  });

  return (
    <AppShell user={userCard}>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          eyebrow="Metas"
          title="Curto, médio e longo prazo"
          description="Transforme objetivos em progresso mensurável."
        />
        <GoalsClient
          initialGoals={(goals ?? []) as Array<{
            id: string;
            title: string;
            description: string | null;
            target_date: string | null;
            status: "active" | "paused" | "completed";
          }>}
          initialProgress={(goals ?? []).map((goal) => {
            const p = progressMap.get(goal.id) ?? { total: 0, completed: 0 };
            return { goalId: goal.id, total: p.total, completed: p.completed };
          })}
        />
      </div>
    </AppShell>
  );
}
