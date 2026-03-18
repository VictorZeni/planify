import Image from "next/image";
import { CheckoutButton } from "./checkout-button";

export default function PagamentoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-slate-100">
      <section className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-8">
        <Image
          src="/planify-logo-transparent.png"
          alt="Planify"
          width={220}
          height={60}
          className="h-auto w-40 object-contain"
          priority
        />
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-cyan-300">Liberação de acesso</p>
        <h1 className="mt-2 text-2xl font-bold">Plano para desbloquear o Planify</h1>
        <p className="mt-3 text-sm text-slate-300">
          Sua conta existe, mas ainda está bloqueada. Você pode pedir liberação manual ou finalizar o
          pagamento para ativar automaticamente.
        </p>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-200">Plano Pro</p>
          <p className="mt-1 text-2xl font-bold text-emerald-300">R$ 29/mês</p>
          <p className="mt-1 text-xs text-slate-400">Pagamento seguro via Stripe</p>
        </div>

        <div className="mt-6">
          <CheckoutButton />
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Se preferir liberação manual, fale com o administrador e solicite ativação da sua conta.
        </p>
      </section>
    </main>
  );
}

