import Link from "next/link";

import { getCurrentUser } from "@/services/auth-service";

const featureCards = [
  {
    icon: "👥",
    title: "Create groups",
    description: "Build and manage your soccer groups with friends.",
  },
  {
    icon: "🎯",
    title: "Schedule matches",
    description: "Organize matches and track player availability.",
  },
  {
    icon: "📊",
    title: "Track stats",
    description: "Keep an eye on attendance, comments, and match history.",
  },
];

export default async function Home() {
  const currentUser = await getCurrentUser();

  return (
    <section className="flex flex-1 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_32%),radial-gradient(circle_at_right,_rgba(14,165,233,0.14),_transparent_28%),linear-gradient(180deg,_rgba(248,250,252,0.88),_rgba(226,232,240,0.95))]">
      <div className="flex w-full flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16 xl:px-16">
        <div className="w-full rounded-[2rem] border border-white/60 bg-white/35 px-5 py-10 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="space-y-10">
            <div className="space-y-5">
              <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                {currentUser ? `Welcome back, ${currentUser.name}` : "Simple match planning for your squad"}
              </div>
              <div className="max-w-4xl space-y-4">
                <h1 className="text-5xl font-bold tracking-tight text-slate-950 md:text-6xl lg:text-7xl">
                  Soccer planning that stays out of the way.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
                  Organize groups, create matches, and keep everyone on the same page with a focused, mobile-friendly workflow.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:gap-6">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
                >
                  <div className="mb-4 text-3xl">{card.icon}</div>
                  <h2 className="mb-2 text-lg font-semibold text-slate-900">
                    {card.title}
                  </h2>
                  <p className="text-sm leading-6 text-slate-600">
                    {card.description}
                  </p>
                </article>
              ))}
            </div>

            {currentUser ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-5 text-sm leading-7 text-emerald-950 shadow-[0_20px_60px_rgba(16,185,129,0.08)]">
                Welcome, {currentUser.email}
              </div>
            ) : (
              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/90 px-6 py-3 font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
