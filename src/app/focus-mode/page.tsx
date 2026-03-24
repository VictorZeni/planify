import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FocusModeClient } from "./focus-mode-client";

type FocusModePageProps = {
  searchParams: Promise<{ taskId?: string }>;
};

export default async function FocusModePage({ searchParams }: FocusModePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { taskId } = await searchParams;
  if (!taskId) {
    redirect("/dashboard");
  }

  const { data: task } = await supabase
    .from("tasks")
    .select("id, title, completed")
    .eq("id", taskId)
    .maybeSingle();

  if (!task || task.completed) {
    redirect("/dashboard");
  }

  return <FocusModeClient taskId={task.id} taskTitle={task.title} />;
}

