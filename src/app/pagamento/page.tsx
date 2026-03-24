import Image from "next/image";
import Link from "next/link";
import { CheckoutButton } from "./checkout-button";

export default function PagamentoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-6 py-10 text-[var(--app-text)]">
      <section className="w-full max-w-2xl rounded-xl border border-[var(--app-border)] bg-white p-8 shadow-sm">
        <Image src="/planify-logo.svg" alt="Planify" width={220} height={60} className="h-auto w-40 object-contain" priority />
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Liberação de acesso</p>
        <h1 className="mt-2 text-2xl font-semibold">Plano para desbloquear o Planify</h1>
        <p className="mt-3 text-sm text-[var(--app-text-muted)]">
          Sua conta existe, mas ainda está bloqueada. Você pode pedir liberação manual ou finalizar o pagamento para ativar automaticamente.
        </p>

        <div className="mt-6 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
          <p className="text-sm text-[var(--app-text)]">Plano Pro</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--app-primary)]">R$ 29/mês</p>
          <p className="mt-1 text-xs text-[var(--app-text-muted)]">Pagamento seguro via Kiwify</p>
        </div>

        <div className="mt-6">
          <CheckoutButton />
        </div>

        <p className="mt-4 text-xs text-[var(--app-text-muted)]">
          Se preferir liberação manual, fale com o administrador e solicite ativação da sua conta.
        </p>
        <p className="mt-2 text-xs text-[var(--app-text-muted)]">
          Já pagou em uma página externa?{" "}
          <Link href="/compra-confirmada" className="text-[var(--app-primary)] underline underline-offset-4">
            Ver instruções de acesso
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

