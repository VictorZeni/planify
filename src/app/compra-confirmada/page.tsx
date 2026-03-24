import Image from "next/image";
import Link from "next/link";

export default function CompraConfirmadaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-slate-100">
      <section className="w-full max-w-2xl rounded-2xl border border-emerald-500/30 bg-slate-900 p-8">
        <Image
          src="/planify-logo.svg"
          alt="Planify"
          width={220}
          height={60}
          className="h-auto w-40 object-contain"
          priority
        />
        <p className="mt-5 text-xs uppercase tracking-[0.2em] text-emerald-300">Pagamento confirmado</p>
        <h1 className="mt-2 text-2xl font-bold">PrÃ³ximo passo para acessar o Planify</h1>
        <p className="mt-3 text-sm text-slate-300">
          Se vocÃª comprou por uma pÃ¡gina de vendas, seu acesso Ã© liberado automaticamente pelo webhook da
          Kiwify.
        </p>

        <div className="mt-6 space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
          <p>
            1. Entre em <strong>/auth</strong> com o mesmo email usado na compra.
          </p>
          <p>2. Se ainda nÃ£o tiver senha, verifique sua caixa de entrada e spam para o convite de acesso.</p>
          <p>3. Depois do primeiro login, vocÃª serÃ¡ redirecionado para o dashboard.</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/auth"
            className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            Entrar no Planify
          </Link>
          <Link
            href="/pagamento"
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          >
            Ainda nÃ£o paguei
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Importante: use o mesmo email da compra para a liberaÃ§Ã£o automÃ¡tica funcionar.
        </p>
      </section>
    </main>
  );
}



