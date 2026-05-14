"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinMatchAction, leaveMatchAction, updateExtraSlotsAction } from "@/app/actions/match";
import { Check, Share2, Minus, Plus, LogIn, LogOut } from "lucide-react";

export interface MatchActionsProps {
  matchId: number;
  isJoined: boolean;
  userExtraSlots?: number;
  isMember: boolean;
  isActive: boolean;
  matchState: "upcoming" | "current" | "past";
  isCanceled: boolean;
  remainingSlots: number;
}

export function MatchActions({
  matchId,
  isJoined,
  userExtraSlots = 0,
  isMember,
  isActive,
  matchState,
  isCanceled,
  remainingSlots,
}: MatchActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [extraSlots, setExtraSlots] = useState(userExtraSlots);
  const [joined, setJoined] = useState(isJoined);
  const [error, setError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const handleJoin = async () => {
    setLoading(true);
    setError(null);

    const result = await joinMatchAction(matchId);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setJoined(true);
    setExtraSlots(0);
    router.refresh();

    setLoading(false);
  };

  const handleLeave = async () => {
    setLoading(true);
    setError(null);

    const result = await leaveMatchAction(matchId);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setJoined(false);
    setExtraSlots(0);
    router.refresh();
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
    router.refresh();
    setLoading(false);
  };

  const handleShareLink = async () => {
    setError(null);
    setShareMessage(null);

    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage("Match link copied");
    } catch (copyError) {
      console.error("[match-actions] handleShareLink failed", copyError);
      setError("Unable to copy the match link");
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">Match actions</div>
          <p className="text-xs text-slate-500">Share the link or manage your spot.</p>
        </div>

        <button
          type="button"
          onClick={handleShareLink}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <Share2 className="h-4 w-4" />
          Share match link
        </button>
      </div>

      {shareMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <span className="inline-flex items-center gap-2">
            <Check className="h-4 w-4" />
            {shareMessage}
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {!isMember ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm leading-6 text-amber-800">You must be a member of the group to join matches.</p>
        </div>
      ) : !isActive ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm leading-6 text-slate-600">
            This match is {isCanceled ? "canceled" : `marked as ${matchState}`}, so joining and leaving are disabled.
          </p>
        </div>
      ) : !joined ? (
        <button
          type="button"
          onClick={handleJoin}
          disabled={loading || remainingSlots === 0}
          className="w-full rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          <span className="flex items-center justify-center gap-2">
            <LogIn className="h-5 w-5" />
            {loading ? "Joining..." : remainingSlots === 0 ? "Match Full" : "Join Match"}
          </span>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 text-sm font-medium text-slate-900">Reserve spots for friends</div>
            <p className="mb-3 text-xs text-slate-500">
              You have {remainingSlots} remaining seat{remainingSlots === 1 ? "" : "s"} on the match.
            </p>
            <div className="flex items-center justify-between">
              <button
                type="button"
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
                type="button"
                onClick={() => handleUpdateSlots(extraSlots + 1)}
                disabled={loading || remainingSlots === 0}
                className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <button
            type="button"
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
