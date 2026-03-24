import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiAccess } from "@/lib/server/api-access";
import { apiError, apiValidationError } from "@/lib/server/api-response";

const bodySchema = z.object({
  taskId: z.string().uuid(),
});

export async function GET() {
  const access = await requireApiAccess({ requireAuthorized: true });
  if ("errorResponse" in access) return access.errorResponse;
  const { supabase, user } = access;

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("daily_missions")
    .select("task_id")
    .eq("user_id", user.id)
    .eq("mission_date", today);

  if (error) return apiError(error.message, 400);

  return NextResponse.json({ data: (data ?? []).map((row) => row.task_id) });
}

export async function POST(request: Request) {
  const access = await requireApiAccess({ requireAuthorized: true });
  if ("errorResponse" in access) return access.errorResponse;
  const { supabase, user } = access;

  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return apiValidationError();
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: current, error: currentError } = await supabase
    .from("daily_missions")
    .select("id")
    .eq("user_id", user.id)
    .eq("mission_date", today);

  if (currentError) return apiError(currentError.message, 400);
  if ((current ?? []).length >= 3) {
    return apiError("Limite de 3 tarefas por dia.", 409);
  }

  const { error } = await supabase.from("daily_missions").insert({
    user_id: user.id,
    task_id: parsed.data.taskId,
    mission_date: today,
  });

  if (error) return apiError(error.message, 400);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const access = await requireApiAccess({ requireAuthorized: true });
  if ("errorResponse" in access) return access.errorResponse;
  const { supabase, user } = access;

  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return apiValidationError();
  }

  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from("daily_missions")
    .delete()
    .eq("user_id", user.id)
    .eq("task_id", parsed.data.taskId)
    .eq("mission_date", today);

  if (error) return apiError(error.message, 400);
  return NextResponse.json({ ok: true });
}

