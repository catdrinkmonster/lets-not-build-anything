"use client";

import type { CSSProperties } from "react";

import { AutoDino } from "@/components/auto-dino";
import { DvdLayout } from "@/components/dvd-layout";
import { TenorEmbed } from "@/components/tenor-embed";
import {
  BenchmarkChart,
  FaviconBloat,
  LoadingBar,
  LoadingDots,
  MeditationTimer,
} from "@/components/ship-nothing/animations";
import { FakeAgentsDiff, ObsidianGraph } from "@/components/ship-nothing/content";
import {
  AnthropicKeyTrap,
  DodgingCodeLinkTrap,
  FakeCaptcha,
  ZipBombTrap,
} from "@/components/ship-nothing/traps";
import type {
  BuildCard,
  BuildCardInteraction,
  FinalCard,
  FinalCardInteraction,
} from "@/lib/build-nothing";

export function getCardShellClassName() {
  return "panel-strong terminal-accent-left px-5 py-5";
}

export function getCardShellStyle(
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

export function BuildCardView({
  card,
  header,
  playToken,
  onActionResolved,
  autoLoopCaptcha = false,
}: {
  card: BuildCard;
  header: string;
  playToken: string;
  onActionResolved?: () => void;
  autoLoopCaptcha?: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="terminal-text text-[11px] uppercase tracking-[0.18em] text-white/34">
          {header}
        </p>
        {card.interaction?.type === "fake-captcha" ? null : (
          <LoadingDots playToken={playToken} />
        )}
      </div>

      {card.interaction?.type === "ugly-gradients" ? (
        <GradientTitle>{card.title}</GradientTitle>
      ) : (
        <p className={getCardTitleClassName(card.interaction?.type)}>{card.title}</p>
      )}
      {card.body ? (
        card.interaction?.type === "ugly-gradients" ? (
          <GradientBody>{card.body}</GradientBody>
        ) : (
          <p className={getCardBodyClassName(card.interaction?.type)}>{card.body}</p>
        )
      ) : null}

      {card.interaction?.type === "dino-runner" ? <AutoDino /> : null}
      {card.interaction?.type === "obsidian-graph" ? <ObsidianGraph /> : null}
      {card.interaction?.type === "benchmark-chart" ? (
        <BenchmarkChart playToken={playToken} />
      ) : null}
      {card.interaction?.type === "favicon-bloat" ? (
        <FaviconBloat playToken={playToken} />
      ) : null}
      {card.interaction?.type === "dvd-layout" ? <DvdLayout /> : null}
      {card.interaction?.type === "meditation-timer" ? (
        <MeditationTimer key={`meditation-${playToken}`} durationMs={card.durationMs} />
      ) : null}
      {card.interaction?.type === "fake-diff" ? <FakeAgentsDiff /> : null}
      {card.interaction?.type === "tenor-embed" ? (
        <TenorEmbed
          embed={card.interaction.embed}
          maxWidth={card.interaction.maxWidth}
        />
      ) : null}
      {card.interaction?.type === "fake-captcha" ? (
        <FakeCaptcha
          key={`captcha-${playToken}`}
          onVerified={onActionResolved}
          autoLoop={autoLoopCaptcha}
        />
      ) : null}

      {card.interaction?.type === "fake-captcha" ? null : (
        <LoadingBar
          playToken={playToken}
          duration={Math.max(card.durationMs / 1000, 0.75)}
        />
      )}
    </>
  );
}

export function FinalCardView({
  card,
  playToken,
}: {
  card: FinalCard;
  playToken: string;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <p className="terminal-text text-[11px] uppercase tracking-[0.18em] text-white/34">
          final result
        </p>
        <div className="h-2 w-2 bg-[var(--accent)]" />
      </div>

      <p className="mt-6 max-w-xl whitespace-pre-line text-2xl font-medium tracking-[-0.04em] text-white sm:text-[2rem]">
        {card.title}
      </p>
      {card.body ? (
        <p className="terminal-text mt-3 max-w-lg text-sm leading-7 text-white/46 sm:text-[15px]">
          {card.body}
        </p>
      ) : null}

      {card.interaction?.type === "anthropic-key" ? (
        <AnthropicKeyTrap
          key={`trap-${playToken}`}
          placeholder={card.interaction.placeholder}
          invalidMessage={card.interaction.invalidMessage}
          successMessage={card.interaction.successMessage}
        />
      ) : card.interaction?.type === "dodge-code-link" ? (
        <DodgingCodeLinkTrap
          key={`dodge-${playToken}`}
          buttonLabel={card.interaction.buttonLabel}
          successMessage={card.interaction.successMessage}
        />
      ) : card.interaction?.type === "zip-bomb" ? (
        <ZipBombTrap
          key={`zip-${playToken}`}
          fileName={card.interaction.fileName}
          fileSize={card.interaction.fileSize}
        />
      ) : null}
    </>
  );
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
