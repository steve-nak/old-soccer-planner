"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";
import { authInitialState } from "@/components/auth/auth-state";

type LoginFormProps = {
  redirectTo?: string;
};

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    authInitialState,
  );

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="mb-8 space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">
          Secure access
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Login
        </h2>
        <p className="text-sm text-slate-600">
          Sign in to manage your soccer groups and matches.
        </p>
      </div>

      {state.error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      <form action={formAction} className="space-y-5">
        {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Signing in..." : "Login"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-emerald-700 hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
