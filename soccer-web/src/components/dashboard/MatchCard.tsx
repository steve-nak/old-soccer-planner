import type { ReactNode } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowUpRight, CalendarDays, MapPin, ShieldAlert, TimerReset, Users } from "lucide-react";

import { getMatchCapacityState, getMatchTimingState, type MatchCapacityState, type MatchTimingState } from "@/lib/match-status";
import type { DashboardMatch } from "@/services/match-service";

type MatchCardProps = {
  match: DashboardMatch;
};

function getStateStyles(state: MatchTimingState | MatchCapacityState) {
  switch (state) {
    case "upcoming":
    case "under capacity":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "current":
    case "full capacity":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "past":
    case "over capacity":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function StateBadge({
  label,
  icon,
  state,
  tone = "default",
}: {
  label: string;
  icon: ReactNode;
  state?: MatchTimingState | MatchCapacityState;
  tone?: "default" | "danger";
}) {
  const toneStyles =
    tone === "danger"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : state
        ? getStateStyles(state)
        : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${toneStyles}`}
    >
      {icon}
      {label}
    </span>
  );
}

export function MatchCard({ match }: MatchCardProps) {
  const now = new Date();
  const timingState = getMatchTimingState(new Date(match.startsAt), now);
  const totalPlayers = match.joins.reduce((count, join) => count + 1 + join.extraSlots, 0);
  const capacityState = getMatchCapacityState(totalPlayers, match.capacity);

  return (
    <Link href={`/match/${match.id}`} className="group block">
      <article className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_72px_rgba(15,23,42,0.12)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-sky-500 to-cyan-400" />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
              {match.group.title}
            </p>
            <h3 className="text-xl font-semibold text-slate-950">{match.location}</h3>
            {match.group.description ? (
              <p className="text-sm leading-6 text-slate-600">{match.group.description}</p>
            ) : null}
          </div>
          <ArrowUpRight className="mt-1 h-5 w-5 text-slate-400 transition group-hover:text-emerald-600" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <CalendarDays className="h-4 w-4" />
              Date
            </div>
            <div className="mt-2 text-base font-semibold text-slate-900">
              {format(new Date(match.startsAt), "PPP p")}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {formatDistanceToNow(new Date(match.startsAt), { addSuffix: true })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <TimerReset className="h-4 w-4" />
              State
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <StateBadge label={timingState} icon={<ShieldAlert className="h-3.5 w-3.5" />} state={timingState} />
              {match.isCanceled ? (
                <StateBadge
                  label="canceled"
                  icon={<ShieldAlert className="h-3.5 w-3.5" />}
                  tone="danger"
                />
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <Users className="h-4 w-4" />
              Capacity
            </div>
            <div className="mt-2">
              <StateBadge
                label={capacityState}
                icon={<MapPin className="h-3.5 w-3.5" />}
                state={capacityState}
              />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
