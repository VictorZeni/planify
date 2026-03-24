import { NextResponse } from "next/server";
import { z } from "zod";
import { calculateXP, levelFromXp } from "@/lib/services/xp";
import { normalizePriority } from "@/lib/priority";
import { requireApiAccess } from "@/lib/server/api-access";
import { apiError, apiValidationError } from "@/lib/server/api-response";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function calculateCurrentStreak(days: Set<string>) {
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const access = await requireApiAccess({ requireAuthorized: true });
  if ("errorResponse" in access) {
    return access.errorResponse;
  }
  const { supabase, user } = access;

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return apiValidationError();
  }

  const taskId = parsedParams.data.id;
  const completedAt = new Date().toISOString();

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("id, completed, due_at, priority")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    return apiError(taskError?.message ?? "Task not found", 404);
  }

  if (task.completed) {
    return NextResponse.json({ error: "Task already completed" }, { status: 409 });
  }

  const xpGain = calculateXP({
    priority: normalizePriority(task.priority),
    dueAt: task.due_at,
  });

  const { error: completeError } = await supabase
    .from("tasks")
    .update({
      completed: true,
      completed_at: completedAt,
    })
    .eq("id", taskId);

  if (completeError) {
    return apiError(completeError.message, 400);
  }

  const { data: currentStats } = await supabase
    .from("user_stats")
    .select("xp, level, best_streak")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: completionsData } = await supabase
    .from("tasks")
    .select("completed_at")
    .eq("user_id", user.id)
    .eq("completed", true)
    .not("completed_at", "is", null);

  const completionDays = new Set(
    (completionsData ?? []).map((row) => dayKey(new Date(row.completed_at as string))),
  );
  const currentStreak = calculateCurrentStreak(completionDays);
  const bestStreak = Math.max(currentStats?.best_streak ?? 0, currentStreak);

  const nextXp = (currentStats?.xp ?? 0) + xpGain;
  const levelData = levelFromXp(nextXp);

  const { error: statsError } = await supabase.from("user_stats").upsert({
    user_id: user.id,
    xp: nextXp,
    level: levelData.level,
    current_streak: currentStreak,
    best_streak: bestStreak,
    updated_at: new Date().toISOString(),
  });

  if (statsError) {
    return apiError(statsError.message, 400);
  }

  return NextResponse.json({
    data: {
      taskId,
      xpGain,
      xp: nextXp,
      level: levelData.level,
      progressPercent: levelData.progressPercent,
      currentStreak,
      bestStreak,
    },
  });
}

