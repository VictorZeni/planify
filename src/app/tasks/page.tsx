import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { requireUserContext } from "@/lib/server/require-user";
import { TasksPanel } from "@/app/dashboard/tasks-panel";

export default async function TasksPage() {
  const { userCard } = await requireUserContext();

  return (
    <AppShell user={userCard}>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          eyebrow="Tarefas"
          title="Sistema avançado de tarefas"
          description="Organize por prioridade, prazo, categoria, hoje, semana e backlog."
        />
        <TasksPanel />
      </div>
    </AppShell>
  );
}
