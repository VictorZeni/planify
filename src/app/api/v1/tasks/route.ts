import { NextResponse } from "next/server";
import { createTaskSchema } from "@/lib/validation/task";
import { requireApiAccess } from "@/lib/server/api-access";
import { apiError, apiValidationError } from "@/lib/server/api-response";

export async function GET() {
  const access = await requireApiAccess({ requireAuthorized: true });
  if ("errorResponse" in access) {
    return access.errorResponse;
  }
  const { supabase } = access;

  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, completed, due_at, priority, category_id, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return apiError(error.message, 400);
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const access = await requireApiAccess({ requireAuthorized: true });
  if ("errorResponse" in access) {
    return access.errorResponse;
  }
  const { supabase, user } = access;

  const payload = await request.json();
  const parsed = createTaskSchema.safeParse(payload);
  if (!parsed.success) {
    return apiValidationError(parsed.error.flatten());
  }

  const { title, dueAt, categoryId, priority } = parsed.data;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: title.toUpperCase(),
      due_at: dueAt ?? null,
      category_id: categoryId ?? null,
      priority,
    })
    .select("id, title, completed, due_at, priority, category_id, created_at")
    .single();

  if (error) {
    return apiError(error.message, 400);
  }

  return NextResponse.json({ data }, { status: 201 });
}

