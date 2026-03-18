import Link from "next/link";

type RecoveryBannerProps = {
  taskId: string | null;
  taskTitle: string | null;
};

export function RecoveryBanner({ taskId, taskTitle }: RecoveryBannerProps) {
  return (
    <section className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100">
      <p className="text-sm font-semibold">
        Você estava indo bem. Recomeçar também é disciplina.
      </p>
      <p className="mt-1 text-sm text-amber-50">
        {taskTitle
          ? `Comece pela tarefa: ${taskTitle}`
          : "Escolha uma tarefa simples e volte para o ritmo."}
      </p>
      <Link
        href={taskId ? `/focus-mode?taskId=${taskId}` : "/dashboard"}
        className="mt-3 inline-block rounded-lg border border-amber-300/60 bg-amber-200/15 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:bg-amber-200/25"
      >
        Voltar hoje
      </Link>
    </section>
  );
}
