import Image from "next/image";
import { MatchWithDetails } from "@/services/match-service";
import { formatDistanceToNow, format } from "date-fns";
import { AlertCircle, Calendar, MapPin, ShieldAlert, Users } from "lucide-react";
import { getMatchCapacityState, getMatchTimingState } from "@/lib/match-status";

export interface MatchInfoProps {
  match: MatchWithDetails;
}

export function MatchInfo({ match }: MatchInfoProps) {
  const totalPlayers = match.joins.reduce((acc, join) => acc + 1 + join.extraSlots, 0);
  const availableSlots = match.capacity - totalPlayers;
  const timingState = getMatchTimingState(new Date(match.startsAt));
  const capacityState = getMatchCapacityState(totalPlayers, match.capacity);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
          <ShieldAlert className="h-3.5 w-3.5" />
          {timingState}
        </span>
        {match.isCanceled && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
            <AlertCircle className="h-3.5 w-3.5" />
            canceled
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
          <Users className="h-3.5 w-3.5" />
          {capacityState}
        </span>
      </div>

      {/* Match Basic Info */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{match.group.title}</h1>
          <p className="mt-2 text-base text-slate-600">{match.group.description}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Calendar className="h-4 w-4" />
              Date & Time
            </div>
            <div className="mt-2 text-base font-semibold text-slate-900">
              {format(new Date(match.startsAt), "PPP p")}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {formatDistanceToNow(new Date(match.startsAt), { addSuffix: true })}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <MapPin className="h-4 w-4" />
              Location
            </div>
            <div className="mt-2 text-base font-semibold text-slate-900">{match.location}</div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Users className="h-4 w-4" />
              Players
            </div>
            <div className="mt-2 text-base font-semibold text-slate-900">
              {totalPlayers} / {match.capacity}
            </div>
            <div
              className={`mt-1 text-xs font-medium ${
                availableSlots > 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {availableSlots > 0 ? `${availableSlots} slots available` : "Match full"}
            </div>
          </div>
        </div>
      </div>

      {/* Players Joined */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Players Joined ({match.joins.length})</h2>
          <p className="text-sm text-slate-600">
            {totalPlayers} total spots (including friends)
          </p>
        </div>

        <div className="space-y-2">
          {match.joins.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
              No one has joined yet
            </p>
          ) : (
            match.joins.map((join) => (
              <div key={join.userId} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  {join.user.photoUrl && (
                    <Image
                      src={join.user.photoUrl}
                      alt={join.user.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium text-slate-900">{join.user.name}</div>
                    <div className="text-xs text-slate-500">{join.user.email}</div>
                  </div>
                </div>
                {join.extraSlots > 0 && (
                  <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                    +{join.extraSlots}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Comments ({match.comments.length})</h2>
          <p className="text-sm text-slate-600">Match notes and updates from the group.</p>
        </div>

        {match.comments.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
            No comments yet
          </p>
        ) : (
          <div className="space-y-3">
            {match.comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {comment.user.photoUrl && (
                      <Image
                        src={comment.user.photoUrl}
                        alt={comment.user.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div className="font-medium text-slate-900">{comment.user.name}</div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-700">{comment.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
