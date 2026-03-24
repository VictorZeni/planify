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
  NotebookPen,
  Timer,
  UserCircle2,
} from "lucide-react";

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
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare },
  { href: "/goals", label: "Metas", icon: Goal },
  { href: "/notes", label: "Notas", icon: NotebookPen },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/habits", label: "Hábitos", icon: ListChecks },
  { href: "/weekly", label: "Semanal", icon: Timer },
  { href: "/professional", label: "Profissional", icon: BriefcaseBusiness },
  { href: "/activities", label: "Atividades", icon: ListChecks },
  { href: "/modules", label: "Módulos", icon: Grid2x2 },
  { href: "/profile", label: "Perfil", icon: UserCircle2 },
];

const adminNavItem = { href: "/admin", label: "Admin", icon: ShieldCheck };

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 md:border-b-0">
      <div className="flex h-full flex-col">
        <div className="rounded-xl border border-[var(--app-border)] bg-white p-3">
          <Image src="/planify-logo.svg" alt="Planify" width={160} height={40} className="h-auto w-28 object-contain" priority />
        </div>

        <nav className="mt-5 grid grid-cols-2 gap-1.5 md:block md:space-y-1.5">
          {[...navItems, ...(user.isAdmin ? [adminNavItem] : [])].map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                  active
                    ? "border border-[var(--app-border)] bg-white text-[var(--app-text)]"
                    : "border border-transparent text-[var(--app-text-muted)] hover:border-[var(--app-border)] hover:bg-white hover:text-[var(--app-text)]"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-xl border border-[var(--app-border)] bg-white p-3 md:mt-auto">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="Avatar do usuário" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-[10px] font-semibold text-[var(--app-primary-strong)]">
                {user.displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[var(--app-text)]">{user.displayName}</p>
              <p className="truncate text-[11px] text-[var(--app-text-muted)]">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
