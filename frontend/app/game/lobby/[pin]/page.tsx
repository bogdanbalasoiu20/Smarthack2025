"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import QRCode from "qrcode";

import { getStoredToken } from "@/lib/authToken";

type Player = {
  id: number;
  nickname: string;
  score: number;
  streak: number;
};

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";

export default function GameLobbyPage() {
  const router = useRouter();
  const params = useParams();
  const pin = params.pin as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [joinUrl, setJoinUrl] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const baseUrl = window.location.origin;
    setJoinUrl(`${baseUrl}/game/join`);
    QRCode.toDataURL(`${baseUrl}/game/join?pin=${pin}`, { width: 220, margin: 1 }).then(setQrCodeUrl);
  }, [pin]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    const ws = new WebSocket(`${WS_BASE_URL}/ws/game/${pin}/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "lobby_update") {
        setPlayers(data.payload.players);
      } else if (data.type === "question") {
        router.push(`/game/host-control/${pin}`);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [pin, router]);

  const startGame = () => {
    if (wsRef.current && isConnected && players.length > 0) {
      wsRef.current.send(
        JSON.stringify({
          type: "host_start",
          payload: {},
        })
      );
    }
  };

  const connectionPill = (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold tracking-[0.2em] ${
        isConnected
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          : "border-rose-500/40 bg-rose-500/10 text-rose-200"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-rose-400"} animate-pulse`} />
      {isConnected ? "Connected" : "Connecting"}
    </span>
  );

  return (
    <div className="app-page">
      <div className="game-shell">
        <header className="space-y-3">
          <p className="app-pill">Session lobby</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold text-white">Lobby for PIN {pin}</h1>
              <p className="text-slate-300">Students join from {joinUrl || "your join page"} with the PIN above.</p>
            </div>
            {connectionPill}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <section className="glass-card p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Players in lobby</p>
                <p className="text-3xl font-semibold text-white">{players.length}</p>
              </div>
              <button
                onClick={() => router.push("/game/host")}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-white/30"
              >
                Exit lobby
              </button>
            </div>

            {players.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 py-16 text-center text-slate-400">
                Waiting for players to join…
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {players.map((player, index) => (
                  <div key={player.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                      <span>Player</span>
                      <span>#{index + 1}</span>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-white truncate">{player.nickname}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-400">
                {players.length === 0
                  ? "Need at least one player before launching."
                  : "Ready when you are—everyone sees the first question instantly."}
              </div>
              <button
                onClick={startGame}
                disabled={!isConnected || players.length === 0}
                className={`app-button w-full justify-center sm:w-auto ${
                  !isConnected || players.length === 0 ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                Start session
              </button>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="glass-card p-6 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Game PIN</p>
              <p className="mt-4 font-mono text-5xl font-semibold tracking-[0.4em] text-white">{pin}</p>
            </div>

            <div className="glass-panel p-6 text-center">
              <p className="text-sm font-semibold tracking-[0.35em] text-slate-400">Scan to join</p>
              <div className="mt-4 flex justify-center">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Join QR" className="rounded-2xl bg-white/90 p-3" />
                ) : (
                  <div className="h-[220px] w-[220px] animate-pulse rounded-2xl bg-white/5" />
                )}
              </div>
              <p className="mt-3 text-xs text-slate-400">Camera + PIN, that is it.</p>
            </div>

            <div className="glass-panel space-y-4 p-6 text-sm text-slate-300">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Share link</p>
                <p className="mt-1 font-semibold text-white">{joinUrl || "—"}</p>
              </div>
              <ul className="space-y-2 text-slate-400">
                <li>• Ask students to keep the tab open; they will auto-sync.</li>
                <li>• You can always return here without interrupting players.</li>
                <li>• When ready, press “Start session” to push the first question.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
