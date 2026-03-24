"use client";

import { useState } from "react";
import { AlertState } from "@/components/ui/feedback-state";
import { Button } from "@/components/ui/button";

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  isAuthorized: boolean;
  isAdmin: boolean;
  billingStatus?: string;
  updatedAt: string | null;
};

export function AdminClient({
  initialUsers,
  allowManualAuthorization,
}: {
  initialUsers: AdminUser[];
  allowManualAuthorization: boolean;
}) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [message, setMessage] = useState("");

  async function toggleAuthorization(userId: string, nextValue: boolean) {
    setMessage("");
    const response = await fetch(`/api/v1/admin/users/${userId}/authorization`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAuthorized: nextValue }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error ?? "Nao foi possivel atualizar acesso.");
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, isAuthorized: payload.data.isAuthorized } : user,
      ),
    );
    setMessage("Status de acesso atualizado.");
  }

  return (
    <section className="space-y-4 rounded-xl border border-[var(--app-border)] bg-white p-5 shadow-sm">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-primary)]">Administração</p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--app-text)]">Controle de acesso dos usuários</h2>
        <p className="mt-1 text-sm text-[var(--app-text-muted)]">
          Libere ou bloqueie contas manualmente. O pagamento também pode ativar acesso automático.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-[var(--app-border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--app-border)] bg-[var(--app-surface-soft)] text-[var(--app-text-muted)]">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cobrança</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[var(--app-border)] text-[var(--app-text)]">
                <td className="px-4 py-3">{user.email || "-"}</td>
                <td className="px-4 py-3">{user.displayName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      user.isAuthorized ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.isAuthorized ? "Ativo" : "Bloqueado"}
                  </span>
                  {user.isAdmin ? (
                    <span className="ml-2 rounded-full bg-[var(--app-primary-soft)] px-2 py-1 text-xs font-semibold text-[var(--app-primary-strong)]">
                      Admin
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[var(--app-surface-soft)] px-2 py-1 text-xs text-[var(--app-text-muted)]">
                    {user.billingStatus ?? "inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!allowManualAuthorization ? (
                    <span className="text-xs text-[var(--app-text-muted)]">Acesso via pagamento</span>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => void toggleAuthorization(user.id, !user.isAuthorized)}
                      size="sm"
                      variant={user.isAuthorized ? "danger" : "primary"}
                    >
                      {user.isAuthorized ? "Bloquear acesso" : "Liberar acesso"}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {message ? <AlertState text={message} /> : null}
    </section>
  );
}

