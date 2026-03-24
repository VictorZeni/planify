import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .select("id, completed, completed_at, created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const total = data.length;
  const completed = data.filter((task) => task.completed).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const weeklyCompleted = data.filter((task) => {
    if (!task.completed_at) return false;
    const date = new Date(task.completed_at);
    return date >= sevenDaysAgo && date <= now;
  }).length;

  return NextResponse.json({
    data: {
      totalTasks: total,
      completedTasks: completed,
      completionRate,
      weeklyCompleted,
    },
  });
}

