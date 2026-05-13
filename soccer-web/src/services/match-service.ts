import { eq, and } from "drizzle-orm";
import { db, matches, matchJoins, groups, groupMembers, users, matchComments } from "@/db";

export type MatchDetail = {
  id: number;
  groupId: number;
  startsAt: Date;
  location: string;
  capacity: number;
  isCanceled: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MatchWithDetails = MatchDetail & {
  group: {
    id: number;
    title: string;
    description: string | null;
  };
  joins: Array<{
    userId: number;
    extraSlots: number;
    joinedAt: Date;
    user: {
      id: number;
      name: string;
      email: string;
      photoUrl: string | null;
    };
  }>;
  comments: Array<{
    id: number;
    text: string;
    createdAt: Date;
    user: {
      id: number;
      name: string;
      email: string;
      photoUrl: string | null;
    };
  }>;
};

export async function getMatchById(matchId: number): Promise<MatchWithDetails | null> {
  try {
    const matchRow = await db
      .select({
        match: matches,
        group: {
          id: groups.id,
          title: groups.title,
          description: groups.description,
        },
      })
      .from(matches)
      .innerJoin(groups, eq(matches.groupId, groups.id))
      .where(eq(matches.id, matchId))
      .limit(1);

    if (!matchRow[0]) {
      return null;
    }

    const { match: matchData, group } = matchRow[0];

    // Get all joins with user details
    const joinsData = await db
      .select({
        userId: matchJoins.userId,
        extraSlots: matchJoins.extraSlots,
        joinedAt: matchJoins.joinedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          photoUrl: users.photoUrl,
        },
      })
      .from(matchJoins)
      .innerJoin(users, eq(matchJoins.userId, users.id))
      .where(eq(matchJoins.matchId, matchId));

    // Get all comments with user details
    const commentsData = await db
      .select({
        id: matchComments.id,
        text: matchComments.text,
        createdAt: matchComments.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          photoUrl: users.photoUrl,
        },
      })
      .from(matchComments)
      .innerJoin(users, eq(matchComments.userId, users.id))
      .where(eq(matchComments.matchId, matchId));

    return {
      id: matchData.id,
      groupId: matchData.groupId,
      startsAt: matchData.startsAt,
      location: matchData.location,
      capacity: matchData.capacity,
      isCanceled: matchData.isCanceled,
      createdAt: matchData.createdAt,
      updatedAt: matchData.updatedAt,
      group,
      joins: joinsData,
      comments: commentsData,
    };
  } catch (error) {
    console.error("[match-service] getMatchById failed", error);
    return null;
  }
}

export async function isUserGroupMember(userId: number, groupId: number): Promise<boolean> {
  try {
    const member = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)))
      .limit(1);

    return member.length > 0;
  } catch (error) {
    console.error("[match-service] isUserGroupMember failed", error);
    return false;
  }
}

export async function isUserJoinedMatch(userId: number, matchId: number): Promise<boolean> {
  try {
    const join = await db
      .select()
      .from(matchJoins)
      .where(and(eq(matchJoins.userId, userId), eq(matchJoins.matchId, matchId)))
      .limit(1);

    return join.length > 0;
  } catch (error) {
    console.error("[match-service] isUserJoinedMatch failed", error);
    return false;
  }
}

export async function joinMatch(userId: number, matchId: number): Promise<boolean> {
  try {
    await db.insert(matchJoins).values({
      userId,
      matchId,
      extraSlots: 0,
    });
    return true;
  } catch (error) {
    console.error("[match-service] joinMatch failed", error);
    return false;
  }
}

export async function leaveMatch(userId: number, matchId: number): Promise<boolean> {
  try {
    await db
      .delete(matchJoins)
      .where(and(eq(matchJoins.userId, userId), eq(matchJoins.matchId, matchId)));
    return true;
  } catch (error) {
    console.error("[match-service] leaveMatch failed", error);
    return false;
  }
}

export async function updateExtraSlots(userId: number, matchId: number, extraSlots: number): Promise<boolean> {
  try {
    // Ensure extraSlots is not negative
    const slots = Math.max(0, extraSlots);

    await db
      .update(matchJoins)
      .set({ extraSlots: slots })
      .where(and(eq(matchJoins.userId, userId), eq(matchJoins.matchId, matchId)));

    return true;
  } catch (error) {
    console.error("[match-service] updateExtraSlots failed", error);
    return false;
  }
}
