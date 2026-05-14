import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { MatchActions } from "@/components/match/MatchActions";
import { MatchInfo } from "@/components/match/MatchInfo";
import { getCurrentUser } from "@/services/auth-service";
import { getMatchById, isUserGroupMember, isUserJoinedMatch } from "@/services/match-service";
import { getMatchTimingState, isMatchActive } from "@/lib/match-status";

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const matchId = Number(id);

  if (!matchId || Number.isNaN(matchId)) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h1 className="text-lg font-semibold text-red-900">Invalid Match ID</h1>
            <p className="mt-2 text-sm text-red-700">The match ID provided is not valid.</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const [currentUser, match] = await Promise.all([getCurrentUser(), getMatchById(matchId)]);

  if (!match) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h1 className="text-lg font-semibold text-red-900">Match Not Found</h1>
            <p className="mt-2 text-sm text-red-700">The requested match does not exist.</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    redirect(`/login?redirectTo=/match/${matchId}`);
  }

  const isGroupMember = await isUserGroupMember(currentUser.id, match.groupId);

  if (!isGroupMember) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h1 className="text-lg font-semibold text-red-900">Access Denied</h1>
            <p className="mt-2 text-sm text-red-700">
              You must be a member of the group to view this match.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const timingState = getMatchTimingState(new Date(match.startsAt));
  const isActive = isMatchActive(match);
  const isJoined = await isUserJoinedMatch(currentUser.id, matchId);
  const userJoin = match.joins.find((join) => join.userId === currentUser.id);
  const totalPlayers = match.joins.reduce((accumulator, join) => accumulator + 1 + join.extraSlots, 0);
  const remainingSlots = Math.max(0, match.capacity - totalPlayers);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MatchInfo match={match} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <MatchActions
                matchId={matchId}
                isJoined={isJoined}
                userExtraSlots={userJoin?.extraSlots}
                isMember={true}
                isActive={isActive}
                matchState={timingState}
                isCanceled={match.isCanceled}
                remainingSlots={remainingSlots}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
