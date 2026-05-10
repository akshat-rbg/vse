"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { MailIcon } from "@/app/components/auth/icons";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/home`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo },
      );
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setInfo(
        "If an account exists for that email, you will receive a reset link shortly.",
      );
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error ? (
        <div
          className="auth-error-enter auth-error-shake mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] font-medium leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          role="alert"
          style={{
            background: "rgba(251,113,133,0.10)",
            borderColor: "rgba(251,113,133,0.22)",
            color: "#fca5a5",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 20px rgba(251,113,133,0.08)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0 text-rose-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      ) : null}
      {info ? (
        <div
          className="auth-error-enter mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-[13px] font-medium leading-relaxed"
          style={{
            background: "rgba(52,211,153,0.10)",
            borderColor: "rgba(52,211,153,0.22)",
            color: "#6ee7b7",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 20px rgba(52,211,153,0.08)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0 text-emerald-400"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <span>{info}</span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        <label
          htmlFor="forgot-email"
          className="mb-2 block text-[11px] font-semibold tracking-[0.18em] text-[#8b86a8]"
        >
          EMAIL ADDRESS
        </label>
        <div className="mb-8 rounded-2xl bg-[#12121f] p-1.5 ring-1 ring-white/[0.06]">
          <div className="flex items-center gap-3 rounded-xl bg-[#2a2836] px-3.5 py-3">
            <MailIcon className="shrink-0 text-violet-300/45" />
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="demo@email.com"
              className="w-full min-w-0 border-0 bg-transparent text-sm text-white outline-none placeholder:text-[#6d6a80]"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl border border-white/15 bg-[#12121c] py-4 text-center text-base font-bold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/25 hover:bg-[#181824] disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send link"}
        </button>
      </form>

      <p className="mt-10 text-center text-sm text-[#9d98b8]">
        <Link
          href="/login"
          className="font-semibold text-[#9d72ff] hover:text-[#b898ff]"
        >
          Back to sign in
        </Link>
      </p>
    </>
  );
}
