"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import {
  DEV_STAGES,
  DONATION_LINK,
  getActiveHeader,
  getPreviewHeader,
} from "@/components/ship-nothing/headers";
import {
  ROTATION_STATE_STORAGE_KEY,
  loadRotationState,
} from "@/components/ship-nothing/storage";
import {
  BuildCardView,
  FinalCardView,
  getCardShellClassName,
  getCardShellStyle,
} from "@/components/ship-nothing/views";
import {
  DEFAULT_IDEA,
  DEFAULT_CARD_DURATION_MS,
  advanceRotationState,
  createBuildSession,
  type BuildCard,
  type BuildSession,
  type CardStage,
  type FinalCard,
  type VariantRotationState,
  getVariantCount,
  getVariantPreview,
} from "@/lib/build-nothing";

export function ShipNothing() {
  const [draft, setDraft] = useState("");
  const [session, setSession] = useState<BuildSession | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [previewStage, setPreviewStage] = useState<CardStage>("initial");
  const [previewCycle, setPreviewCycle] = useState(0);
  const [resolvedActionStepIds, setResolvedActionStepIds] = useState<string[]>([]);
  const [rotationState, setRotationState] = useState<VariantRotationState>(
    loadRotationState,
  );

  const devMode = process.env.NODE_ENV === "development";
  const activePrompt = useMemo(() => draft.trim() || DEFAULT_IDEA, [draft]);
  const canSubmit = draft.trim().length > 0;
  const sequence = useMemo<BuildCard[]>(
    () => (session ? [session.initialCard, ...session.middleCards] : []),
    [session],
  );
  const completedSteps = sequence.slice(0, historyCount);
  const activeStep = sequence[activeStepIndex] ?? null;
  const activeStepRequiresAction = activeStep?.interaction?.type === "fake-captcha";
  const previewCount = getVariantCount(previewStage);
  const previewCards = useMemo(
    () =>
      devMode
        ? Array.from({ length: previewCount }, (_, index) =>
            getVariantPreview(previewStage, index),
          )
        : [],
    [devMode, previewCount, previewStage],
  );
  const activeHeader = getActiveHeader(activeStepIndex, sequence.length);

  useEffect(() => {
    window.localStorage.setItem(
      ROTATION_STATE_STORAGE_KEY,
      JSON.stringify(rotationState),
    );
  }, [rotationState]);

  useEffect(() => {
    if (!devMode) {
      return;
    }

    const timer = window.setInterval(() => {
      setPreviewCycle((current) => current + 1);
    }, DEFAULT_CARD_DURATION_MS);

    return () => window.clearInterval(timer);
  }, [devMode]);

  useEffect(() => {
    if (!session || !activeStep || isComplete) {
      return;
    }

    if (
      activeStepRequiresAction &&
      !resolvedActionStepIds.includes(activeStep.id)
    ) {
      return;
    }

    let historyTimer = 0;
    const advanceDelay = activeStepRequiresAction ? 180 : activeStep.durationMs;
    const advanceTimer = window.setTimeout(() => {
      if (activeStepIndex === sequence.length - 1) {
        setIsComplete(true);
        historyTimer = window.setTimeout(
          () => setHistoryCount(sequence.length),
          90,
        );
        return;
      }

      setActiveStepIndex(activeStepIndex + 1);
      historyTimer = window.setTimeout(
        () => setHistoryCount(activeStepIndex + 1),
        90,
      );
    }, advanceDelay);

    return () => {
      window.clearTimeout(advanceTimer);
      window.clearTimeout(historyTimer);
    };
  }, [
    activeStep,
    activeStepIndex,
    activeStepRequiresAction,
    isComplete,
    resolvedActionStepIds,
    sequence.length,
    session,
  ]);

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    const nextSession = createBuildSession(activePrompt, rotationState);

    setActiveStepIndex(0);
    setHistoryCount(0);
    setIsComplete(false);
    setResolvedActionStepIds([]);
    setRotationState((current) => advanceRotationState(current, nextSession));
    setSession(nextSession);
  }

  function handleReset() {
    setDraft("");
    setSession(null);
    setActiveStepIndex(0);
    setHistoryCount(0);
    setIsComplete(false);
    setResolvedActionStepIds([]);
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

  function handlePreviewStageChange(stage: CardStage) {
    setPreviewStage(stage);
  }

  function handleActionStepResolved(stepId: string) {
    setResolvedActionStepIds((current) =>
      current.includes(stepId) ? current : [...current, stepId],
    );
  }

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="absolute right-4 top-4 z-20 flex items-center gap-4 sm:right-6 sm:top-6">
        <a
          href={DONATION_LINK}
          target="_blank"
          rel="noreferrer"
          className="terminal-text text-[11px] uppercase tracking-[0.16em] text-white/34 transition hover:text-white/72"
        >
          Donate
        </a>
        <a
          href="https://github.com/catdrinkmonster/build-nothing"
          target="_blank"
          rel="noreferrer"
          className="terminal-text text-[11px] uppercase tracking-[0.16em] text-white/34 transition hover:text-white/72"
        >
          GitHub
        </a>
      </div>
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
                  What don&apos;t you want to build today?
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

              {devMode && previewCards.length > 0 ? (
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
                    <span className="terminal-text text-[11px] text-white/38">
                      {previewCount} variants
                    </span>
                  </div>

                  <div className="space-y-3">
                    {previewCards.map((previewCard, index) => (
                      <div
                        key={`${previewStage}-${previewCard.id}-${previewCycle}`}
                        className={getCardShellClassName()}
                        style={getCardShellStyle(previewCard.interaction?.type)}
                      >
                        {previewStage === "final" ? (
                          <FinalCardView
                            card={previewCard as FinalCard}
                            playToken={`preview-${previewStage}-${previewCard.id}-${previewCycle}`}
                          />
                        ) : (
                          <BuildCardView
                            card={previewCard as BuildCard}
                            header={getPreviewHeader(
                              previewStage,
                              index,
                              getVariantCount("middle"),
                            )}
                            playToken={`preview-${previewStage}-${previewCard.id}-${previewCycle}`}
                            autoLoopCaptcha
                          />
                        )}
                      </div>
                    ))}
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
                    <div
                      className={`${getCardShellClassName()} relative`}
                      style={getCardShellStyle(activeStep?.interaction?.type)}
                    >
                      <AnimatePresence mode="wait">
                        {isComplete ? (
                          <motion.div
                            key={`result-${session.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.08, ease: "linear" }}
                          >
                            <FinalCardView
                              card={session.finalCard}
                              playToken={`final-${session.finalCard.id}`}
                            />
                          </motion.div>
                        ) : activeStep ? (
                          <motion.div
                            key={`step-${activeStep.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.08, ease: "linear" }}
                          >
                            <BuildCardView
                              card={activeStep}
                              header={activeHeader}
                              playToken={activeStep.id}
                              onActionResolved={() => handleActionStepResolved(activeStep.id)}
                            />
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>

                  {isComplete ? (
                    <div className="flex justify-center px-1 pt-5">
                      <a
                        href={DONATION_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="terminal-text text-xs tracking-[0.06em] text-white/42 transition hover:text-white/72"
                      >
                        made you smile? consider a small donation :)
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
}
