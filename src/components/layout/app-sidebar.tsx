"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckSquare,
  Goal,
  Grid2x2,
  LayoutDashboard,
  ListChecks,
  Menu,
  NotebookPen,
  Timer,
  UserCircle2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type SidebarUser = {
  displayName: string;
  email: string;
  avatarUrl: string | null;
  isAdmin?: boolean;
};

type AppSidebarProps = {
  user: SidebarUser;
};

const navItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare },
  { href: "/habits", label: "Hábitos", icon: ListChecks },
  { href: "/goals", label: "Metas", icon: Goal },
  { href: "/modules", label: "Módulos", icon: Grid2x2 },
  { href: "/weekly", label: "Semanal", icon: Timer },
  { href: "/notes", label: "Anotações", icon: NotebookPen },
  { href: "/professional", label: "Profissional", icon: BriefcaseBusiness },
  { href: "/activities", label: "Atividades", icon: ListChecks },
  { href: "/profile", label: "Perfil", icon: UserCircle2 },
];

const adminNavItem = { href: "/admin", label: "Admin", icon: ShieldCheck };

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-20 z-40 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2 text-[var(--app-text)] shadow-sm md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="fixed inset-y-0 left-0 top-[61px] z-30 hidden w-72 border-r border-[var(--app-border)] bg-[var(--app-surface)] p-4 md:block">
        <SidebarContent pathname={pathname} user={user} />
      </aside>

      <AnimatePresence>
        {open ? (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-y-0 left-0 top-[61px] z-50 w-72 border-r border-[var(--app-border)] bg-[var(--app-surface)] p-4 md:hidden"
          >
            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-[var(--app-border)] p-1 text-[var(--app-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent pathname={pathname} user={user} onNavigate={() => setOpen(false)} />
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({
  pathname,
  user,
  onNavigate,
}: {
  pathname: string;
  user: SidebarUser;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3">
        <Image
          src="/planify-logo.svg"
          alt="Planify"
          width={220}
          height={60}
          className="h-auto w-40 object-contain"
          priority
        />
        <p className="mt-1 text-sm text-[var(--app-text-muted)]">Organize. Execute. Evolua.</p>
      </div>

      <nav className="mt-6 space-y-2">
        {[...navItems, ...(user.isAdmin ? [adminNavItem] : [])].map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                active
                  ? "border border-[var(--app-primary)] bg-[var(--app-primary-soft)] text-[var(--app-primary-strong)]"
                  : "border border-transparent text-[var(--app-text-muted)] hover:border-[var(--app-border)] hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-text)]"
              }`}
            >
              <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3">
        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt="Avatar do usuário"
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-xs font-bold text-[var(--app-primary-strong)]">
              {user.displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--app-text)]">{user.displayName}</p>
            <p className="truncate text-xs text-[var(--app-text-muted)]">{user.email}</p>
          </div>
        </div>
        <Link
          href="/profile"
          onClick={onNavigate}
          className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-xs font-medium text-[var(--app-text)] transition-all hover:bg-[var(--app-surface-soft)]"
        >
          Editar perfil
        </Link>
      </div>
    </div>
  );
}



