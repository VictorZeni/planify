export type Priority = "low" | "medium" | "high";

export function normalizePriority(value: string | null | undefined): Priority {
  if (!value) return "medium";

  if (value === "high" || value === "alta") return "high";
  if (value === "low" || value === "baixa") return "low";
  return "medium";
}

export function priorityLabel(priority: Priority): string {
  if (priority === "high") return "Alta";
  if (priority === "low") return "Baixa";
  return "Media";
}
