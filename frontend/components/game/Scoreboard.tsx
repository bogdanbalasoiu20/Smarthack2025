"use client";

import React from "react";

type Player = { id: string; name: string; score?: number };

interface ScoreboardProps {
  players: Player[];
  onBackToLobby?: () => void;
}

const RANK_STYLES: Record<number, string> = {
  1: "from-yellow-400/90 via-amber-500/80 to-yellow-600/80 text-slate-900",
  2: "from-slate-200/80 via-slate-100/70 to-slate-300/60 text-slate-900",
  3: "from-amber-700/80 via-orange-600/70 to-amber-800/60 text-white",
};

export default function Scoreboard({ players, onBackToLobby }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="space-y-6 text-center text-slate-100">
      <div>
        <p className="app-pill mx-auto">Round results</p>
        <h2 className="mt-4 text-3xl font-semibold">Scoreboard</h2>
        <p className="text-sm text-slate-300">Fastest answers bubble to the top.</p>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-slate-400">
          Waiting for host to send the first scores…
        </div>
      ) : (
        <ol className="space-y-4">
          {sorted.map((player, index) => {
            const rank = index + 1;
            const gradient =
              RANK_STYLES[rank] || "from-indigo-500/30 via-slate-800/60 to-slate-900/60 text-slate-100";

            return (
              <li
                key={player.id}
                className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/5 bg-gradient-to-r px-5 py-4 shadow-lg shadow-slate-900/40 ${gradient}`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black">{rank}</span>
                  <span className="text-lg font-semibold">{player.name}</span>
                </div>
                <span className="text-xl font-black">{player.score ?? 0} pts</span>
              </li>
            );
          })}
        </ol>
      )}

      {onBackToLobby && (
        <button onClick={onBackToLobby} className="app-button mx-auto block">
          Back to lobby
        </button>
      )}
    </div>
  );
}
