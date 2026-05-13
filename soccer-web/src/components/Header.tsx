import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/services/auth-service";

export default async function Header() {
  const currentUser = await getCurrentUser();

  return (
    <header className="border-b border-white/10 bg-slate-950/90 text-white shadow-[0_10px_30px_rgba(15,23,42,0.18)] backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-white transition hover:text-emerald-200 md:text-2xl"
        >
          <span className="rounded-full bg-white/10 px-2 py-1 text-sm">⚽</span>
          Soccer Planner
        </Link>

        <div className="flex items-center gap-3 text-sm font-medium">
          <Link href="/" className="rounded-full px-3 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white">
            Home
          </Link>

          {currentUser ? (
            <>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-semibold text-emerald-100">
                  {currentUser.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-semibold text-white">{currentUser.name}</div>
                  <div className="text-xs text-slate-300">{currentUser.email}</div>
                </div>
              </div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-emerald-400/30 bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
