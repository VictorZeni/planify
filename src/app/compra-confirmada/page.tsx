import Image from "next/image";
import Link from "next/link";

export default function CompraConfirmadaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-6 py-10 text-[var(--app-text)]">
      <section className="w-full max-w-2xl rounded-xl border border-green-200 bg-white p-8 shadow-sm">
        <Image src="/planify-logo.svg" alt="Planify" width={220} height={60} className="h-auto w-40 object-contain" priority />
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Pagamento confirmado</p>
        <h1 className="mt-2 text-2xl font-semibold">Próximo passo para acessar o Planify</h1>
        <p className="mt-3 text-sm text-[var(--app-text-muted)]">
          Se você comprou por uma página de vendas, seu acesso é liberado automaticamente pelo webhook da Kiwify.
        </p>

        <div className="mt-6 space-y-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4 text-sm text-[var(--app-text)]">
          <p>1. Entre em <strong>/auth</strong> com o mesmo email usado na compra.</p>
          <p>2. Se ainda não tiver senha, verifique sua caixa de entrada e spam para o convite de acesso.</p>
          <p>3. Depois do primeiro login, você será redirecionado para o dashboard.</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/auth" className="inline-flex h-10 items-center rounded-lg bg-[var(--app-primary)] px-4 text-sm font-medium text-white transition-all hover:bg-[var(--app-primary-strong)]">
            Entrar no Planify
          </Link>
          <Link href="/pagamento" className="inline-flex h-10 items-center rounded-lg border border-[var(--app-border)] bg-white px-4 text-sm font-medium text-[var(--app-text)] transition-all hover:bg-[var(--app-surface-soft)]">
            Ainda não paguei
          </Link>
        </div>

        <p className="mt-4 text-xs text-[var(--app-text-muted)]">Importante: use o mesmo email da compra para a liberação automática funcionar.</p>
      </section>
    </main>
  );
}

