import type { Priority } from "@/lib/priority";

type TaskForXp = {
  priority: Priority;
  dueAt: string | null;
};

export function calculateXP(task: TaskForXp, completedAt = new Date()): number {
  let xp = 25;
  if (task.priority === "low") xp = 10;
  if (task.priority === "high") xp = 50;

  if (task.dueAt) {
    const due = new Date(task.dueAt).getTime();
    const completed = completedAt.getTime();
    const diffHours = (due - completed) / (1000 * 60 * 60);
    if (diffHours > 0 && diffHours <= 48) {
      xp += 20;
    }
  }

  return xp;
}

export function levelFromXp(totalXp: number) {
  const safeXp = Math.max(0, totalXp);
  const levelSize = 250;
  const level = Math.floor(safeXp / levelSize) + 1;
  const xpInCurrentLevel = safeXp % levelSize;
  const progressPercent = Math.round((xpInCurrentLevel / levelSize) * 100);

  return { level, xpInCurrentLevel, progressPercent };
}
