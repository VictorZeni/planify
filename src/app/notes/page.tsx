import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { requireUserContext } from "@/lib/server/require-user";
import { NotesClient } from "./notes-client";

type NoteRow = {
  id: string;
  category: string;
  title: string;
  content: string;
  created_at: string;
};

export default async function NotesPage() {
  const { supabase, userCard, user } = await requireUserContext();

  const { data: notes } = await supabase
    .from("notes")
    .select("id, category, title, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell user={userCard}>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          eyebrow="Anotações"
          title="Base de conhecimento pessoal"
          description="Centralize ideias, aprendizados e referências."
        />
        <NotesClient initialNotes={(notes ?? []) as NoteRow[]} />
      </div>
    </AppShell>
  );
}
