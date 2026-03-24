"use client";

import { useState } from "react";
import { DEFAULT_THEME, isThemeName, THEMES, type ThemeName } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProfileClientProps = {
  initialDisplayName: string;
  initialEmail: string;
  initialAvatarUrl: string | null;
  initialTheme: string;
};

function applyTheme(theme: ThemeName) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("planify-theme", theme);
}

export function ProfileClient({
  initialDisplayName,
  initialEmail,
  initialAvatarUrl,
  initialTheme,
}: ProfileClientProps) {
  const normalizedInitialTheme = isThemeName(initialTheme) ? initialTheme : DEFAULT_THEME;
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [theme, setTheme] = useState<ThemeName>(normalizedInitialTheme);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSaveProfile() {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/v1/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, theme }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setMessage(payload.error ?? "Erro ao atualizar perfil.");
      setLoading(false);
      return;
    }

    applyTheme(theme);
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
    <section className="rounded-xl border border-[var(--app-border)] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[var(--app-text)]">Perfil do usuário</h2>
      <p className="mt-1 text-sm text-[var(--app-text-muted)]">{initialEmail}</p>

      <div className="mt-6 flex items-center gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Avatar do usuario"
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--app-primary-soft)] text-lg font-bold text-[var(--app-primary-strong)]">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-[var(--app-border)] bg-white px-3 text-sm text-[var(--app-text)] transition-all hover:bg-[var(--app-surface-soft)]">
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

      <div className="mt-6 grid gap-3 md:max-w-xl">
        <label className="text-sm text-[var(--app-text-muted)]">Nome de exibição</label>
        <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />

        <label className="mt-2 text-sm text-[var(--app-text-muted)]">Tema visual (psicologia das cores)</label>
        <div className="grid gap-2">
          {THEMES.map((item) => {
            const selected = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTheme(item.id);
                  applyTheme(item.id);
                }}
                className={`rounded-lg border px-3 py-2 text-left transition-all ${
                  selected
                    ? "border-[var(--app-primary)] bg-[var(--app-primary-soft)]"
                    : "border-[var(--app-border)] bg-white hover:bg-[var(--app-surface-soft)]"
                }`}
              >
                <p className="text-sm font-semibold text-[var(--app-text)]">{item.label}</p>
                <p className="text-xs text-[var(--app-text-muted)]">{item.description}</p>
              </button>
            );
          })}
        </div>

        <Button
          type="button"
          onClick={() => void handleSaveProfile()}
          disabled={loading}
          variant="primary"
          className="mt-2"
        >
          {loading ? "Salvando..." : "Salvar perfil"}
        </Button>
      </div>

      {message ? <p className="mt-4 text-sm text-[var(--app-primary-strong)]">{message}</p> : null}
    </section>
  );
}

