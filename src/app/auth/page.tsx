"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { DEFAULT_KIWIFY_CHECKOUT_URL } from "@/lib/billing-config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

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
    <main className="min-h-screen bg-[var(--app-bg)] px-6 py-10 text-[var(--app-text)]">
      <div className="mx-auto w-full max-w-md rounded-xl border border-[var(--app-border)] bg-white p-6 shadow-sm">
        <Image src="/planify-logo.svg" alt="Planify" width={220} height={60} className="h-auto w-40 object-contain" priority />
        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Organize. Execute. Evolua.</p>
        <h1 className="mt-3 text-2xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-[var(--app-text-muted)]">Use seu email e senha para acessar.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Processando..." : "Entrar"}
          </Button>
        </form>

        <a href={checkoutUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-[var(--app-primary)] underline underline-offset-4">
          Não tem conta? Cadastre-se aqui
        </a>
        <p className="mt-2 text-xs text-[var(--app-text-muted)]">
          Já pagou em uma página de vendas?{" "}
          <a href="/compra-confirmada" className="text-[var(--app-primary)] underline underline-offset-4">
            Veja como acessar
          </a>
          .
        </p>

        {message ? (
          <p className="mt-4 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3 text-sm text-[var(--app-text)]">{message}</p>
        ) : null}
      </div>
    </main>
  );
}

