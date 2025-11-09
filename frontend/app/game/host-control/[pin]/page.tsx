"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getStoredToken } from "@/lib/authToken";

type Player = {
  id: number;
  nickname: string;
  score: number;
  streak: number;
};

type Question = {
  id: number;
  text: string;
  time_limit: number;
  choices: Array<{
    id: number;
    text: string;
    order: number;
  }>;
};

type GameState = "question" | "score" | "finished";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";

export default function HostControlPage() {
  const router = useRouter();
  const params = useParams();
  const pin = params.pin as string;

  const [gameState, setGameState] = useState<GameState>("question");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

      if (data.type === "question") {
        const question = data.payload.question;
        const timeLimit = data.payload.time_limit;

        setCurrentQuestion(question);
        setTimeLeft(timeLimit);
        setAnsweredCount(0);
        setGameState("question");

        if (timerRef.current) clearInterval(timerRef.current);
        let remaining = timeLimit;
        timerRef.current = setInterval(() => {
          remaining -= 1;
          setTimeLeft(Math.max(remaining, 0));
          if (remaining <= 0 && timerRef.current) {
            clearInterval(timerRef.current);
          }
        }, 1000);
      } else if (data.type === "answered_count") {
        setAnsweredCount(data.payload.count);
      } else if (data.type === "lobby_update") {
        setPlayers(data.payload.players);
      } else if (data.type === "score_update") {
        setPlayers(data.payload.players);
        setGameState("score");
        if (timerRef.current) clearInterval(timerRef.current);
      } else if (data.type === "end") {
        setPlayers(data.payload.players);
        setGameState("finished");
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ws.close();
    };
  }, [pin, router]);

  const handleNext = () => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "host_next",
          payload: {},
        })
      );
    }
  };

  const connectionBadge = (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold tracking-[0.2em] ${
        isConnected
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          : "border-rose-500/40 bg-rose-500/10 text-rose-200"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-rose-400"} animate-pulse`} />
      {isConnected ? "Live" : "Disconnected"}
    </span>
  );

  const renderQuestionView = () => {
    if (!currentQuestion) {
      return (
        <div className="app-page flex items-center justify-center">
          <div className="glass-card px-8 py-6 text-slate-300">Waiting for the next question…</div>
        </div>
      );
    }

    const progress =
      currentQuestion.time_limit > 0
        ? ((currentQuestion.time_limit - timeLeft) / currentQuestion.time_limit) * 100
        : 0;
    const answerRate =
      players.length > 0 ? Math.round((answeredCount / Math.max(players.length, 1)) * 100) : 0;

    return (
      <div className="game-shell">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="app-pill">Host control</p>
            <h1 className="text-4xl font-semibold text-white">Question in play</h1>
            <p className="text-slate-300">PIN {pin}</p>
          </div>
          {connectionBadge}
        </header>

        <div className="game-grid wide-two">
          <div className="quiz-stat">
            <h3>Time remaining</h3>
            <p
              className={`text-6xl font-semibold ${
                timeLeft > 10 ? "text-white" : timeLeft > 5 ? "text-yellow-300" : "text-rose-300 animate-pulse"
              }`}
            >
              {timeLeft}s
            </p>
            <div className="quiz-progress mt-4">
              <span style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
          </div>

          <div className="quiz-stat">
            <h3>Responses</h3>
            <p className="text-5xl font-semibold text-white">{answeredCount}</p>
            <p className="text-sm text-slate-400">out of {players.length || "0"}</p>
            <div className="quiz-progress mt-4">
              <span style={{ width: `${answerRate}%` }} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current question</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">{currentQuestion.text}</h2>
          </div>
          <div className="quiz-answers two">
            {currentQuestion.choices
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((choice, index) => (
                <div key={choice.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Option {index + 1}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{choice.text}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <button
            onClick={handleNext}
            className="app-button w-full justify-center sm:w-auto"
            disabled={!isConnected}
          >
            Show results
          </button>
        </div>
      </div>
    );
  };

  const renderScoreView = () => {
    const topFive = players.slice(0, 5);
    return (
      <div className="game-shell">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="app-pill">Host control</p>
            <h1 className="text-4xl font-semibold text-white">Leaderboard</h1>
            <p className="text-slate-300">Review the standings before moving on.</p>
          </div>
          {connectionBadge}
        </header>

        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Top players</h2>
            <p className="text-sm text-slate-400">{players.length} total</p>
          </div>
          <div className="space-y-4">
            {topFive.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-semibold text-white">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{player.nickname}</p>
                    {player.streak > 0 && (
                      <p className="text-xs text-amber-300">🔥 {player.streak} answer streak</p>
                    )}
                  </div>
                </div>
                <p className="text-2xl font-semibold text-white">{player.score}</p>
              </div>
            ))}
          </div>
        </div>

        {players.length > 5 && (
          <div className="glass-panel p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Full list</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {players.map((player, index) => (
                <div key={player.id} className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">#{index + 1}</span>
                    <span className="font-semibold">{player.nickname}</span>
                    <span>{player.score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
          <button onClick={handleNext} className="app-button w-full justify-center sm:w-auto">
            Next question
          </button>
        </div>
      </div>
    );
  };

  const renderFinishedView = () => {
    const topThree = players.slice(0, 3);
    return (
      <div className="game-shell">
        <header className="text-center space-y-2">
          <p className="app-pill mx-auto">Host control</p>
          <h1 className="text-4xl font-semibold text-white">Game finished</h1>
          <p className="text-slate-300">Celebrate the podium and wrap the session.</p>
        </header>

        {topThree.length === 3 && (
          <div className="glass-card p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {topThree.map((player, index) => (
                <div key={player.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Place {index + 1}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{player.nickname}</p>
                  <p className="text-3xl font-bold text-white">{player.score}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Final standings</p>
          <div className="mt-4 space-y-3">
            {players.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                <span className="text-slate-400">#{index + 1}</span>
                <span className="text-white font-semibold">{player.nickname}</span>
                <span className="text-white font-semibold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button onClick={() => router.push("/game/host")} className="app-button w-full justify-center sm:w-auto">
            Back to games
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app-page">
      {gameState === "question" && renderQuestionView()}
      {gameState === "score" && renderScoreView()}
      {gameState === "finished" && renderFinishedView()}
      {!["question", "score", "finished"].includes(gameState) && (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-slate-400">Synchronizing…</div>
        </div>
      )}
    </div>
  );
}
