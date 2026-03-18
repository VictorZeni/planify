import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { requireUserContext } from "@/lib/server/require-user";
import { HabitsClient } from "./habits-client";

export default async function HabitsPage() {
  const { supabase, userCard, user } = await requireUserContext();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [{ data: habits }, { data: checkins }] = await Promise.all([
    supabase
      .from("habits")
      .select("id, name, target_frequency")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("habit_checkins")
      .select("habit_id, checkin_date")
      .eq("user_id", user.id)
      .gte("checkin_date", thirtyDaysAgo.toISOString().slice(0, 10)),
  ]);

  return (
    <AppShell user={userCard}>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          eyebrow="Hábitos"
          title="Consistência diária"
          description="Construa disciplina marcando seus hábitos todos os dias."
        />
        <HabitsClient initialHabits={habits ?? []} initialCheckins={checkins ?? []} />
      </div>
    </AppShell>
  );
}
