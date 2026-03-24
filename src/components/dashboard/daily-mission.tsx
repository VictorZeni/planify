type DailyMissionProps = {
  tasks: Array<{ id: string; title: string; completed: boolean }>;
  missionTaskIds: string[];
};

export function DailyMission({ tasks, missionTaskIds }: DailyMissionProps) {
  const missionTasks = tasks.filter((task) => missionTaskIds.includes(task.id));
  const done = missionTasks.filter((task) => task.completed).length;

  return (
    <section className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Missão do Dia</p>
      <p className="mt-1 text-sm text-[var(--app-text-muted)]">Selecione 3 tarefas chave e execute com foco.</p>
      <p className="mt-2 text-lg font-semibold text-[var(--app-text)]">{done}/{Math.max(missionTasks.length, 3)} concluídas</p>
      <ul className="mt-3 space-y-2 text-sm text-[var(--app-text)]">
        {missionTasks.length === 0 ? (
          <li>Nenhuma tarefa definida para hoje.</li>
        ) : (
          missionTasks.map((task) => (
            <li key={task.id}>{task.completed ? "?" : "•"} {task.title}</li>
          ))
        )}
      </ul>
    </section>
  );
}

