import Link from "next/link";

type RecoveryBannerProps = {
  taskId: string | null;
  taskTitle: string | null;
};

export function RecoveryBanner({ taskId, taskTitle }: RecoveryBannerProps) {
  return (
    <section className="rounded-xl border border-amber-200 bg-[var(--app-warning-soft)] p-4 text-[var(--app-warning-text)]">
      <p className="text-sm font-semibold">Você estava indo bem. Recomeçar também é disciplina.</p>
      <p className="mt-1 text-sm">
        {taskTitle
          ? `Comece pela tarefa: ${taskTitle}`
          : "Escolha uma tarefa simples e volte para o ritmo."}
      </p>
      <Link
        href={taskId ? `/focus-mode?taskId=${taskId}` : "/dashboard"}
        className="mt-3 inline-block rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--app-warning-text)] transition hover:bg-amber-50"
      >
        Voltar hoje
      </Link>
    </section>
  );
}

