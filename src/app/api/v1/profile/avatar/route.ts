import { NextResponse } from "next/server";
import { requireApiAccess } from "@/lib/server/api-access";
import { apiError, apiValidationError } from "@/lib/server/api-response";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

function safeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

function hasAllowedExtension(filename: string) {
  const lower = filename.toLowerCase();
  return ALLOWED_EXT.some((ext) => lower.endsWith(ext));
}

export async function POST(request: Request) {
  const access = await requireApiAccess();
  if ("errorResponse" in access) return access.errorResponse;
  const { supabase, user } = access;

  const form = await request.formData();
  const file = form.get("avatar");

  if (!(file instanceof File)) {
    return apiValidationError();
  }

  if (!ALLOWED_MIME.includes(file.type) || !hasAllowedExtension(file.name)) {
    return apiValidationError({ message: "Tipo de arquivo nao permitido" });
  }

  if (file.size > MAX_FILE_SIZE) {
    return apiValidationError({ message: "Arquivo excede 2MB" });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const path = `${user.id}/${Date.now()}-${safeFilename(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (uploadError) {
    return apiError(uploadError.message, 400);
  }

  const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(path);
  const avatarUrl = publicData.publicUrl;

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return apiError(profileError.message, 400);
  }

  return NextResponse.json({ data: { avatarUrl } });
}
