type DailyMissionProps = {
  tasks: Array<{ id: string; title: string; completed: boolean }>;
  missionTaskIds: string[];
};

export function DailyMission({ tasks, missionTaskIds }: DailyMissionProps) {
  const missionTasks = tasks.filter((task) => missionTaskIds.includes(task.id));
  const done = missionTasks.filter((task) => task.completed).length;

  return (
    <section className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Missão do Dia</p>
      <p className="mt-1 text-sm text-slate-200">
        Selecione 3 tarefas chave e execute com foco.
      </p>
      <p className="mt-2 text-lg font-bold text-white">{done}/{Math.max(missionTasks.length, 3)} concluídas</p>
      <ul className="mt-3 space-y-2 text-sm text-slate-100">
        {missionTasks.length === 0 ? (
          <li>Nenhuma tarefa definida para hoje.</li>
        ) : (
          missionTasks.map((task) => (
            <li key={task.id}>
              {task.completed ? "✅" : "•"} {task.title}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
