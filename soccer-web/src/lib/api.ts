import { NextRequest, NextResponse } from "next/server";

import { getUserById, type AuthUser } from "@/services/auth-service";
import { verifyJwt } from "@/lib/auth";

export function createJsonResponse<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

export function createErrorResponse(message: string, status = 400, details?: string) {
  return NextResponse.json(
    {
      error: {
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  );
}

export async function requireApiUser(request: NextRequest): Promise<{ user: AuthUser } | { response: NextResponse }> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      response: createErrorResponse("Missing Bearer token.", 401),
    };
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return {
      response: createErrorResponse("Missing Bearer token.", 401),
    };
  }

  const payload = await verifyJwt(token);

  if (!payload) {
    return {
      response: createErrorResponse("Invalid or expired token.", 401),
    };
  }

  const user = await getUserById(Number(payload.sub));

  if (!user) {
    return {
      response: createErrorResponse("User not found.", 401),
    };
  }

  return { user };
}

export function parsePositiveInteger(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}
