"use client";

import React from "react";

type Player = { id: string; name: string; score?: number };

interface LobbyProps {
  players: Player[];
  name: string;
  code: string;
  onNameChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onJoin: () => void;
  joinAttempted?: boolean;
}

export default function Lobby({
  players,
  name,
  code,
  onNameChange,
  onCodeChange,
  onJoin,
  joinAttempted,
}: LobbyProps) {
  const canJoin = name.trim().length > 1 && code.trim().length > 0;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Player name
          </span>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Choose an epic nickname"
            maxLength={15}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-slate-50 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
            Game PIN
          </span>
          <input
            value={code}
            onChange={(e) => onCodeChange(e.target.value.trim())}
            placeholder="Ex: 492013"
            maxLength={6}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.4em] text-slate-50 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none"
          />
        </label>
      </div>

      <button
        onClick={onJoin}
        disabled={!canJoin}
        className="app-button w-full justify-center text-base disabled:opacity-50"
      >
        {joinAttempted ? "Connecting..." : "Join the arena"}
      </button>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Players</p>
            <p className="text-2xl font-semibold">{players.length}</p>
          </div>
          <span className="rounded-full border border-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
            waiting room
          </span>
        </div>
        <div className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
          {players.length === 0 ? (
            <div className="flex min-h-[120px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-400">
              Waiting for players to join…
            </div>
          ) : (
            players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100"
              >
                <span className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-base font-bold">
                    {index + 1}
                  </span>
                  {player.name}
                </span>
                <span className="text-xs text-slate-400">ready</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
