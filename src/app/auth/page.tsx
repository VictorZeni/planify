"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { DEFAULT_KIWIFY_CHECKOUT_URL } from "@/lib/billing-config";

function buildKiwifyCheckoutUrl(baseUrl: string, email: string) {
  try {
    const url = new URL(baseUrl);
    if (email.trim()) {
      url.searchParams.set("email", email.trim());
    }
    return url.toString();
  } catch {
    return baseUrl;
  }
}

export default function AuthPage() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const checkoutBaseUrl = process.env.NEXT_PUBLIC_CHECKOUT_URL ?? DEFAULT_KIWIFY_CHECKOUT_URL;
  const checkoutUrl = buildKiwifyCheckoutUrl(checkoutBaseUrl, email);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      setMessage("Login realizado. Redirecionando...");
      const next = searchParams.get("next");
      window.location.href = next && next.startsWith("/") ? next : "/dashboard";
    } catch (error) {
      const text = error instanceof Error ? error.message : "Erro inesperado.";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <Image
          src="/planify-logo-transparent.png"
          alt="Planify"
          width={220}
          height={60}
          className="h-auto w-40 object-contain"
          priority
        />
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-cyan-300">
          Organize. Execute. Evolua.
        </p>
        <h1 className="mt-3 text-2xl font-bold">Login</h1>
        <p className="mt-2 text-sm text-slate-300">Use seu email e senha para acessar.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-cyan-300 transition focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Senha
            </label>
            <input
              id="password"
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-cyan-300 transition focus:ring-2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Processando..." : "Entrar"}
          </button>
        </form>

        <a
          href={checkoutUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm text-cyan-300 underline underline-offset-4"
        >
          Nao tem conta? Cadastre-se aqui
        </a>

        {message ? (
          <p className="mt-4 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200">
            {message}
          </p>
        ) : null}
      </div>
    </main>
  );
}
