"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

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

type GameState = "lobby" | "question" | "score" | "finished";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";

const ANSWER_VARIANTS = [
  "from-rose-500/20 via-rose-500/10 to-transparent border-rose-400/40",
  "from-indigo-500/20 via-indigo-500/10 to-transparent border-indigo-400/40",
  "from-amber-400/20 via-amber-400/10 to-transparent border-amber-300/40",
  "from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-400/40",
];

export default function GamePlayPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const pin = params.pin as string;
  const nickname = searchParams.get("nickname") || "";

  const [gameState, setGameState] = useState<GameState>("lobby");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [myStreak, setMyStreak] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTime = useRef<number>(0);

  useEffect(() => {
    if (!nickname) {
      router.push(`/game/join?pin=${pin}`);
      return;
    }

    const ws = new WebSocket(`${WS_BASE_URL}/ws/game/${pin}/`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(
        JSON.stringify({
          type: "join",
          payload: { name: nickname },
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "lobby_update") {
        setPlayers(data.payload.players);
        setGameState("lobby");
      } else if (data.type === "question") {
        const question = data.payload.question;
        const timeLimit = data.payload.time_limit;
        setCurrentQuestion(question);
        setTimeLeft(timeLimit);
        setSelectedAnswer(null);
        setHasAnswered(false);
        setGameState("question");
        questionStartTime.current = Date.now();

        if (timerRef.current) clearInterval(timerRef.current);
        let remaining = timeLimit;
        timerRef.current = setInterval(() => {
          remaining -= 1;
          setTimeLeft(Math.max(remaining, 0));
          if (remaining <= 0 && timerRef.current) {
            clearInterval(timerRef.current);
          }
        }, 1000);
      } else if (data.type === "score_update") {
        setPlayers(data.payload.players);
        setGameState("score");
        if (timerRef.current) clearInterval(timerRef.current);
        const me = data.payload.players.find((player: Player) => player.nickname === nickname);
        if (me) {
          setMyScore(me.score);
          setMyStreak(me.streak);
        }
      } else if (data.type === "end") {
        setPlayers(data.payload.players);
        setGameState("finished");
        if (timerRef.current) clearInterval(timerRef.current);
        const me = data.payload.players.find((player: Player) => player.nickname === nickname);
        if (me) {
          setMyScore(me.score);
          setMyStreak(me.streak);
        }
      }
    };

    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      ws.close();
    };
  }, [pin, nickname, router]);

  const handleAnswerSelect = (choiceIndex: number) => {
    if (hasAnswered || !wsRef.current || !currentQuestion) return;
    setSelectedAnswer(choiceIndex);
    setHasAnswered(true);

    const timeTaken = (Date.now() - questionStartTime.current) / 1000;
    wsRef.current.send(
      JSON.stringify({
        type: "answer",
        payload: {
          answer: choiceIndex,
          time_taken: timeTaken,
        },
      })
    );
  };

  const statusPill = (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold tracking-[0.25em] ${
        isConnected
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          : "border-rose-500/40 bg-rose-500/10 text-rose-200"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-rose-400"} animate-pulse`} />
      {isConnected ? "Connected" : "Reconnecting"}
    </span>
  );

  if (gameState === "lobby") {
    return (
      <div className="app-page">
        <div className="game-shell items-center">
          <header className="text-center space-y-3">
            <p className="app-pill mx-auto">Waiting room</p>
            <h1 className="text-4xl font-semibold text-white">Hang tight, {nickname}</h1>
            <p className="text-slate-300">The host will launch the first question any moment.</p>
            {statusPill}
          </header>

          <div className="glass-card w-full max-w-3xl p-8 text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Joined as</p>
            <p className="text-4xl font-semibold text-white">{nickname}</p>
            <p className="text-slate-400">PIN {pin}</p>
          </div>

          <div className="glass-panel w-full max-w-4xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Players</p>
              <p className="text-slate-300">{players.length}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`rounded-2xl border px-4 py-3 text-center text-sm font-semibold ${
                    player.nickname === nickname
                      ? "border-indigo-400/50 bg-indigo-500/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-200"
                  }`}
                >
                  {player.nickname}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "question" && currentQuestion) {
    return (
      <div className="app-page">
        <div className="game-shell">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="app-pill">Question live</p>
              <h1 className="text-3xl font-semibold text-white">{nickname}, pick an option</h1>
            </div>
            {statusPill}
          </header>

          <div className="quiz-stat">
            <h3>Time</h3>
            <p
              className={`text-6xl font-semibold ${
                timeLeft > 10 ? "text-white" : timeLeft > 5 ? "text-amber-300" : "text-rose-300 animate-pulse"
              }`}
            >
              {timeLeft}s
            </p>
            <div className="quiz-progress mt-4">
              <span
                style={{
                  width:
                    currentQuestion.time_limit > 0
                      ? `${((currentQuestion.time_limit - timeLeft) / currentQuestion.time_limit) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Question</p>
            <h2 className="text-3xl font-semibold text-white">{currentQuestion.text}</h2>
          </div>

          <div className="quiz-answers two">
            {currentQuestion.choices
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((choice, index) => {
                const isSelected = selectedAnswer === index;
                const variant = ANSWER_VARIANTS[index % ANSWER_VARIANTS.length];
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={hasAnswered}
                    className={`rounded-2xl border bg-gradient-to-br p-5 text-left text-lg font-semibold text-white transition-transform ${
                      variant
                    } ${hasAnswered && !isSelected ? "opacity-40" : ""} ${
                      !hasAnswered ? "hover:scale-[1.02]" : ""
                    } ${isSelected ? "ring-2 ring-offset-0 ring-white/40" : ""}`}
                  >
                    {choice.text}
                  </button>
                );
              })}
          </div>

          {hasAnswered && (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-200">
              Answer submitted. Waiting for everyone else…
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameState === "score") {
    const myRank = players.findIndex((player) => player.nickname === nickname) + 1;
    const topFive = players.slice(0, 5);

    return (
      <div className="app-page">
        <div className="game-shell">
          <header className="text-center space-y-2">
            <p className="app-pill mx-auto">Leaderboard</p>
            <h1 className="text-4xl font-semibold text-white">Nice work, {nickname}</h1>
            <p className="text-slate-300">Next round begins when the host moves forward.</p>
          </header>

          <div className="glass-card p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Rank</p>
                <p className="mt-2 text-4xl font-semibold text-white">{myRank || "—"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Score</p>
                <p className="mt-2 text-4xl font-semibold text-white">{myScore}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Streak</p>
                <p className="mt-2 text-4xl font-semibold text-white">{myStreak}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Top players</p>
            <div className="space-y-3">
              {topFive.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                    player.nickname === nickname ? "border-indigo-400/50 bg-indigo-500/10" : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 text-white">
                    <span className="text-slate-400">#{index + 1}</span>
                    <span className="font-semibold">{player.nickname}</span>
                  </div>
                  <span className="text-xl font-semibold text-white">{player.score}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-400">Host will move to the next question shortly.</p>
        </div>
      </div>
    );
  }

  if (gameState === "finished") {
    const topThree = players.slice(0, 3);
    const myRank = players.findIndex((player) => player.nickname === nickname) + 1;

    return (
      <div className="app-page">
        <div className="game-shell items-center">
          <header className="text-center space-y-2">
            <p className="app-pill mx-auto">Results</p>
            <h1 className="text-4xl font-semibold text-white">Game over</h1>
            <p className="text-slate-300">You finished #{myRank || "—"} with {myScore} pts.</p>
          </header>

          {topThree.length === 3 && (
            <div className="glass-card w-full max-w-4xl p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {topThree.map((player, index) => (
                  <div key={player.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Place {index + 1}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{player.nickname}</p>
                    <p className="text-3xl font-bold text-white">{player.score}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-panel w-full max-w-4xl p-6 space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Final standings</p>
            <div className="space-y-2">
              {players.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                  <span className="text-slate-400">#{index + 1}</span>
                  <span className="font-semibold">{player.nickname}</span>
                  <span>{player.score}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => router.push("/game/join")} className="app-button w-full justify-center sm:w-auto">
            Play again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page flex min-h-[70vh] items-center justify-center">
      <div className="text-slate-400">Loading…</div>
    </div>
  );
}
