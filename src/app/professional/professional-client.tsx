"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SectionCard } from "@/components/ui/section-card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";

type ProfessionalEntry = {
  id: string;
  entry_type: "career" | "study" | "learning";
  title: string;
  content: string | null;
  created_at: string;
};

function entryTypeLabel(type: ProfessionalEntry["entry_type"]) {
  if (type === "career") return "Carreira";
  if (type === "study") return "Estudos";
  return "Aprendizados";
}

export function ProfessionalClient({ initialEntries }: { initialEntries: ProfessionalEntry[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [entries, setEntries] = useState(initialEntries);
  const [entryType, setEntryType] = useState<"career" | "study" | "learning">("career");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  async function createEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length < 3) {
      setMessage("Título inválido.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("professional_entries")
      .insert({
        user_id: user.id,
        entry_type: entryType,
        title: title.trim(),
        content: content.trim() || null,
      })
      .select("id, entry_type, title, content, created_at")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setEntries((prev) => [data as ProfessionalEntry, ...prev]);
    setTitle("");
    setContent("");
    setMessage("Registro profissional salvo.");
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Novo registro profissional" subtitle="Carreira, estudos e aprendizados.">
        <form onSubmit={createEntry} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              value={entryType}
              onChange={(event) => setEntryType(event.target.value as "career" | "study" | "learning")}
            >
              <option value="career">Planejamento de carreira</option>
              <option value="study">Controle de estudos</option>
              <option value="learning">Aprendizado do dia</option>
            </Select>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
          </div>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={4}
            placeholder="Descreva seu plano/estudo/aprendizado..."
          />
          <Button type="submit" variant="primary">
            Salvar
          </Button>
        </form>
      </SectionCard>

      <SectionCard title="Linha do tempo profissional">
        <div className="space-y-3">
          {entries.length === 0 ? (
            <p className="text-sm text-[var(--app-text-muted)]">Sem registros ainda.</p>
          ) : (
            entries.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--app-primary)]">{entryTypeLabel(entry.entry_type)}</p>
                <h3 className="mt-1 font-semibold text-[var(--app-text)]">{entry.title}</h3>
                {entry.content ? <p className="mt-2 text-sm text-[var(--app-text-muted)]">{entry.content}</p> : null}
              </article>
            ))
          )}
        </div>
        {message ? <p className="mt-4 text-sm text-[var(--app-primary-strong)]">{message}</p> : null}
      </SectionCard>
    </div>
  );
}

