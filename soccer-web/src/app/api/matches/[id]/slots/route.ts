import { NextRequest } from "next/server";

import { getMatchById, isUserJoinedMatch, updateExtraSlots } from "@/services/match-service";
import { createErrorResponse, createJsonResponse, requireApiUser } from "@/lib/api";
import { isMatchActive } from "@/lib/match-status";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await requireApiUser(request);

  if ("response" in auth) {
    return auth.response;
  }

  let body: { extraSlots?: unknown };

  try {
    body = (await request.json()) as { extraSlots?: unknown };
  } catch {
    return createErrorResponse("Request body must be valid JSON.", 400);
  }

  const { id } = await context.params;
  const matchId = Number.parseInt(id, 10);

  if (!Number.isFinite(matchId)) {
    return createErrorResponse("Match id must be a number.", 400);
  }

  const extraSlots = Number(body.extraSlots);

  if (!Number.isInteger(extraSlots) || extraSlots < 0) {
    return createErrorResponse("extraSlots must be an integer greater than or equal to 0.", 400);
  }

  const match = await getMatchById(matchId);

  if (!match) {
    return createErrorResponse("Match not found.", 404);
  }

  if (!isMatchActive(match)) {
    return createErrorResponse("This match is not open for joining.", 409);
  }

  const joined = await isUserJoinedMatch(auth.user.id, matchId);

  if (!joined) {
    return createErrorResponse("You must join the match before reserving extra slots.", 404);
  }

  const otherPlayers = match.joins
    .filter((join) => join.userId !== auth.user.id)
    .reduce((accumulator, join) => accumulator + 1 + join.extraSlots, 0);

  const requestedTotal = otherPlayers + 1 + extraSlots;

  if (requestedTotal > match.capacity) {
    return createErrorResponse("Not enough capacity for the requested extra slots.", 409);
  }

  const updated = await updateExtraSlots(auth.user.id, matchId, extraSlots);

  if (!updated) {
    return createErrorResponse("Unable to update extra slots right now.", 500);
  }

  return createJsonResponse({
    success: true,
    extraSlots,
  });
}
