import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/server/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { apiForbidden } from "@/lib/server/api-response";

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const bodySchema = z.object({
  isAuthorized: z.boolean(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (process.env.ALLOW_MANUAL_AUTHORIZATION !== "true") {
    return apiForbidden("Liberação manual desativada. Acesso apenas via pagamento.");
  }

  const adminGuard = await requireAdminApi();
  if ("errorResponse" in adminGuard) {
    return adminGuard.errorResponse;
  }

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 422 });
  }

  const payload = await request.json();
  const parsedBody = bodySchema.safeParse(payload);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("profiles").upsert({
    id: parsedParams.data.id,
    is_authorized: parsedBody.data.isAuthorized,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    data: {
      id: parsedParams.data.id,
      isAuthorized: parsedBody.data.isAuthorized,
    },
  });
}

