import { CountdownBadge } from "./countdown-badge";
import type { Priority } from "@/lib/priority";
import { priorityLabel } from "@/lib/priority";
import { motion } from "framer-motion";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TaskCardProps = {
  title: string;
  completed: boolean;
  dueAt: string | null;
  categoryName: string | null;
  priority: Priority;
  editing: boolean;
  editTitle: string;
  onEditTitleChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  onToggleMission: () => void;
  isMission: boolean;
  focusHref: string;
};

function getPriorityBadgeClass(level: Priority) {
  if (level === "high") return "border-red-200 bg-red-50 text-red-700";
  if (level === "medium") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-green-200 bg-green-50 text-green-700";
}

export function TaskCard({
  title,
  completed,
  dueAt,
  categoryName,
  priority,
  editing,
  editTitle,
  onEditTitleChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleComplete,
  onDelete,
  onToggleMission,
  isMission,
  focusHref,
}: TaskCardProps) {
  return (
    <motion.li
      whileHover={{ y: -2 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col gap-3 rounded-xl border border-[var(--app-border)] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"
    >
      <div className="space-y-1">
        {editing ? (
          <div className="flex gap-2">
            <Input
              type="text"
              value={editTitle}
              onChange={(event) => onEditTitleChange(event.target.value)}
              className="py-1.5"
            />
            <Button type="button" onClick={onSaveEdit} size="sm" variant="primary">
              Salvar
            </Button>
            <Button type="button" onClick={onCancelEdit} size="sm" variant="secondary">
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Checkbox checked={completed} onChange={onToggleComplete} aria-label="Concluir tarefa" />
            <Link
              href={focusHref}
              className={`text-sm font-medium transition ${
                completed ? "text-[var(--app-text-muted)] line-through" : "text-[var(--app-text)] hover:text-[var(--app-primary)]"
              }`}
            >
              {title}
            </Link>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${getPriorityBadgeClass(priority)}`}
            >
              {priorityLabel(priority)}
            </span>
            <CountdownBadge deadline={dueAt} priority={priority} />
          </div>
        )}

        <p className="text-xs text-[var(--app-text-muted)]">
          {dueAt ? `Prazo: ${new Date(dueAt).toLocaleDateString("pt-BR")}` : "Sem prazo"}
          {categoryName ? ` - ${categoryName}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onToggleMission} variant={isMission ? "primary" : "secondary"} size="sm">
          {isMission ? "Na missão" : "Missão"}
        </Button>
        <Button type="button" onClick={onStartEdit} variant="secondary" size="sm">
          Editar
        </Button>
        <Button type="button" onClick={onToggleComplete} variant="secondary" size="sm">
          {completed ? "Reabrir" : "Concluir"}
        </Button>
        <Button type="button" onClick={onDelete} variant="danger" size="sm">
          Excluir
        </Button>
      </div>
    </motion.li>
  );
}

