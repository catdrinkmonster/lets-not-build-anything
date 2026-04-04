"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import {
  DEFAULT_IDEA,
  createBuildSession,
  getVariantCount,
  getVariantPreview,
  type BuildCard,
  type BuildSession,
  type CardStage,
} from "@/lib/build-nothing";

const DEV_STAGES: CardStage[] = ["initial", "middle", "final"];

export function ShipNothing() {
  const [draft, setDraft] = useState("");
  const [session, setSession] = useState<BuildSession | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [previewStage, setPreviewStage] = useState<CardStage>("initial");
  const [previewIndex, setPreviewIndex] = useState(0);

  const devMode = process.env.NODE_ENV === "development";
  const activePrompt = useMemo(() => draft.trim() || DEFAULT_IDEA, [draft]);
  const canSubmit = draft.trim().length > 0;
  const sequence = useMemo<BuildCard[]>(
    () => (session ? [session.initialCard, ...session.middleCards] : []),
    [session],
  );
  const completedSteps = sequence.slice(0, historyCount);
  const activeStep = sequence[activeStepIndex] ?? null;
  const previewCount = getVariantCount(previewStage);
  const previewCard = devMode ? getVariantPreview(previewStage, previewIndex) : null;

  useEffect(() => {
    if (!session) {
      return;
    }

    const timers: number[] = [];
    let elapsed = sequence[0]?.durationMs ?? 0;

    sequence.forEach((card, index) => {
      if (index === 0) {
        return;
      }

      timers.push(window.setTimeout(() => setActiveStepIndex(index), elapsed));
      timers.push(window.setTimeout(() => setHistoryCount(index), elapsed + 90));
      elapsed += card.durationMs;
    });

    timers.push(window.setTimeout(() => setIsComplete(true), elapsed));
    timers.push(window.setTimeout(() => setHistoryCount(sequence.length), elapsed + 90));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [sequence, session]);

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setActiveStepIndex(0);
    setHistoryCount(0);
    setIsComplete(false);
    setSession(createBuildSession(activePrompt));
  }

  function handleReset() {
    setDraft("");
    setSession(null);
    setActiveStepIndex(0);
    setHistoryCount(0);
    setIsComplete(false);
  }

  function handleComposerKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    handleSubmit();
  }

  function changePreviewIndex(direction: number) {
    setPreviewIndex((current) => (current + direction + previewCount) % previewCount);
  }

  function handlePreviewStageChange(stage: CardStage) {
    setPreviewStage(stage);
    setPreviewIndex(0);
  }

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.16, ease: "linear" }}
        className="relative mx-auto flex w-full max-w-3xl flex-col"
      >
        <AnimatePresence mode="wait" initial={false}>
          {!session ? (
            <motion.div
              key="idle-shell"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1, ease: "linear" }}
              className="mx-auto w-full max-w-3xl"
            >
              <div className="mb-5 px-2 text-center">
                <h1 className="terminal-text text-lg font-medium text-white/94 sm:text-xl">
                  What do you want to build today?
                </h1>
              </div>

              <div className="panel-strong terminal-accent-left relative overflow-hidden p-4">
                <div className="relative bg-[var(--field)]">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder="Describe your next big idea..."
                    rows={3}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="off"
                    className="terminal-text scrollbar-hidden h-[116px] w-full resize-none overflow-hidden bg-transparent px-5 py-4 pr-20 text-[15px] leading-7 text-white outline-none placeholder:text-white/22"
                  />

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    aria-label="Submit idea"
                    className="terminal-text absolute right-4 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-[var(--panel-soft)] text-white transition hover:bg-[var(--accent-soft)] active:scale-[0.98]"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {devMode && previewCard ? (
                <div className="mt-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2 px-1">
                    <span className="terminal-text text-[11px] uppercase tracking-[0.18em] text-white/34">
                      dev mode
                    </span>
                    {DEV_STAGES.map((stage) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => handlePreviewStageChange(stage)}
                        className="terminal-text bg-[var(--panel-soft)] px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-white/66"
                      >
                        {stage}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => changePreviewIndex(-1)}
                      className="terminal-text bg-[var(--panel-soft)] px-2 py-1 text-[11px] text-white/66"
                    >
                      prev
                    </button>
                    <span className="terminal-text text-[11px] text-white/38">
                      {previewIndex + 1}/{previewCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => changePreviewIndex(1)}
                      className="terminal-text bg-[var(--panel-soft)] px-2 py-1 text-[11px] text-white/66"
                    >
                      next
                    </button>
                  </div>

                  <div className="panel-strong terminal-accent-left px-5 py-5">
                    <p className="terminal-text text-[11px] uppercase tracking-[0.18em] text-white/34">
                      {previewCard.eyebrow}
                    </p>
                    <p className="mt-6 text-2xl font-medium tracking-[-0.04em] text-white sm:text-[2rem]">
                      {previewCard.title}
                    </p>
                    <p className="terminal-text mt-3 max-w-lg text-sm leading-7 text-white/46 sm:text-[15px]">
                      {previewCard.body}
                    </p>
                  </div>
                </div>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="stack-shell"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: "linear" }}
              className="mx-auto w-full max-w-3xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="terminal-text text-[11px] uppercase tracking-[0.18em] text-white/34">
                    Deliberate avoidance
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="terminal-text text-[11px] uppercase tracking-[0.16em] text-white/34 transition hover:text-white/72"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-2">
                  {completedSteps.map((card) => (
                    <div
                      key={card.id}
                      className="terminal-accent-left relative bg-[var(--panel-soft)] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="terminal-text truncate text-sm text-white/74">
                          {card.title}
                        </p>
                        <div className="h-2 w-2 bg-white/32" />
                      </div>
                    </div>
                  ))}

                  <div className="min-h-[214px]">
                    <div className="panel-strong terminal-accent-left relative px-5 py-5">
                      <AnimatePresence mode="wait" initial={false}>
                        {isComplete ? (
                          <motion.div
                            key={`result-${session.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.08, ease: "linear" }}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <p className="terminal-text text-[11px] uppercase tracking-[0.18em] text-white/34">
                                {session.finalCard.eyebrow}
                              </p>
                              <div className="h-2 w-2 bg-[var(--accent)]" />
                            </div>

                            <p className="mt-6 max-w-xl text-2xl font-medium tracking-[-0.04em] text-white sm:text-[2rem]">
                              {session.finalCard.title}
                            </p>
                            <p className="terminal-text mt-3 max-w-lg text-sm leading-7 text-white/46 sm:text-[15px]">
                              {session.finalCard.body}
                            </p>
                          </motion.div>
                        ) : activeStep ? (
                          <motion.div
                            key={`step-${activeStep.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.08, ease: "linear" }}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <p className="terminal-text text-[11px] uppercase tracking-[0.18em] text-white/34">
                                {activeStep.eyebrow}
                              </p>
                              <LoadingDots />
                            </div>

                            <p className="mt-6 text-2xl font-medium tracking-[-0.04em] text-white sm:text-[2rem]">
                              {activeStep.title}
                            </p>
                            <p className="terminal-text mt-3 max-w-lg text-sm leading-7 text-white/46 sm:text-[15px]">
                              {activeStep.body}
                            </p>

                            <div className="mt-7 h-1 overflow-hidden bg-white/8">
                              <motion.div
                                key={activeStep.id}
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{
                                  duration: Math.max(activeStep.durationMs / 1000, 0.75),
                                  ease: "linear",
                                }}
                                className="h-full bg-[var(--accent)]"
                              />
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
}

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{
            duration: 0.9,
            repeat: Number.POSITIVE_INFINITY,
            delay: dot * 0.12,
            ease: "easeInOut",
          }}
          className="h-1.5 w-1.5 bg-[var(--accent)]"
        />
      ))}
    </div>
  );
}
