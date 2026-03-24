import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100 md:px-10">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
          <Image
            src="/planify-logo.png"
            alt="Planify"
            width={280}
            height={80}
            className="h-auto w-52 object-contain"
            priority
          />
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            Organize. Execute. Evolua.
          </h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            O Planify foi feito para transformar planejamento em execuÃ§Ã£o real,
            com foco, consistÃªncia e evoluÃ§Ã£o diÃ¡ria.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/auth"
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Entrar no Planify
            </a>
            <a
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
            >
              Abrir painel
            </a>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Comece em minutos</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>1. Criar projeto no Supabase</li>
              <li>2. Copiar variaveis para .env.local</li>
              <li>3. Executar o schema.sql no SQL Editor</li>
              <li>4. Rodar app local com npm run dev</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-semibold">Por que usar Planify</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>1. Banco com RLS protege dados por usuario</li>
              <li>2. Login pronto para evoluir para Apple/Google</li>
              <li>3. Base web acelera publicacao e validacao</li>
              <li>4. Estrutura preparada para virar app depois</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}

