"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

type Mode = "login" | "signup";
type Gender = "masculino" | "feminino" | "outro" | "nao_informar";

export default function AuthPage() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("nao_informar");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        if (firstName.trim().length < 2 || lastName.trim().length < 2) {
          setMessage("Informe nome e sobrenome com pelo menos 2 letras.");
          return;
        }

        const fullName = `${firstName.trim()} ${lastName.trim()}`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              display_name: fullName,
              gender,
            },
          },
        });
        if (error) throw error;

        if (data.session) {
          setMessage("Conta criada com sucesso. Redirecionando...");
          window.location.href = "/pagamento";
        } else {
          setMessage(
            "Conta criada. Verifique seu email para confirmar o cadastro e depois faça login.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Login realizado. Redirecionando...");
        const next = searchParams.get("next");
        window.location.href = next && next.startsWith("/") ? next : "/dashboard";
      }
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
        <h1 className="mt-3 text-2xl font-bold">
          {mode === "login" ? "Entrar na conta" : "Criar conta"}
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          {mode === "login"
            ? "Use seu email e senha para acessar."
            : "Crie uma conta para salvar tarefas com seguranca."}
        </p>

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
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
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

          {mode === "signup" ? (
            <>
              <div>
                <label htmlFor="firstName" className="mb-1 block text-sm font-medium">
                  Nome
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  minLength={2}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-cyan-300 transition focus:ring-2"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="mb-1 block text-sm font-medium">
                  Sobrenome
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  minLength={2}
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-cyan-300 transition focus:ring-2"
                />
              </div>

              <div>
                <label htmlFor="gender" className="mb-1 block text-sm font-medium">
                  Genero
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(event) => setGender(event.target.value as Gender)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none ring-cyan-300 transition focus:ring-2"
                >
                  <option value="nao_informar">Prefiro não informar</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? "Processando..."
              : mode === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode((value) => (value === "login" ? "signup" : "login"))}
          className="mt-4 text-sm text-cyan-300 underline underline-offset-4"
        >
          {mode === "login"
            ? "Nao tem conta? Criar agora"
            : "Ja tem conta? Fazer login"}
        </button>

        {message ? (
          <p className="mt-4 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200">
            {message}
          </p>
        ) : null}
      </div>
    </main>
  );
}
