"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SectionCard } from "@/components/ui/section-card";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

type Note = {
  id: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
};

export function NotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [notes, setNotes] = useState(initialNotes);
  const [category, setCategory] = useState("GERAL");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length < 3 || content.trim().length < 3) {
      setMessage("Preencha título e conteúdo.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        category: category.toUpperCase(),
        title: title.trim(),
        content: content.trim(),
      })
      .select("id, category, title, content, created_at")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setNotes((prev) => [data as Note, ...prev]);
    setTitle("");
    setContent("");
    setMessage("Nota criada.");
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Nova anotação" subtitle="Organize aprendizados e ideias por categoria.">
        <form onSubmit={createNote} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Título" />
            <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Categoria" />
          </div>
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={5}
            placeholder="Escreva sua nota..."
          />
          <Button type="submit" variant="primary">
            Salvar nota
          </Button>
        </form>
      </SectionCard>

      <SectionCard title="Biblioteca de notas">
        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-[var(--app-text-muted)]">Sem notas por enquanto.</p>
          ) : (
            notes.map((note) => (
              <article key={note.id} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] p-4">
                <p className="text-xs uppercase tracking-wide text-[var(--app-primary)]">{note.category}</p>
                <h3 className="mt-1 font-semibold text-[var(--app-text)]">{note.title}</h3>
                <p className="mt-2 text-sm text-[var(--app-text-muted)]">{note.content}</p>
              </article>
            ))
          )}
        </div>
        {message ? <p className="mt-4 text-sm text-[var(--app-primary-strong)]">{message}</p> : null}
      </SectionCard>
    </div>
  );
}

