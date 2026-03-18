import { CountdownBadge } from "./countdown-badge";
import type { Priority } from "@/lib/priority";
import { priorityLabel } from "@/lib/priority";
import { motion } from "framer-motion";
import Link from "next/link";

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
  if (level === "high") return "border-rose-700 text-rose-200";
  if (level === "medium") return "border-amber-700 text-amber-200";
  return "border-emerald-700 text-emerald-200";
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
      className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg hover:shadow-cyan-500/10 md:flex-row md:items-center md:justify-between"
    >
      <div className="space-y-1">
        {editing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(event) => onEditTitleChange(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm outline-none ring-cyan-300 transition focus:ring-2"
            />
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onSaveEdit}
              className="rounded-lg border border-emerald-700 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:border-emerald-500"
            >
              Salvar
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onCancelEdit}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Cancelar
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href={focusHref}
              className={`text-sm font-medium transition hover:text-cyan-200 ${
                completed ? "text-slate-500 line-through" : "text-slate-100"
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

        <p className="text-xs text-slate-400">
          {dueAt ? `Prazo: ${new Date(dueAt).toLocaleDateString("pt-BR")}` : "Sem prazo"}
          {categoryName ? ` - ${categoryName}` : ""}
        </p>
      </div>

      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onToggleMission}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            isMission
              ? "border-cyan-500 text-cyan-200 hover:border-cyan-300"
              : "border-slate-700 text-slate-200 hover:border-slate-500"
          }`}
        >
          {isMission ? "Na Missão" : "Missão"}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onStartEdit}
          className="rounded-lg border border-sky-700 px-3 py-1.5 text-xs font-semibold text-sky-200 transition hover:border-sky-500"
        >
          Editar
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onToggleComplete}
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
        >
          {completed ? "Reabrir" : "Concluir"}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={onDelete}
          className="rounded-lg border border-rose-700 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:border-rose-500"
        >
          Excluir
        </motion.button>
      </div>
    </motion.li>
  );
}
