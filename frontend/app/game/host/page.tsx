"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import { API_BASE_URL } from "@/lib/api";
import { getStoredToken } from "@/lib/authToken";

type Game = {
  id: number;
  title: string;
  description?: string;
  base_points: number;
  questions?: any[];
  created_at: string;
};

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch (error) {
    return "";
  }
};

export default function GameHostPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    fetchGames();
  }, []);

  const fetchGames = async () => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/games/`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch games");
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setGames(data);
      } else if (Array.isArray(data?.results)) {
        setGames(data.results);
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const startGameSession = async (gameId: number) => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}/create_session/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const session = await response.json();
      const joinUrl =
        typeof window !== "undefined" ? `${window.location.origin}/game/join` : "your portal";

      await Swal.fire({
        background: "#0f172a",
        color: "#e2e8f0",
        title: "Session ready",
        html: `
          <div style="display:flex;flex-direction:column;gap:16px;align-items:center;">
            <p style="letter-spacing:0.4em;text-transform:uppercase;font-size:12px;color:#a5b4fc;margin:0;">PIN</p>
            <div style="font-size:64px;font-weight:800;letter-spacing:0.35em;font-family:'Geist Mono','Courier New',monospace;color:#fff;">${session.pin}</div>
            <p style="font-size:14px;color:#94a3b8;margin-top:8px;">Share the PIN or send students to <strong>${joinUrl}</strong></p>
          </div>
        `,
        confirmButtonText: "Open lobby",
        confirmButtonColor: "#6366f1",
        showCancelButton: true,
        cancelButtonText: "Copy PIN",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push(`/game/lobby/${session.pin}`);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigator.clipboard.writeText(session.pin);
          Swal.fire({
            toast: true,
            position: "bottom",
            timer: 2500,
            showConfirmButton: false,
            background: "#0f172a",
            color: "#e2e8f0",
            title: `PIN ${session.pin} copied`,
          });
        }
      });
    } catch (error) {
      Swal.fire({
        title: "Unable to create session",
        text: "Please try again in a moment.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        background: "#0f172a",
        color: "#e2e8f0",
      });
    }
  };

  if (loading) {
    return (
      <div className="app-page flex items-center justify-center">
        <div className="glass-card px-10 py-8 text-center text-slate-300">Loading your quizzes…</div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <div className="game-shell">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <p className="app-pill">Live quiz studio</p>
              <div>
                <h1 className="text-4xl font-semibold text-white">Host a live session</h1>
                <p className="text-slate-300">Pick a deck, launch a PIN, and guide everyone through it.</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <button onClick={() => router.push("/dashboard/create")} className="app-button">
                Create new game
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-white/30"
              >
                Back to dashboard
              </button>
            </div>
          </div>
        </header>

        {games.length === 0 ? (
          <div className="glass-card px-6 py-12 text-center">
            <p className="text-xl font-semibold text-white">No quizzes yet</p>
            <p className="mt-2 text-slate-300">Build your first deck to unlock the live experience.</p>
            <button onClick={() => router.push("/dashboard/create")} className="app-button mt-6 justify-center">
              Start designing
            </button>
          </div>
        ) : (
          <div className="game-grid two">
            {games.map((game) => {
              const questionCount = game.questions?.length ?? 0;
              return (
                <article key={game.id} className="glass-panel flex flex-col gap-6 p-6">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Quiz set</p>
                    <h3 className="text-2xl font-semibold text-white">{game.title}</h3>
                    {game.description && (
                      <p className="text-sm text-slate-400 line-clamp-3">{game.description}</p>
                    )}
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                    <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <dt className="text-xs uppercase tracking-[0.25em] text-slate-400">Questions</dt>
                      <dd className="text-xl font-semibold text-white">{questionCount}</dd>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <dt className="text-xs uppercase tracking-[0.25em] text-slate-400">Base score</dt>
                      <dd className="text-xl font-semibold text-white">{game.base_points}</dd>
                    </div>
                    <div className="col-span-2 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                      <dt className="text-xs uppercase tracking-[0.25em] text-slate-400">Updated</dt>
                      <dd className="text-white">{formatDate(game.created_at) || "–"}</dd>
                    </div>
                  </dl>

                  <div className="flex flex-col gap-3">
                    <button onClick={() => startGameSession(game.id)} className="app-button w-full justify-center">
                      Launch live session
                    </button>
                    <div className="flex gap-2 text-sm">
                      <button
                        onClick={() => router.push(`/dashboard/create?edit=${game.id}`)}
                        className="flex-1 rounded-2xl border border-white/10 px-4 py-2 font-semibold text-slate-200 transition-colors hover:border-white/40"
                      >
                        Edit deck
                      </button>
                      <button
                        onClick={async () => {
                          const confirmed = await Swal.fire({
                            title: "Delete this game?",
                            text: `The quiz \"${game.title}\" will be removed.`,
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#ef4444",
                            background: "#0f172a",
                            color: "#e2e8f0",
                          });

                          if (confirmed.isConfirmed) {
                            try {
                              await fetch(`${API_BASE_URL}/games/${game.id}/`, {
                                method: "DELETE",
                                headers: {
                                  Authorization: `Token ${getStoredToken()}`,
                                },
                              });
                              fetchGames();
                            } catch (error) {
                              Swal.fire({
                                title: "Delete failed",
                                text: "Please retry in a moment.",
                                icon: "error",
                                background: "#0f172a",
                                color: "#e2e8f0",
                              });
                            }
                          }
                        }}
                        className="flex-1 rounded-2xl border border-red-500/20 px-4 py-2 font-semibold text-red-300 transition-colors hover:border-red-400/60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
