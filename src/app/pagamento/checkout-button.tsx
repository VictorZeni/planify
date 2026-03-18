"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/v1/billing/checkout", { method: "POST" });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.error ?? "Não foi possível iniciar pagamento.");
        return;
      }

      if (payload.data?.url) {
        window.location.href = payload.data.url;
        return;
      }

      setMessage("Checkout criado, mas sem URL de redirecionamento.");
    } catch {
      setMessage("Erro inesperado ao iniciar checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void handleCheckout()}
        disabled={loading}
        className="w-full rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Redirecionando..." : "Desbloquear acesso com pagamento"}
      </button>
      {message ? (
        <p className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200">
          {message}
        </p>
      ) : null}
    </div>
  );
}

