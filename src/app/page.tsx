import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] px-6 py-10 text-[var(--app-text)] md:px-10">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="planify-surface p-6 md:p-8">
          <Image
            src="/planify-logo.svg"
            alt="Planify"
            width={280}
            height={80}
            className="h-auto w-52 object-contain"
            priority
          />
          <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">Organize. Execute. Evolua.</h1>
          <p className="mt-4 max-w-2xl text-[var(--app-text-muted)]">
            O Planify foi feito para transformar planejamento em execução real, com foco, consistência e evolução diária.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/auth"
              className="inline-flex h-10 items-center rounded-lg bg-[var(--app-primary)] px-4 text-sm font-medium text-white transition-all hover:bg-[var(--app-primary-strong)]"
            >
              Entrar no Planify
            </a>
            <a
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-lg border border-[var(--app-border)] bg-white px-4 text-sm font-medium text-[var(--app-text)] transition-all hover:bg-[var(--app-surface-soft)]"
            >
              Abrir painel
            </a>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="planify-surface p-6">
            <h2 className="text-lg font-semibold">Comece em minutos</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--app-text-muted)]">
              <li>1. Criar projeto no Supabase</li>
              <li>2. Copiar variáveis para .env.local</li>
              <li>3. Executar o schema.sql no SQL Editor</li>
              <li>4. Rodar app local com npm run dev</li>
            </ul>
          </article>
          <article className="planify-surface p-6">
            <h2 className="text-lg font-semibold">Por que usar Planify</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--app-text-muted)]">
              <li>1. Banco com RLS protege dados por usuário</li>
              <li>2. Login pronto para evoluir para Apple/Google</li>
              <li>3. Base web acelera publicação e validação</li>
              <li>4. Estrutura preparada para virar app depois</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
}

