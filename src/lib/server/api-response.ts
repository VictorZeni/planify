import { NextResponse } from "next/server";

export function apiError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    details ? { error: message, details } : { error: message },
    { status },
  );
}

export function apiUnauthorized() {
  return apiError("Unauthorized", 401);
}

export function apiForbidden(message = "Acesso restrito.") {
  return apiError(message, 403);
}

export function apiValidationError(details?: unknown) {
  return apiError("Invalid payload", 422, details);
}


