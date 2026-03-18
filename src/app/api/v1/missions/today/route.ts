import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  taskId: z.string().uuid(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("daily_missions")
    .select("task_id")
    .eq("user_id", user.id)
    .eq("mission_date", today);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data: (data ?? []).map((row) => row.task_id) });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: current, error: currentError } = await supabase
    .from("daily_missions")
    .select("id")
    .eq("user_id", user.id)
    .eq("mission_date", today);

  if (currentError) return NextResponse.json({ error: currentError.message }, { status: 400 });
  if ((current ?? []).length >= 3) {
    return NextResponse.json({ error: "Limite de 3 tarefas por dia." }, { status: 409 });
  }

  const { error } = await supabase.from("daily_missions").insert({
    user_id: user.id,
    task_id: parsed.data.taskId,
    mission_date: today,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from("daily_missions")
    .delete()
    .eq("user_id", user.id)
    .eq("task_id", parsed.data.taskId)
    .eq("mission_date", today);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
