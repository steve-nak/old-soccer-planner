import { redirect } from "next/navigation";

import { MatchCard } from "@/components/dashboard/MatchCard";
import { getCurrentUser } from "@/services/auth-service";
import { getUserDashboardMatches } from "@/services/match-service";
import { getMatchTimingState } from "@/lib/match-status";

export const metadata = {
  title: "Dashboard - Soccer Planner",
  description: "Your group matches, active games, and match archive",
};

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const matches = await getUserDashboardMatches(currentUser.id);
  const now = new Date();

  const activeMatches = matches.filter((match) => {
    const timingState = getMatchTimingState(new Date(match.startsAt), now);
    return !match.isCanceled && timingState !== "past";
  });

  const archiveMatches = matches.filter((match) => {
    const timingState = getMatchTimingState(new Date(match.startsAt), now);
    return match.isCanceled || timingState === "past";
  });

  return (
    <section className="flex flex-1 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_28%),radial-gradient(circle_at_right,_rgba(14,165,233,0.12),_transparent_26%),linear-gradient(180deg,_rgba(248,250,252,0.92),_rgba(226,232,240,0.98))]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="border-b border-slate-200/80 px-6 py-8 sm:px-8 lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-700">
              User Dashboard
            </p>
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                  Matches from your groups
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                  Track active matches, check the current state at a glance, and review the archive when you need the full history.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
                {currentUser.name}
              </div>
            </div>
          </div>

          <div className="space-y-12 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
            <section className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">Active Matches</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Upcoming and current matches that are open to join or unjoin.
                  </p>
                </div>
                <div className="text-sm font-medium text-slate-500">
                  {activeMatches.length} match{activeMatches.length === 1 ? "" : "es"}
                </div>
              </div>

              {activeMatches.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {activeMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No active matches right now"
                  description="When your groups schedule an upcoming match or start a current one, it will appear here first."
                />
              )}
            </section>

            <section className="space-y-5 border-t border-slate-200/80 pt-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">Archive Matches</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Past matches and canceled matches from your groups.
                  </p>
                </div>
                <div className="text-sm font-medium text-slate-500">
                  {archiveMatches.length} match{archiveMatches.length === 1 ? "" : "es"}
                </div>
              </div>

              {archiveMatches.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {archiveMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nothing in the archive yet"
                  description="Past and canceled matches from your groups will show up here automatically."
                />
              )}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
