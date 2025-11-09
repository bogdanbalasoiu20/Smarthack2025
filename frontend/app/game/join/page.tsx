"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GameJoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPin = searchParams.get("pin") || "";

  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState(initialPin);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (initialPin) {
      setPin(initialPin);
    }
  }, [initialPin]);

  const handleJoin = () => {
    if (!nickname.trim() || !pin.trim()) return;
    setJoining(true);
    router.push(`/game/play/${pin}?nickname=${encodeURIComponent(nickname.trim())}`);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && nickname.trim() && pin.trim()) {
      handleJoin();
    }
  };

  const disabled = !nickname.trim() || !pin.trim() || joining;

  return (
    <div className="app-page">
      <div className="game-shell items-center">
        <header className="text-center space-y-3">
          <p className="app-pill">Join live quiz</p>
          <h1 className="text-4xl font-semibold text-white">Jump into the session</h1>
          <p className="text-slate-300">Enter the PIN from the host and pick a nickname that classmates will spot.</p>
        </header>

        <div className="glass-card w-full max-w-3xl p-8 sm:p-12 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Game PIN</span>
              <input
                value={pin}
                onChange={(event) => setPin(event.target.value.trim())}
                onKeyDown={handleKeyPress}
                maxLength={6}
                placeholder="123456"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center text-3xl font-semibold tracking-[0.35em] text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
            </label>

            <label className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Nickname</span>
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                onKeyDown={handleKeyPress}
                maxLength={20}
                placeholder="Pick something fun"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-lg text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              />
              <p className="text-xs text-slate-500">{nickname.length}/20 characters</p>
            </label>
          </div>

          <button
            onClick={handleJoin}
            disabled={disabled}
            className={`app-button w-full justify-center text-base ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
          >
            {joining ? "Connecting…" : "Join game"}
          </button>
        </div>

        <div className="glass-panel w-full max-w-3xl p-6 text-sm text-slate-300 space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Quick tips</p>
          <ul className="space-y-1">
            <li>• Keep the tab active, the host controls pacing.</li>
            <li>• Fast answers = more points. Trust your instincts.</li>
            <li>• Stable Wi‑Fi helps you keep streaks alive.</li>
          </ul>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-semibold text-slate-400 underline-offset-4 transition-colors hover:text-white"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}
