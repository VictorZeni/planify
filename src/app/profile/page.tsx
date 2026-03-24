import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const metaDisplayName =
    (user.user_metadata?.display_name as string | undefined) ??
    `${user.user_metadata?.first_name ?? ""} ${user.user_metadata?.last_name ?? ""}`.trim();
  const fallbackDisplayName = metaDisplayName || user.email?.split("@")[0] || "Usuario";

  const { data: profileData } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, theme, is_admin, is_authorized")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profileData?.display_name ?? fallbackDisplayName;
  const avatarUrl = profileData?.avatar_url ?? null;

  return (
    <AppShell
      user={{
        displayName,
        email: user.email ?? "",
        avatarUrl,
        isAdmin: profileData?.is_admin ?? false,
        isAuthorized: profileData?.is_authorized ?? false,
      }}
    >
      <PageWrapper maxWidth="5xl">
        <PageHeader eyebrow="Perfil" title="Configurações da conta" />

        <ProfileClient
          initialDisplayName={displayName}
          initialEmail={user.email ?? ""}
          initialAvatarUrl={avatarUrl}
          initialTheme={profileData?.theme ?? "foco"}
        />
      </PageWrapper>
    </AppShell>
  );
}

