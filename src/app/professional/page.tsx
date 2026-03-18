import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { requireUserContext } from "@/lib/server/require-user";
import { ProfessionalClient } from "./professional-client";

type ProfessionalRow = {
  id: string;
  entry_type: "career" | "study" | "learning";
  title: string;
  content: string | null;
  created_at: string;
};

export default async function ProfessionalPage() {
  const { supabase, userCard, user } = await requireUserContext();

  const { data: entries } = await supabase
    .from("professional_entries")
    .select("id, entry_type, title, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell user={userCard}>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader
          eyebrow="Profissional"
          title="Carreira e estudos"
          description="Registre evolução de carreira, plano de estudos e aprendizados."
        />
        <ProfessionalClient initialEntries={(entries ?? []) as ProfessionalRow[]} />
      </div>
    </AppShell>
  );
}
