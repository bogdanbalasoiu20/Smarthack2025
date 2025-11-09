"use client";

import React, { useState, useEffect, useRef } from "react";

type Question = { id: string; text: string; options: string[]; timeLimit: number };

const OPTION_META = [
  { symbol: "▲", gradient: "from-rose-500/90 to-red-500/90" },
  { symbol: "◆", gradient: "from-sky-500/90 to-indigo-500/90" },
  { symbol: "■", gradient: "from-amber-500/90 to-orange-500/90" },
  { symbol: "●", gradient: "from-emerald-500/90 to-teal-500/90" },
];

interface QuestionViewProps {
  question: Question;
  onAnswer: (index: number, timeTaken: number) => void;
}

export default function QuestionView({ question, onAnswer }: QuestionViewProps) {
  const [hasAnswered, setHasAnswered] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);
  const startTimeRef = useRef<number>(Date.now());
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);
  const answerRef = useRef<number | null>(null);

  useEffect(() => {
    setHasAnswered(null);
    answerRef.current = null;
    setTimeLeft(question.timeLimit);
    startTimeRef.current = Date.now();

    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }

    if (question.timeLimit > 0) {
      timerIdRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIdRef.current as NodeJS.Timeout);
            timerIdRef.current = null;
            if (answerRef.current === null) {
              onAnswer(-1, question.timeLimit);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [question.id, question.timeLimit, onAnswer]);

  const handleButtonClick = (index: number) => {
    if (hasAnswered !== null || timeLeft === 0) return;

    const timeElapsed = (Date.now() - startTimeRef.current) / 1000;
    setHasAnswered(index);
    answerRef.current = index;
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    onAnswer(index, Math.round(timeElapsed));
  };

  const timerPercent =
    question.timeLimit > 0 ? Math.max(0, (timeLeft / question.timeLimit) * 100) : 0;

  return (
    <div className="relative space-y-8 text-center text-slate-50">
      <div className="flex flex-col items-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-slate-900/70 text-3xl font-bold shadow-xl shadow-slate-900/40">
          {timeLeft}
          <div className="absolute inset-1 rounded-full border border-white/10">
            <div
              className="absolute inset-1 rounded-full border border-white/0"
              style={{
                background: `conic-gradient(rgb(129 140 248 / 0.85) ${timerPercent}%, rgba(255,255,255,0.04) ${timerPercent}%)`,
                mask: "radial-gradient(circle, transparent 55%, black 56%)",
              }}
            />
          </div>
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.4em] text-slate-400">seconds left</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-2xl font-semibold leading-snug shadow-lg shadow-slate-900/40">
        {question.text}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {question.options.map((option, index) => {
          const meta = OPTION_META[index % OPTION_META.length];
          const selected = hasAnswered === index;
          const disabled = hasAnswered !== null || timeLeft === 0;

          return (
            <button
              key={`${question.id}-${option}`}
              onClick={() => handleButtonClick(index)}
              disabled={disabled}
              className={`group relative flex h-28 flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br px-4 text-lg font-semibold text-white shadow-lg shadow-slate-900/30 transition ${
                meta.gradient
              } ${
                selected
                  ? "ring-4 ring-white/70"
                  : disabled
                    ? "opacity-50 grayscale"
                    : "hover:scale-[1.02]"
              }`}
            >
              <span className="text-3xl font-black drop-shadow-md">{meta.symbol}</span>
              <span className="mt-2 text-base text-white/90">{option}</span>
            </button>
          );
        })}
      </div>

      {hasAnswered === null && timeLeft === 0 && (
        <p className="text-sm text-slate-300">Time’s up! Waiting for host…</p>
      )}
    </div>
  );
}
