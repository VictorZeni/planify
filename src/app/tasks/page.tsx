import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { requireUserContext } from "@/lib/server/require-user";
import { TasksPanel } from "@/app/dashboard/tasks-panel";

export default async function TasksPage() {
  const { userCard } = await requireUserContext();

  return (
    <AppShell user={userCard}>
      <PageWrapper>
        <PageHeader
          eyebrow="Tarefas"
          title="Sistema avançado de tarefas"
          description="Organize por prioridade, prazo, categoria, hoje, semana e backlog."
        />
        <TasksPanel />
      </PageWrapper>
    </AppShell>
  );
}

