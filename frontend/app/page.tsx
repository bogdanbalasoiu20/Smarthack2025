"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Loading creative studio…");

  useEffect(() => {
    let isMounted = true;
    fetch("http://127.0.0.1:8000/api/hello/")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) {
          return;
        }
        setMessage(data?.message ?? "Platform ready.");
      })
      .catch(() => {
        if (isMounted) {
          setMessage("Platform ready.");
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="app-page space-y-10 text-slate-50">
      <section className="glass-card relative overflow-hidden p-10">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-b from-indigo-500/20 to-purple-500/0 blur-3xl md:block" />
        <p className="app-pill">SmartHack 2025 Studio</p>
        <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
          Unified canvas for designing, sharing, and teaching with confidence.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          The same cinematic glassmorphic aesthetic from the presentation editor now wraps the
          entire product suite. Manage classes, launch AI-powered decks, and review feedback
          without ever leaving the vibe.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/dashboard" className="app-button">
            Enter dashboard
          </Link>
          <Link
            href="/presentations"
            className="inline-flex items-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/30 hover:bg-white/5"
          >
            View presentations
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-semibold">Live system status</h2>
          <p className="mt-2 text-sm text-slate-300">{message}</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-200">
            <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.7)]" />
              AI pipelines &amp; notifications active
            </li>
            <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.7)]" />
              Presentation editor synced with new theming
            </li>
            <li className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.7)]" />
              Management suite now mirrors the same UI language
            </li>
          </ul>
        </div>
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-semibold">What’s new</h2>
          <div className="mt-4 space-y-4">
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Visual refresh</p>
              <p className="mt-2 text-base text-slate-100">
                Dashboard, auth, and settings experiences inherit the same neon glass surfaces from
                the presentation workspace.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Components</p>
              <p className="mt-2 text-base text-slate-100">
                Shared input, button, card, and table treatments guarantee predictable contrast
                ratios regardless of the feature team.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
