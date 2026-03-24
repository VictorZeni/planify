import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { requireUserContext } from "@/lib/server/require-user";
import { CalendarClient } from "./calendar-client";

export default async function CalendarPage() {
  const { supabase, userCard, user } = await requireUserContext();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, due_at, completed")
    .eq("user_id", user.id)
    .order("due_at", { ascending: true });

  return (
    <AppShell user={userCard}>
      <PageWrapper>
        <PageHeader
          eyebrow="Calendário"
          title="Planejamento temporal"
          description="Visualize tarefas por mês, semana ou dia para reduzir atrito na execução."
        />

        <CalendarClient
          tasks={(tasks ?? []).map((task) => ({
            id: task.id,
            title: task.title,
            dueAt: task.due_at,
            completed: task.completed,
          }))}
        />
      </PageWrapper>
    </AppShell>
  );
}

