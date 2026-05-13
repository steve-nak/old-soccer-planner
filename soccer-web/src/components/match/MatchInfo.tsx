import { MatchWithDetails } from "@/services/match-service";
import { formatDistanceToNow, format } from "date-fns";
import { MapPin, Calendar, Users, AlertCircle } from "lucide-react";

export interface MatchInfoProps {
  match: MatchWithDetails;
}

export function MatchInfo({ match }: MatchInfoProps) {
  const totalPlayers = match.joins.reduce((acc, join) => acc + 1 + join.extraSlots, 0);
  const availableSlots = match.capacity - totalPlayers;

  return (
    <div className="space-y-8">
      {match.isCanceled && (
        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm font-medium text-red-800">This match has been canceled</p>
        </div>
      )}

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
                    <img
                      src={join.user.photoUrl}
                      alt={join.user.name}
                      className="h-10 w-10 rounded-full object-cover"
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

      {/* Comments */}
      {match.comments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Comments ({match.comments.length})</h2>
          <div className="space-y-3">
            {match.comments.map((comment) => (
              <div key={comment.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {comment.user.photoUrl && (
                      <img
                        src={comment.user.photoUrl}
                        alt={comment.user.name}
                        className="h-8 w-8 rounded-full object-cover"
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
        </div>
      )}
    </div>
  );
}
