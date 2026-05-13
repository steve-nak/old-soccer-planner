"use client";

import { useState } from "react";
import { joinMatchAction, leaveMatchAction, updateExtraSlotsAction } from "@/app/actions/match";
import { Minus, Plus, LogIn, LogOut } from "lucide-react";

export interface MatchActionsProps {
  matchId: number;
  isJoined: boolean;
  userExtraSlots?: number;
  isMember: boolean;
  isLoading?: boolean;
}

export function MatchActions({
  matchId,
  isJoined,
  userExtraSlots = 0,
  isMember,
}: MatchActionsProps) {
  const [loading, setLoading] = useState(false);
  const [extraSlots, setExtraSlots] = useState(userExtraSlots);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setLoading(true);
    setError(null);

    const result = await joinMatchAction(matchId);

    if (result.error) {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleLeave = async () => {
    setLoading(true);
    setError(null);

    const result = await leaveMatchAction(matchId);

    if (result.error) {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleUpdateSlots = async (newSlots: number) => {
    setLoading(true);
    setError(null);

    const result = await updateExtraSlotsAction(matchId, newSlots);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setExtraSlots(newSlots);
    setLoading(false);
  };

  if (!isMember) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-center text-sm text-amber-800">
          You must be a member of the group to join matches
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!isJoined ? (
        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          <span className="flex items-center justify-center gap-2">
            <LogIn className="h-5 w-5" />
            {loading ? "Joining..." : "Join Match"}
          </span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-sm font-medium text-slate-900">
              Reserve spots for friends
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleUpdateSlots(Math.max(0, extraSlots - 1))}
                disabled={loading || extraSlots === 0}
                className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <Minus className="h-5 w-5" />
              </button>

              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{extraSlots}</div>
                <div className="text-xs text-slate-500">extra spots</div>
              </div>

              <button
                onClick={() => handleUpdateSlots(extraSlots + 1)}
                disabled={loading}
                className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            onClick={handleLeave}
            disabled={loading}
            className="w-full rounded-lg border border-red-200 bg-red-50 px-6 py-3 font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <span className="flex items-center justify-center gap-2">
              <LogOut className="h-5 w-5" />
              {loading ? "Leaving..." : "Leave Match"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
