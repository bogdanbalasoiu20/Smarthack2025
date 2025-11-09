"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { WS_BASE_URL } from "@/lib/api";
import Lobby from "@/components/game/Lobby";
import QuestionView from "@/components/game/QuestionView";
import Scoreboard from "@/components/game/Scoreboard";

type Player = { id: string; name: string; score?: number };
type Question = { id: string; text: string; options: string[]; timeLimit: number } | null;

export default function GamePage() {
  const [stage, setStage] = useState<"lobby" | "question" | "scoreboard">("lobby");
  const [players, setPlayers] = useState<Player[]>([]);
  const [question, setQuestion] = useState<Question>(null);
  const [code, setCode] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [joinAttempted, setJoinAttempted] = useState(false);

  const wsUrl = useMemo(() => {
    if (typeof window === "undefined" || !code) {
      return "";
    }
    return `${WS_BASE_URL}/ws/game/${code}/`;
  }, [code]);

  const { isConnected, sendMessage } = useWebSocket(wsUrl, {
    onMessage: (data) => {
      if (!data || !data.type) return;

      switch (data.type) {
        case "lobby_update":
          setPlayers(data.payload?.players || []);
          setStage("lobby");
          break;
        case "question":
          setQuestion(data.payload?.question || null);
          setStage("question");
          break;
        case "score_update":
        case "end":
          setPlayers(data.payload?.players || players);
          setStage("scoreboard");
          break;
        default:
          console.debug("Unhandled ws message type", data.type);
      }
    },
  });

  const handleJoin = useCallback(() => {
    if (!name.trim() || !code.trim()) return;

    setJoinAttempted(true);
    sendMessage({ type: "join", payload: { name: name.trim() } });
  }, [name, code, sendMessage]);

  const handleAnswer = useCallback(
    (answerIndex: number, timeTaken: number) => {
      if (!question) return;
      sendMessage({
        type: "answer",
        payload: {
          answer: answerIndex,
          time_taken: timeTaken,
        },
      });
    },
    [sendMessage, question]
  );

  return (
    <div className="app-page flex flex-col items-center gap-8 text-slate-50">
      <header className="text-center space-y-3">
        <p className="app-pill">Live quiz mode</p>
        <h1 className="text-4xl font-semibold sm:text-5xl">Smarthack Party Kahoot</h1>
        <p className="text-sm text-slate-300 sm:text-base">
          Join with the PIN, pick your shape, and race against the timer. Same neon studio vibe,
          but tuned for kahoot-style energy.
        </p>
        <div
          className={`mx-auto flex max-w-xs items-center justify-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold tracking-wide ${
            isConnected
              ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
              : "border-rose-400/50 bg-rose-500/10 text-rose-200"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-400 animate-pulse"
            }`}
          />
          {isConnected ? "Connected to host" : "Connecting..."}
        </div>
      </header>

      <div className="w-full max-w-5xl">
        <div className="glass-card relative overflow-hidden p-6 sm:p-10">
          <div className="absolute inset-y-0 right-0 w-1/4 translate-x-1/2 bg-gradient-to-b from-indigo-500/10 to-purple-500/0 blur-3xl md:block hidden" />
          <div className="relative z-10">
            {stage === "lobby" && (
              <Lobby
                players={players}
                name={name}
                code={code}
                onNameChange={setName}
                onCodeChange={setCode}
                onJoin={handleJoin}
                joinAttempted={joinAttempted}
              />
            )}

            {stage === "question" && question && (
              <QuestionView question={question} onAnswer={handleAnswer} />
            )}

            {stage === "scoreboard" && <Scoreboard players={players} onBackToLobby={() => setStage("lobby")} />}
          </div>
        </div>
      </div>
    </div>
  );
}
