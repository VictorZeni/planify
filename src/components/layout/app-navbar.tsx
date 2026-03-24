import Link from "next/link";
import { Search, Plus } from "lucide-react";

type AppNavbarProps = {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export function AppNavbar({ right }: AppNavbarProps) {
  return (
    <header className="border-b border-[var(--app-border)] bg-white px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-text-muted)]" />
          <input
            placeholder="Buscar..."
            className="h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] pl-9 pr-3 text-sm text-[var(--app-text)] outline-none transition-all placeholder:text-[var(--app-text-muted)] focus:border-[var(--app-primary)] focus:ring-2 focus:ring-[var(--app-primary-soft)]"
          />
        </div>

        <Link
          href="/tasks"
          className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--app-primary)] px-4 text-sm font-medium text-white transition-all hover:bg-[var(--app-primary-strong)]"
        >
          <Plus className="h-4 w-4" />
          Nova tarefa
        </Link>

        {right}
      </div>
    </header>
  );
}
