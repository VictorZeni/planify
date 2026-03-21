import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/app-shell";
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
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Perfil</p>
          <h1 className="mt-2 text-2xl font-bold">Configuracoes da conta</h1>
        </header>

        <ProfileClient
          initialDisplayName={displayName}
          initialEmail={user.email ?? ""}
          initialAvatarUrl={avatarUrl}
          initialTheme={profileData?.theme ?? "foco"}
        />
      </div>
    </AppShell>
  );
}
