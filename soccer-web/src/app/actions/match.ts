"use server";

import { getCurrentUser } from "@/services/auth-service";
import {
  getMatchById,
  isUserGroupMember,
  isUserJoinedMatch,
  joinMatch,
  leaveMatch,
  updateExtraSlots,
} from "@/services/match-service";
import { revalidatePath } from "next/cache";

export type MatchActionState = {
  error: string | null;
};

export async function joinMatchAction(matchId: number): Promise<MatchActionState> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { error: "You must be logged in to join a match" };
    }

    const match = await getMatchById(matchId);

    if (!match) {
      return { error: "Match not found" };
    }

    const isGroupMember = await isUserGroupMember(currentUser.id, match.groupId);

    if (!isGroupMember) {
      return { error: "You must be a member of the group to join a match" };
    }

    const alreadyJoined = await isUserJoinedMatch(currentUser.id, matchId);

    if (alreadyJoined) {
      return { error: "You have already joined this match" };
    }

    const success = await joinMatch(currentUser.id, matchId);

    if (!success) {
      return { error: "Failed to join the match" };
    }

    revalidatePath(`/matches/${matchId}`);
    return { error: null };
  } catch (error) {
    console.error("[match-actions] joinMatchAction failed", error);
    return { error: "An error occurred while joining the match" };
  }
}

export async function leaveMatchAction(matchId: number): Promise<MatchActionState> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { error: "You must be logged in to leave a match" };
    }

    const success = await leaveMatch(currentUser.id, matchId);

    if (!success) {
      return { error: "Failed to leave the match" };
    }

    revalidatePath(`/matches/${matchId}`);
    return { error: null };
  } catch (error) {
    console.error("[match-actions] leaveMatchAction failed", error);
    return { error: "An error occurred while leaving the match" };
  }
}

export async function updateExtraSlotsAction(
  matchId: number,
  extraSlots: number,
): Promise<MatchActionState> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { error: "You must be logged in to update slots" };
    }

    const success = await updateExtraSlots(currentUser.id, matchId, extraSlots);

    if (!success) {
      return { error: "Failed to update slots" };
    }

    revalidatePath(`/matches/${matchId}`);
    return { error: null };
  } catch (error) {
    console.error("[match-actions] updateExtraSlotsAction failed", error);
    return { error: "An error occurred while updating slots" };
  }
}
