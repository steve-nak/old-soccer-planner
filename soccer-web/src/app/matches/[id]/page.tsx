import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth-service";
import { getMatchById, isUserGroupMember, isUserJoinedMatch } from "@/services/match-service";
import { MatchInfo } from "@/components/match/MatchInfo";
import { MatchActions } from "@/components/match/MatchActions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface MatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const matchId = Number(id);

  if (!matchId || isNaN(matchId)) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h1 className="text-lg font-semibold text-red-900">Invalid Match ID</h1>
            <p className="mt-2 text-sm text-red-700">The match ID provided is not valid.</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const [currentUser, match] = await Promise.all([
    getCurrentUser(),
    getMatchById(matchId),
  ]);

  if (!match) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h1 className="text-lg font-semibold text-red-900">Match Not Found</h1>
            <p className="mt-2 text-sm text-red-700">The match you're looking for doesn't exist.</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    redirect(`/login?redirectTo=/matches/${matchId}`);
  }

  const isGroupMember = await isUserGroupMember(currentUser.id, match.groupId);

  if (!isGroupMember) {
    return (
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
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
              href="/"
              className="mt-4 inline-block rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isJoined = await isUserJoinedMatch(currentUser.id, matchId);
  const userJoin = match.joins.find((join) => join.userId === currentUser.id);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <MatchInfo match={match} />
          </div>

          {/* Sidebar - Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <MatchActions
                matchId={matchId}
                isJoined={isJoined}
                userExtraSlots={userJoin?.extraSlots}
                isMember={true}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
