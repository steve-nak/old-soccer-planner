import { NextRequest } from "next/server";

import { getMatchById, isUserJoinedMatch, joinMatch } from "@/services/match-service";
import { createErrorResponse, createJsonResponse, handleCorsPreFlight, requireApiUser } from "@/lib/api";
import { isMatchActive } from "@/lib/match-status";

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

  const match = await getMatchById(matchId);

  if (!match) {
    return createErrorResponse("Match not found.", 404);
  }

  if (!isMatchActive(match)) {
    return createErrorResponse("This match is not open for joining.", 409);
  }

  const totalPlayers = match.joins.reduce((accumulator, join) => accumulator + 1 + join.extraSlots, 0);

  if (totalPlayers >= match.capacity) {
    return createErrorResponse("This match is already full.", 409);
  }

  const alreadyJoined = await isUserJoinedMatch(auth.user.id, matchId);

  if (alreadyJoined) {
    return createErrorResponse("You already joined this match.", 409);
  }

  const joined = await joinMatch(auth.user.id, matchId);

  if (!joined) {
    return createErrorResponse("Unable to join this match right now.", 500);
  }

  return createJsonResponse({
    success: true,
  });
}
