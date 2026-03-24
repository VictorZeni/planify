"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

type ModuleCardProps = {
  title: string;
  description: string;
  route: string;
  delayMs?: number;
};

export function ModuleCard({ title, description, route, delayMs = 0 }: ModuleCardProps) {
  return (
    <Link
      href={route}
      className="group block h-full cursor-pointer rounded-xl border border-[var(--app-border)] bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--app-primary)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-bg)] animate-[moduleCardFadeIn_0.45s_ease-out_forwards] opacity-0"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex h-full flex-col">
        <h2 className="text-lg font-semibold text-[var(--app-text)]">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--app-text-muted)]">{description}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--app-primary)] transition-colors group-hover:text-[var(--app-primary-strong)]">
          Acessar módulo
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

