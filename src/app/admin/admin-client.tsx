"use client";

import { useState } from "react";
import { AlertState } from "@/components/ui/feedback-state";

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
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Administracao</p>
        <h2 className="mt-2 text-xl font-semibold text-slate-100">Controle de acesso dos usuarios</h2>
        <p className="mt-1 text-sm text-slate-300">
          Libere ou bloqueie contas manualmente. O pagamento tambem pode ativar acesso automatico.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-slate-900/60 text-slate-300">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cobrança</th>
              <th className="px-4 py-3">Acao</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/5 text-slate-100">
                <td className="px-4 py-3">{user.email || "-"}</td>
                <td className="px-4 py-3">{user.displayName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      user.isAuthorized
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-rose-500/20 text-rose-200"
                    }`}
                  >
                    {user.isAuthorized ? "Ativo" : "Bloqueado"}
                  </span>
                  {user.isAdmin ? (
                    <span className="ml-2 rounded-full bg-cyan-500/20 px-2 py-1 text-xs font-semibold text-cyan-200">
                      Admin
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-700/60 px-2 py-1 text-xs text-slate-200">
                    {user.billingStatus ?? "inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {!allowManualAuthorization ? (
                    <span className="text-xs text-slate-400">Acesso via pagamento</span>
                  ) : (
                  <button
                    type="button"
                    onClick={() => void toggleAuthorization(user.id, !user.isAuthorized)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      user.isAuthorized
                        ? "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
                        : "bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                    }`}
                  >
                    {user.isAuthorized ? "Bloquear acesso" : "Liberar acesso"}
                  </button>
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
