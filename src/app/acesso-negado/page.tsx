import Link from "next/link";
import Image from "next/image";

export default function AcessoNegadoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-slate-100">
      <section className="w-full max-w-xl rounded-2xl border border-rose-500/30 bg-slate-900 p-8">
        <Image
          src="/planify-logo.svg"
          alt="Planify"
          width={220}
          height={60}
          className="h-auto w-40 object-contain"
          priority
        />
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-rose-300">Acesso restrito</p>
        <h1 className="mt-2 text-2xl font-bold">VocÃª nÃ£o tem permissÃ£o para entrar aqui</h1>
        <p className="mt-3 text-sm text-slate-300">
          Sua conta ainda nÃ£o estÃ¡ liberada para esta Ã¡rea. Entre em contato com o administrador.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
          >
            Voltar ao painel
          </Link>
          <Link
            href="/pagamento"
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Ver planos de acesso
          </Link>
        </div>
      </section>
    </main>
  );
}



