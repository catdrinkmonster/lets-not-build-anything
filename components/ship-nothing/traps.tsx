"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { isLikelyAnthropicApiKey } from "@/lib/build-nothing";

export function FakeCaptcha({
  onVerified,
  autoLoop = false,
}: {
  onVerified?: () => void;
  autoLoop?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "verified">("idle");

  useEffect(() => {
    if (!autoLoop || status !== "idle") {
      return;
    }

    const timer = window.setTimeout(() => {
      setStatus("loading");
    }, 420);

    return () => window.clearTimeout(timer);
  }, [autoLoop, status]);

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

  useEffect(() => {
    if (!autoLoop || status !== "verified") {
      return;
    }

    const timer = window.setTimeout(() => {
      setStatus("idle");
    }, 900);

    return () => window.clearTimeout(timer);
  }, [autoLoop, status]);

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
          <span className="terminal-text text-sm text-[var(--accent)]">{"\u2713"}</span>
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

export function ZipBombTrap({
  fileName,
  fileSize,
}: {
  fileName: string;
  fileSize: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isDownloading) {
      return;
    }

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min((elapsed / 2200) * 0.00001337, 0.00001337);
      setProgress(nextProgress);
    }, 70);

    return () => window.clearInterval(interval);
  }, [isDownloading]);

  return (
    <div className="mt-5 w-full">
      <div className="w-full bg-[var(--panel-soft)]">
        <div className="flex w-full items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="terminal-text truncate text-sm text-white/84">{fileName}</p>
            <p className="terminal-text text-xs text-white/34">{fileSize}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsDownloading(true)}
            disabled={isDownloading}
            className="terminal-text shrink-0 bg-[var(--field)] px-3 py-2 text-xs text-white/84 disabled:cursor-default disabled:text-white/44"
          >
            {isDownloading ? "Downloading" : "Download"}
          </button>
        </div>
        {isDownloading ? (
          <div className="space-y-3 px-4 pb-4 pt-2">
            <div className="terminal-text flex w-full items-center justify-between gap-4 text-xs text-white/44">
              <span>download progress</span>
              <span>{progress.toFixed(8)}%</span>
            </div>
            <div className="h-2 w-full bg-white/8">
              <div
                className="h-full bg-[var(--accent)]"
                style={{ width: `${Math.max((progress / 0.00001337) * 100, 0.8)}%` }}
              />
            </div>
            <div className="terminal-text flex w-full items-center justify-between gap-4 text-xs text-white/44">
              <span>free disk space required</span>
              <span className="text-white/78">9.4 PB</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AnthropicKeyTrap({
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

export function DodgingCodeLinkTrap({
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
