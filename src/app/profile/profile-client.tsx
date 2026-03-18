"use client";

import { useState } from "react";

type ProfileClientProps = {
  initialDisplayName: string;
  initialEmail: string;
  initialAvatarUrl: string | null;
};

export function ProfileClient({
  initialDisplayName,
  initialEmail,
  initialAvatarUrl,
}: ProfileClientProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSaveProfile() {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/v1/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Erro ao atualizar perfil.");
      setLoading(false);
      return;
    }

    setMessage("Perfil atualizado com sucesso.");
    setLoading(false);
  }

  async function handleAvatarUpload(file: File) {
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch("/api/v1/profile/avatar", {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Erro ao enviar avatar.");
      setLoading(false);
      return;
    }

    setAvatarUrl(payload.data.avatarUrl);
    setMessage("Avatar atualizado.");
    setLoading(false);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h2 className="text-xl font-semibold text-white">Perfil do usuario</h2>
      <p className="mt-1 text-sm text-slate-300">{initialEmail}</p>

      <div className="mt-6 flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Avatar do usuario"
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20 text-lg font-bold text-cyan-200">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <label className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500">
          Upload de imagem
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleAvatarUpload(file);
            }}
          />
        </label>
      </div>

      <div className="mt-6 grid gap-3 md:max-w-lg">
        <label className="text-sm text-slate-300">Nome de exibicao</label>
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 transition focus:ring-2"
        />
        <button
          type="button"
          onClick={() => void handleSaveProfile()}
          disabled={loading}
          className="mt-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Salvando..." : "Salvar perfil"}
        </button>
      </div>

      {message ? <p className="mt-4 text-sm text-cyan-200">{message}</p> : null}
    </section>
  );
}
