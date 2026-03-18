import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUserContext() {
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

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, is_authorized, is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profileData) {
    const fallbackName = user.email?.split("@")[0] ?? "Usuario";
    const { error: createProfileError } = await supabase.from("profiles").insert({
      id: user.id,
      display_name: metaDisplayName || fallbackName,
      is_authorized: false,
      is_admin: false,
    });

    if (createProfileError) {
      throw new Error(createProfileError.message);
    }
  }

  const isAuthorized = profileData?.is_authorized ?? false;
  const isAdmin = profileData?.is_admin ?? false;

  return {
    supabase,
    user,
    userCard: {
      displayName: profileData?.display_name ?? fallbackDisplayName,
      email: user.email ?? "",
      avatarUrl: profileData?.avatar_url ?? null,
      isAuthorized,
      isAdmin,
    },
    access: {
      isAuthorized,
      isAdmin,
    },
  };
}
