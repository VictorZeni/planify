"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SectionCard } from "@/components/ui/section-card";

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
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Título"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
            />
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Categoria"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
            />
          </div>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={5}
            placeholder="Escreva sua nota..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Salvar nota
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Biblioteca de notas">
        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-slate-400">Sem notas por enquanto.</p>
          ) : (
            notes.map((note) => (
              <article key={note.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-wide text-cyan-300">{note.category}</p>
                <h3 className="mt-1 font-semibold text-slate-100">{note.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{note.content}</p>
              </article>
            ))
          )}
        </div>
        {message ? <p className="mt-4 text-sm text-cyan-200">{message}</p> : null}
      </SectionCard>
    </div>
  );
}
