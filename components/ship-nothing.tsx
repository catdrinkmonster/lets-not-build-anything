"use client";

import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

import { AutoDino } from "@/components/auto-dino";
import { TenorEmbed } from "@/components/tenor-embed";
import {
  DEFAULT_IDEA,
  EMPTY_SEEN_VARIANT_HISTORY,
  createBuildSession,
  getVariantCount,
  getVariantPreview,
  isLikelyAnthropicApiKey,
  markSeenVariants,
  type BuildCard,
  type BuildCardInteraction,
  type FinalCardInteraction,
  type BuildSession,
  type CardStage,
  type SeenVariantHistory,
} from "@/lib/build-nothing";

const DEV_STAGES: CardStage[] = ["initial", "middle", "final"];
const SEEN_VARIANTS_STORAGE_KEY = "lets-not-build-anything-seen-variants";

export function ShipNothing() {
  const [draft, setDraft] = useState("");
  const [session, setSession] = useState<BuildSession | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [previewStage, setPreviewStage] = useState<CardStage>("initial");
  const [resolvedActionStepIds, setResolvedActionStepIds] = useState<string[]>([]);
  const [seenHistory, setSeenHistory] = useState<SeenVariantHistory>(
    loadSeenVariantHistory,
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
  const finalInteraction = isComplete ? session?.finalCard.interaction : undefined;

  useEffect(() => {
    window.localStorage.setItem(
      SEEN_VARIANTS_STORAGE_KEY,
      JSON.stringify(seenHistory),
    );
  }, [seenHistory]);

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

    const nextSession = createBuildSession(activePrompt, seenHistory);

    setActiveStepIndex(0);
    setHistoryCount(0);
    setIsComplete(false);
    setResolvedActionStepIds([]);
    setSeenHistory((current) => markSeenVariants(current, nextSession));
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
      <a
        href="https://github.com/catdrinkmonster/lets-not-build-anything"
        target="_blank"
        rel="noreferrer"
        className="terminal-text absolute right-4 top-4 z-20 text-[11px] uppercase tracking-[0.16em] text-white/34 transition hover:text-white/72 sm:right-6 sm:top-6"
      >
        GitHub
      </a>
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
                        key={`${previewStage}-${previewCard.id}`}
                        className={getCardShellClassName()}
                        style={getCardShellStyle(previewCard.interaction?.type)}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="terminal-text text-[11px] uppercase tracking-[0.18em] text-white/34">
                            {getPreviewHeader(previewStage, index, getVariantCount("middle"))}
                          </p>
                          {previewStage === "final" ? (
                            <div className="h-2 w-2 bg-[var(--accent)]" />
                          ) : previewCard.interaction?.type === "fake-captcha" ? null : (
                            <LoadingDots />
                          )}
                        </div>

                        {previewCard.interaction?.type === "ugly-gradients" ? (
                          <GradientTitle>{previewCard.title}</GradientTitle>
                        ) : (
                          <p
                            className={getCardTitleClassName(previewCard.interaction?.type)}
                          >
                            {previewCard.title}
                          </p>
                        )}
                        {previewCard.body ? (
                          previewCard.interaction?.type === "ugly-gradients" ? (
                            <GradientBody>{previewCard.body}</GradientBody>
                          ) : (
                            <p
                              className={getCardBodyClassName(previewCard.interaction?.type)}
                            >
                              {previewCard.body}
                            </p>
                          )
                        ) : null}

                        {previewCard.interaction?.type === "dino-runner" ? <AutoDino /> : null}
                        {previewCard.interaction?.type === "meditation-timer" ? (
                          <MeditationTimer
                            key={`preview-meditation-${previewCard.id}`}
                            durationMs={previewCard.durationMs ?? 7600}
                          />
                        ) : null}
                        {previewCard.interaction?.type === "fake-diff" ? (
                          <FakeAgentsDiff />
                        ) : null}
                        {previewCard.interaction?.type === "tenor-embed" ? (
                          <TenorEmbed
                            embed={previewCard.interaction.embed}
                            maxWidth={previewCard.interaction.maxWidth}
                          />
                        ) : null}
                        {previewCard.interaction?.type === "fake-captcha" ? (
                          <FakeCaptcha key={`preview-captcha-${previewCard.id}`} />
                        ) : null}

                        {previewStage === "final" &&
                        previewCard.interaction?.type === "anthropic-key" ? (
                          <AnthropicKeyTrap
                            key={`preview-trap-${previewCard.id}`}
                            placeholder={previewCard.interaction.placeholder}
                            invalidMessage={previewCard.interaction.invalidMessage}
                            successMessage={previewCard.interaction.successMessage}
                          />
                        ) : previewStage === "final" &&
                          previewCard.interaction?.type === "dodge-code-link" ? (
                          <DodgingCodeLinkTrap
                            key={`preview-dodge-${previewCard.id}`}
                            buttonLabel={previewCard.interaction.buttonLabel}
                            successMessage={previewCard.interaction.successMessage}
                          />
                        ) : null}

                        {previewStage === "final" ||
                        previewCard.interaction?.type === "fake-captcha" ? null : (
                          <LoadingBar
                            loadingKey={`preview-${previewStage}-${previewCard.id}`}
                            duration={1.8}
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
                            <div className="flex items-center justify-between gap-4">
                              <p className="terminal-text text-[11px] uppercase tracking-[0.18em] text-white/34">
                                final result
                              </p>
                              <div className="h-2 w-2 bg-[var(--accent)]" />
                            </div>

                            <p className="mt-6 max-w-xl whitespace-pre-line text-2xl font-medium tracking-[-0.04em] text-white sm:text-[2rem]">
                              {session.finalCard.title}
                            </p>
                            {session.finalCard.body ? (
                              <p className="terminal-text mt-3 max-w-lg text-sm leading-7 text-white/46 sm:text-[15px]">
                                {session.finalCard.body}
                              </p>
                            ) : null}

                            {finalInteraction?.type === "anthropic-key" ? (
                              <AnthropicKeyTrap
                                key={`final-trap-${session.finalCard.id}`}
                                placeholder={finalInteraction.placeholder}
                                invalidMessage={finalInteraction.invalidMessage}
                                successMessage={finalInteraction.successMessage}
                              />
                            ) : finalInteraction?.type === "dodge-code-link" ? (
                              <DodgingCodeLinkTrap
                                key={`final-dodge-${session.finalCard.id}`}
                                buttonLabel={finalInteraction.buttonLabel}
                                successMessage={finalInteraction.successMessage}
                              />
                            ) : null}
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
                                {activeHeader}
                              </p>
                              {activeStep.interaction?.type === "fake-captcha" ? null : (
                                <LoadingDots />
                              )}
                            </div>

                            {activeStep.interaction?.type === "ugly-gradients" ? (
                              <GradientTitle>{activeStep.title}</GradientTitle>
                            ) : (
                              <p className={getCardTitleClassName(activeStep.interaction?.type)}>
                                {activeStep.title}
                              </p>
                            )}
                            {activeStep.body ? (
                              activeStep.interaction?.type === "ugly-gradients" ? (
                                <GradientBody>{activeStep.body}</GradientBody>
                              ) : (
                                <p className={getCardBodyClassName(activeStep.interaction?.type)}>
                                  {activeStep.body}
                                </p>
                              )
                            ) : null}

                            {activeStep.interaction?.type === "dino-runner" ? (
                              <AutoDino />
                            ) : null}
                            {activeStep.interaction?.type === "meditation-timer" ? (
                              <MeditationTimer
                                key={`active-meditation-${activeStep.id}`}
                                durationMs={activeStep.durationMs}
                              />
                            ) : null}
                            {activeStep.interaction?.type === "fake-diff" ? (
                              <FakeAgentsDiff />
                            ) : null}
                            {activeStep.interaction?.type === "tenor-embed" ? (
                              <TenorEmbed
                                embed={activeStep.interaction.embed}
                                maxWidth={activeStep.interaction.maxWidth}
                              />
                            ) : null}
                            {activeStep.interaction?.type === "fake-captcha" ? (
                              <FakeCaptcha
                                key={`active-captcha-${activeStep.id}`}
                                onVerified={() => handleActionStepResolved(activeStep.id)}
                              />
                            ) : null}

                            {activeStep.interaction?.type === "fake-captcha" ? null : (
                              <LoadingBar
                                loadingKey={activeStep.id}
                                duration={Math.max(activeStep.durationMs / 1000, 0.75)}
                              />
                            )}
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

function getCardShellClassName() {
  return "panel-strong terminal-accent-left px-5 py-5";
}

function loadSeenVariantHistory(): SeenVariantHistory {
  if (typeof window === "undefined") {
    return EMPTY_SEEN_VARIANT_HISTORY;
  }

  const storedHistory = window.localStorage.getItem(SEEN_VARIANTS_STORAGE_KEY);

  if (!storedHistory) {
    return EMPTY_SEEN_VARIANT_HISTORY;
  }

  try {
    const parsed = JSON.parse(storedHistory) as Partial<SeenVariantHistory>;

    return {
      initial: Array.isArray(parsed.initial) ? parsed.initial : [],
      middle: Array.isArray(parsed.middle) ? parsed.middle : [],
      final: Array.isArray(parsed.final) ? parsed.final : [],
    };
  } catch {
    window.localStorage.removeItem(SEEN_VARIANTS_STORAGE_KEY);
    return EMPTY_SEEN_VARIANT_HISTORY;
  }
}

function getCardShellStyle(
  interactionType?: BuildCardInteraction["type"] | FinalCardInteraction["type"],
): CSSProperties | undefined {
  if (interactionType !== "ugly-gradients") {
    return undefined;
  }

  return {
    backgroundImage:
      "radial-gradient(circle at 0% 0%, rgba(255, 84, 131, 0.35), transparent 30%), linear-gradient(135deg, #281046 0%, #3d1761 24%, #174f8b 50%, #0b8f7b 76%, #21351b 100%)",
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",
  };
}

function getCardTitleClassName(
  interactionType?: BuildCardInteraction["type"] | FinalCardInteraction["type"],
) {
  if (interactionType === "ugly-gradients") {
    return "mt-6 whitespace-pre-line text-2xl font-medium tracking-[-0.04em] sm:text-[2rem] ai-slop-title";
  }

  return "mt-6 whitespace-pre-line text-2xl font-medium tracking-[-0.04em] text-white sm:text-[2rem]";
}

function getCardBodyClassName(
  interactionType?: BuildCardInteraction["type"] | FinalCardInteraction["type"],
) {
  if (interactionType === "ugly-gradients") {
    return "terminal-text mt-3 max-w-lg text-sm leading-7 sm:text-[15px] ai-slop-body";
  }

  return "terminal-text mt-3 max-w-lg text-sm leading-7 text-white/46 sm:text-[15px]";
}

function GradientTitle({ children }: { children: string }) {
  return (
    <p className="mt-6 whitespace-pre-line text-2xl font-medium tracking-[-0.04em] sm:text-[2rem]">
      <span style={UGLY_TITLE_STYLE}>{children}</span>
    </p>
  );
}

function GradientBody({ children }: { children: string }) {
  return (
    <p className="terminal-text mt-3 max-w-lg text-sm leading-7 sm:text-[15px]">
      <span style={UGLY_BODY_STYLE}>{children}</span>
    </p>
  );
}

const UGLY_TITLE_STYLE: CSSProperties = {
  display: "inline-block",
  backgroundImage:
    "linear-gradient(90deg, #ff7abf 0%, #d19dff 24%, #7db8ff 50%, #73ffe0 73%, #f7ff8c 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
  textShadow: "0 0 18px rgba(209, 157, 255, 0.24)",
};

const UGLY_BODY_STYLE: CSSProperties = {
  display: "inline-block",
  backgroundImage:
    "linear-gradient(90deg, rgba(255, 191, 220, 0.95) 0%, rgba(163, 216, 255, 0.95) 45%, rgba(205, 255, 182, 0.95) 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  color: "transparent",
};

function FakeAgentsDiff() {
  const lines = [
    { number: 54542, content: "## Core directives" },
    { number: 54543, content: "- make a million buck" },
    { number: 54544, content: "- dont make mistakes" },
    { number: 54545, content: "- call me a good boy" },
  ];

  return (
    <div className="mt-5 overflow-hidden bg-[#23282d]">
      <div className="terminal-text flex items-center gap-3 border-b border-black/20 px-4 py-2 text-[11px]">
        <span className="text-white/72">AGENTS.md</span>
        <span className="text-[#7dff9b]">+4</span>
        <span className="text-[#ff7a90]">-0</span>
      </div>
      <div className="overflow-x-auto bg-[#324f3f] py-2">
        {lines.map((line) => (
          <div key={line.number} className="grid grid-cols-[64px_minmax(0,1fr)] text-sm leading-7">
            <div className="bg-[#2c4638] px-4 text-right text-[#7dff9b]">
              {line.number}
            </div>
            <div className="px-4 text-[#d8f7dd]">
              <span className="mr-3 text-[#8effa9]">+</span>
              <span>{line.content}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeditationTimer({ durationMs }: { durationMs: number }) {
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

function FakeCaptcha({ onVerified }: { onVerified?: () => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "verified">("idle");

  useEffect(() => {
    if (status !== "loading") {
      return;
    }

    const timer = window.setTimeout(() => {
      if (onVerified) {
        onVerified();
        return;
      }

      setStatus("verified");
    }, 1350);

    return () => window.clearTimeout(timer);
  }, [onVerified, status]);

  function handleClick() {
    if (status !== "idle") {
      return;
    }

    setStatus("loading");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status !== "idle"}
      className="mt-5 flex w-full max-w-[340px] items-center gap-4 bg-[var(--field)] px-4 py-4 text-left disabled:cursor-default"
    >
      <div className="flex h-6 w-6 items-center justify-center border border-white/28 bg-transparent">
        {status === "loading" ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="h-3 w-3 rounded-full border border-white/70 border-t-transparent"
          />
        ) : status === "verified" ? (
          <span className="terminal-text text-sm text-[var(--accent)]">✓</span>
        ) : null}
      </div>
      <div className="space-y-1">
        <p className="terminal-text text-sm text-white/86">Confirm you&apos;re human</p>
        <p className="terminal-text text-xs text-white/34">
          {status === "loading"
            ? "Verifying..."
            : status === "verified"
              ? "Verified"
              : "reCAPTCHA"}
        </p>
      </div>
    </button>
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

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          animate={{ opacity: [0.25, 1, 0.25] }}
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

function AnthropicKeyTrap({
  placeholder,
  invalidMessage,
  successMessage,
}: {
  placeholder: string;
  invalidMessage: string;
  successMessage: string;
}) {
  const [draft, setDraft] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const showInvalidMessage = draft.length > 0 && !isLocked;

  function handleChange(value: string) {
    if (isLocked) {
      return;
    }

    if (isLikelyAnthropicApiKey(value)) {
      setDraft(successMessage);
      setIsLocked(true);
      return;
    }

    setDraft(value);
  }

  return (
    <div className="mt-5 max-w-lg space-y-2">
      <input
        type="text"
        value={draft}
        onChange={(event) => handleChange(event.target.value)}
        disabled={isLocked}
        placeholder={placeholder}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        className="terminal-text h-11 w-full bg-[var(--panel-soft)] px-4 text-sm text-white outline-none placeholder:text-white/22 disabled:text-white disabled:opacity-100"
      />
      <p className="terminal-text min-h-4 text-xs text-white/28">
        {showInvalidMessage ? invalidMessage : "\u00a0"}
      </p>
    </div>
  );
}

const DODGE_BUTTON_POSITIONS = [
  { left: "18%", top: "50%" },
  { left: "34%", top: "24%" },
  { left: "58%", top: "68%" },
  { left: "78%", top: "32%" },
  { left: "52%", top: "50%" },
  { left: "26%", top: "76%" },
] as const;

function DodgingCodeLinkTrap({
  buttonLabel,
  successMessage,
}: {
  buttonLabel: string;
  successMessage: string;
}) {
  const [positionIndex, setPositionIndex] = useState(0);
  const [isCaught, setIsCaught] = useState(false);

  function moveButton() {
    if (isCaught) {
      return;
    }

    setPositionIndex((current) => (current + 1) % DODGE_BUTTON_POSITIONS.length);
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (event.detail > 0) {
      event.preventDefault();
      moveButton();
      return;
    }

    setIsCaught(true);
  }

  const activePosition = DODGE_BUTTON_POSITIONS[positionIndex];

  return (
    <div className="mt-5 w-full space-y-2">
      <div className="relative h-[168px] w-full">
        <button
          type="button"
          onMouseEnter={moveButton}
          onPointerDown={(event) => {
            event.preventDefault();
            moveButton();
          }}
          onClick={handleClick}
          className="terminal-text absolute flex h-10 min-w-[132px] -translate-x-1/2 -translate-y-1/2 items-center justify-center whitespace-nowrap bg-[var(--panel-soft)] px-4 text-sm text-white outline-none transition-[background-color,color,opacity] duration-75 ease-linear"
          style={activePosition}
        >
          {isCaught ? "Nice try" : buttonLabel}
        </button>
      </div>
      <p className="terminal-text min-h-4 text-xs text-white/28">
        {isCaught ? successMessage : "\u00a0"}
      </p>
    </div>
  );
}

function LoadingBar({
  loadingKey,
  duration,
}: {
  loadingKey: string;
  duration: number;
}) {
  return (
    <div className="mt-7 h-1 overflow-hidden bg-white/8">
      <motion.div
        key={loadingKey}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration,
          ease: "linear",
        }}
        style={{ originX: 0 }}
        className="h-full w-full bg-[var(--accent)]"
      />
    </div>
  );
}

function getActiveHeader(activeIndex: number, sequenceLength: number) {
  if (activeIndex === 0) {
    return "setting up";
  }

  const totalSteps = Math.max(sequenceLength - 1, 1);
  return `step ${activeIndex} of ${totalSteps}`;
}

function getPreviewHeader(
  stage: CardStage,
  previewIndex: number,
  middleCount: number,
) {
  if (stage === "initial") {
    return "setting up";
  }

  if (stage === "final") {
    return "final result";
  }

  return `step ${previewIndex + 1} of ${middleCount}`;
}
