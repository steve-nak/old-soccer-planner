import { NextRequest } from "next/server";

import { loginUser } from "@/services/auth-service";
import { createErrorResponse, createJsonResponse } from "@/lib/api";

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };

  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return createErrorResponse("Request body must be valid JSON.", 400);
  }

  const result = await loginUser({
    email: body.email ?? "",
    password: body.password ?? "",
  });

  if (!result.success) {
    return createErrorResponse(result.error, 401);
  }

  return createJsonResponse({
    token: result.token,
    user: result.user,
  });
}
