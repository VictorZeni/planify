"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

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
      <Button
        type="button"
        onClick={() => void handleCheckout()}
        disabled={loading}
        variant="primary"
        className="w-full"
      >
        {loading ? "Redirecionando..." : "Desbloquear acesso com pagamento"}
      </Button>
      {message ? (
        <p className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-3 text-sm text-[var(--app-text)]">
          {message}
        </p>
      ) : null}
    </div>
  );
}

