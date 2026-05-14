import { NextRequest } from "next/server";

import { getMatchById } from "@/services/match-service";
import { createErrorResponse, createJsonResponse, requireApiUser } from "@/lib/api";
import { getMatchCapacityState, getMatchTimingState, isMatchActive } from "@/lib/match-status";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
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

  const totalPlayers = match.joins.reduce((accumulator, join) => accumulator + 1 + join.extraSlots, 0);

  return createJsonResponse({
    id: match.id,
    group: match.group,
    date: match.startsAt,
    location: match.location,
    state: {
      active: isMatchActive(match),
      timing: getMatchTimingState(match.startsAt),
      capacity: getMatchCapacityState(totalPlayers, match.capacity),
    },
    capacity: match.capacity,
    playersJoined: totalPlayers,
    joins: match.joins,
    comments: match.comments,
  });
}
