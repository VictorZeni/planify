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
      className="group block h-full cursor-pointer rounded-[14px] border border-white/10 bg-[#111827] p-5 shadow-[0_12px_30px_rgba(2,6,23,0.35)] transition-all duration-300 ease-out hover:scale-[1.03] hover:border-[#22C55E]/60 hover:shadow-[0_0_0_1px_rgba(34,197,94,0.35),0_0_28px_rgba(34,197,94,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] animate-[moduleCardFadeIn_0.45s_ease-out_forwards] opacity-0"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex h-full flex-col">
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition-colors group-hover:text-emerald-300">
          Acessar módulo
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
