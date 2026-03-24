import { requireApiAccess } from "@/lib/server/api-access";

export async function requireAdminApi() {
  return requireApiAccess({ requireAdmin: true });
}

