"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  BENCHMARK_CHART_ROWS,
  BENCHMARK_ROW_FILL_DURATION_S,
  getBenchmarkRowDelay,
} from "@/lib/benchmark-chart";

export function BenchmarkChart({ playToken }: { playToken: string }) {
  const isPlaying = useDeferredPlay(playToken);

  return (
    <div className="mt-5 space-y-3">
      {BENCHMARK_CHART_ROWS.map((row, index) => (
        <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-4">
          <div className="space-y-1">
            <div className="terminal-text text-xs text-white/44">{row.label}</div>
            <div className="h-2 bg-white/8">
              <motion.div
                initial={false}
                animate={{ scaleX: isPlaying ? 1 : 0 }}
                transition={
                  isPlaying
                    ? {
                        duration: BENCHMARK_ROW_FILL_DURATION_S,
                        delay: getBenchmarkRowDelay(index, BENCHMARK_CHART_ROWS.length),
                        ease: "easeOut",
                      }
                    : { duration: 0 }
                }
                style={{ width: `${row.value}%`, originX: 0 }}
                className={`h-full ${row.tone}`}
              />
            </div>
          </div>
          <div className="terminal-text text-right text-xs text-white/44">{row.value}</div>
        </div>
      ))}
    </div>
  );
}

export function FaviconBloat({ playToken }: { playToken: string }) {
  const isPlaying = useDeferredPlay(playToken);

  return (
    <div className="mt-5 flex w-full justify-center overflow-hidden">
      <motion.div
        initial={false}
        animate={{ width: isPlaying ? "100%" : "14%" }}
        transition={isPlaying ? { duration: 3.2, ease: "easeOut" } : { duration: 0 }}
        className="max-w-full"
      >
        <Image
          src="/favicon-96x96.avif"
          alt=""
          aria-hidden="true"
          unoptimized
          width={96}
          height={96}
          sizes="(min-width: 1024px) 720px, 100vw"
          className="block h-auto w-full object-contain opacity-95"
        />
      </motion.div>
    </div>
  );
}

export function MeditationTimer({ durationMs }: { durationMs: number }) {
  const [remainingMs, setRemainingMs] = useState(durationMs);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const nextRemainingMs = Math.max(durationMs - (Date.now() - startedAt), 0);
      setRemainingMs(nextRemainingMs);
    }, 100);

    return () => window.clearInterval(interval);
  }, [durationMs]);

  return (
    <div className="mt-5 flex min-h-[168px] w-full items-center justify-center">
      <div className="space-y-2 text-center">
        <p className="terminal-text text-[11px] uppercase tracking-[0.16em] text-white/34">
          breath work
        </p>
        <p className="terminal-text text-3xl text-white/88 sm:text-4xl">
          {formatCountdown(remainingMs)}
        </p>
      </div>
    </div>
  );
}

export function LoadingDots({ playToken }: { playToken: string }) {
  const isPlaying = useDeferredPlay(playToken);

  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          initial={false}
          animate={isPlaying ? { opacity: [0.25, 1, 0.25] } : { opacity: 0.25 }}
          transition={
            isPlaying
              ? {
                  duration: 0.9,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: dot * 0.12,
                  ease: "easeInOut",
                }
              : { duration: 0 }
          }
          className="h-1.5 w-1.5 bg-[var(--accent)]"
        />
      ))}
    </div>
  );
}

export function LoadingBar({
  playToken,
  duration,
}: {
  playToken: string;
  duration: number;
}) {
  const isPlaying = useDeferredPlay(playToken);

  return (
    <div className="mt-7 h-1 overflow-hidden bg-white/8">
      <motion.div
        initial={false}
        animate={{ scaleX: isPlaying ? 1 : 0 }}
        transition={isPlaying ? { duration, ease: "linear" } : { duration: 0 }}
        style={{ originX: 0 }}
        className="h-full w-full bg-[var(--accent)]"
      />
    </div>
  );
}

function formatCountdown(durationMs: number) {
  const totalTenths = Math.ceil(durationMs / 100);
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}.${tenths}`;
}

function useDeferredPlay(playToken: string) {
  const [armedToken, setArmedToken] = useState<string | null>(null);

  useEffect(() => {
    let firstFrame = 0;
    let secondFrame = 0;

    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setArmedToken(playToken);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [playToken]);

  return armedToken === playToken;
}
