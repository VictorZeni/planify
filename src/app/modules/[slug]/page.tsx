import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getModuleBySlug } from "@/lib/modules";
import { requireUserContext } from "@/lib/server/require-user";

type ModulePlaceholderPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ModulePlaceholderPage({ params }: ModulePlaceholderPageProps) {
  const [{ userCard }, { slug }] = await Promise.all([requireUserContext(), params]);
  const moduleItem = getModuleBySlug(slug);

  if (!moduleItem) {
    notFound();
  }

  return (
    <AppShell user={userCard}>
      <div className="mx-auto w-full max-w-4xl">
        <section className="rounded-2xl border border-white/10 bg-[#111827] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Módulo</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-100">{moduleItem.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{moduleItem.description}</p>
          <div className="mt-6 rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Página em construção. Em breve você terá os recursos completos deste módulo.
          </div>
          <Link
            href="/modules"
            className="mt-6 inline-flex rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Voltar para Modules Dashboard
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
