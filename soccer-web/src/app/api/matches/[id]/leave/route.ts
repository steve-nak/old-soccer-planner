import { NextRequest } from "next/server";

import { leaveMatch, isUserJoinedMatch } from "@/services/match-service";
import { createErrorResponse, createJsonResponse, handleCorsPreFlight, requireApiUser } from "@/lib/api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function OPTIONS() {
  return handleCorsPreFlight();
}

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser(request);

  if ("response" in auth) {
    return auth.response;
  }

  const { id } = await context.params;
  const matchId = Number.parseInt(id, 10);

  if (!Number.isFinite(matchId)) {
    return createErrorResponse("Match id must be a number.", 400);
  }

  const alreadyJoined = await isUserJoinedMatch(auth.user.id, matchId);

  if (!alreadyJoined) {
    return createErrorResponse("You are not joined to this match.", 404);
  }

  const left = await leaveMatch(auth.user.id, matchId);

  if (!left) {
    return createErrorResponse("Unable to leave this match right now.", 500);
  }

  return createJsonResponse({
    success: true,
  });
}
