import { describe, expect, it } from "vitest";

import {
  DEFAULT_IDEA,
  EMPTY_SEEN_VARIANT_HISTORY,
  FINAL_CARD_VARIANTS,
  INITIAL_CARD_VARIANTS,
  MIDDLE_CARD_VARIANTS,
  createBuildSession,
  getVariantCount,
  getVariantPreview,
  isLikelyAnthropicApiKey,
  markSeenVariants,
  normalizePrompt,
} from "./build-nothing";

describe("normalizePrompt", () => {
  it("collapses whitespace and trims the input", () => {
    expect(normalizePrompt("   a   weird   todo app   ")).toBe(
      "a weird todo app",
    );
  });

  it("falls back to the default prompt when empty", () => {
    expect(normalizePrompt("   ")).toBe(DEFAULT_IDEA);
  });
});

describe("variant pools", () => {
  it("reports the configured variant counts for each stage", () => {
    expect(getVariantCount("initial")).toBe(4);
    expect(getVariantCount("middle")).toBe(17);
    expect(getVariantCount("final")).toBe(6);
  });

  it("returns the same preview regardless of index wrapping", () => {
    expect(getVariantPreview("initial", 0)).toEqual(getVariantPreview("initial", 4));
    expect(getVariantPreview("middle", 0)).toEqual(getVariantPreview("middle", 17));
    expect(getVariantPreview("final", 0)).toEqual(getVariantPreview("final", 12));
  });

  it("exposes the tenor embed interaction on the planning initial variant", () => {
    const variant = INITIAL_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "tenor-embed",
    );

    expect(variant?.title).toBe("Planning the project in unnecessary detail");
  });

  it("exposes the fake captcha interaction on the dedicated initial variant", () => {
    const variant = INITIAL_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "fake-captcha",
    );

    expect(variant?.title).toBe("Could you click this button for me?");
    expect(variant?.body).toBe("Otherwise I can't access T3 Code.");
  });

  it("includes the Wikipedia-banner initial variant", () => {
    const variant = INITIAL_CARD_VARIANTS.find(
      (card) => card.key === "wikipedia-banner",
    );

    expect(variant?.title).toBe("Checking Wikipedia how to build this thing");
  });

  it("exposes the dino-runner interaction on the dedicated middle variant", () => {
    const variant = MIDDLE_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "dino-runner",
    );

    expect(variant?.title).toBe("Playing the Chrome dinosaur game");
  });

  it("exposes the ugly-gradients interaction on the dedicated middle variant", () => {
    const variant = MIDDLE_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "ugly-gradients",
    );

    expect(variant?.title).toBe("Applying gradients");
  });

  it("exposes the meditation timer interaction on the dedicated middle variant", () => {
    const variant = MIDDLE_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "meditation-timer",
    );

    expect(variant?.title).toBe("Meditating");
  });

  it("exposes the DVD layout interaction on the dedicated middle variant", () => {
    const variant = MIDDLE_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "dvd-layout",
    );

    expect(variant?.title).toBe("Making the text move around a DVD logo");
  });

  it("exposes the fake-diff interaction on the dedicated middle variant", () => {
    const variant = MIDDLE_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "fake-diff",
    );

    expect(variant?.title).toBe("Updating AGENTS.md");
    expect(variant?.body).toBe("This will help me avoid mistakes in the future.");
  });

  it("exposes the dog-watch interaction on the dedicated middle variant", () => {
    const variant = MIDDLE_CARD_VARIANTS.find(
      (card) =>
        card.interaction?.type === "tenor-embed" &&
        card.interaction.embed === "watch-dog",
    );

    expect(variant?.title).toBe("Could you watch my dog for me?");
  });

  it("includes the late-run Rust rewrite variant", () => {
    const variant = MIDDLE_CARD_VARIANTS.find(
      (card) => card.key === "rewrite-rust",
    );

    expect(variant?.body).toBe("This should save us a few bytes of RAM.");
    expect(variant?.lastNPositions).toBe(2);
  });

  it("includes the compiler gag variant", () => {
    const variant = MIDDLE_CARD_VARIANTS.find(
      (card) => card.key === "compiler-cpp",
    );

    expect(variant?.title).toBe("Writing my own compiler in C++");
  });

  it("keeps the whole-project deletion joke explicit", () => {
    expect(FINAL_CARD_VARIANTS[1]?.body).toContain(
      "rm -rf on the entire codebase",
    );
  });

  it("exposes the dodge-code-link interaction on the dedicated final variant", () => {
    const variant = FINAL_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "dodge-code-link",
    );

    expect(variant?.title).toBe("It's done! Have a look:");
    expect(variant?.interaction?.successMessage).toContain("go back to twitter");
  });
});

describe("isLikelyAnthropicApiKey", () => {
  it("accepts the expected anthropic-style prefix", () => {
    expect(isLikelyAnthropicApiKey("sk-ant-api03-1234567890abcdef")).toBe(true);
  });

  it("rejects unrelated or too-short values", () => {
    expect(isLikelyAnthropicApiKey("sk-test-123")).toBe(false);
    expect(isLikelyAnthropicApiKey("🔥")).toBe(false);
  });
});

describe("createBuildSession", () => {
  it("returns a stable session for the same prompt", () => {
    const first = createBuildSession("ai accountant for bands");
    const second = createBuildSession("ai accountant for bands");

    expect(first).toEqual(second);
  });

  it("uses prompt-stable initial and final variants while varying middle count and durations", () => {
    const session = createBuildSession("dog-friendly dating app");
    const restrictedTitles = new Set(["Skipping this step", "Redoing the last step"]);
    const lateOnlyTitles = new Set([
      "Rewriting the entire codebase in Rust",
      "Let me actually refactor everything real quick",
    ]);

    expect(
      INITIAL_CARD_VARIANTS.some((variant) => variant.title === session.initialCard.title),
    ).toBe(true);
    expect(
      INITIAL_CARD_VARIANTS.some((variant) => variant.body === session.initialCard.body),
    ).toBe(true);
    expect(session.initialCard.durationMs).toBeGreaterThanOrEqual(5000);
    expect(session.initialCard.durationMs).toBeLessThanOrEqual(10000);

    expect(session.middleCards.length).toBeGreaterThanOrEqual(3);
    expect(session.middleCards.length).toBeLessThanOrEqual(5);
    expect(new Set(session.middleCards.map((card) => card.title)).size).toBe(
      session.middleCards.length,
    );
    expect(
      session.middleCards.every((card) =>
        MIDDLE_CARD_VARIANTS.some((variant) => variant.title === card.title),
      ),
    ).toBe(true);
    expect(
      session.middleCards.every(
        (card) => card.durationMs >= 5000 && card.durationMs <= 10000,
      ),
    ).toBe(true);
    expect(
      session.middleCards.slice(0, 2).every((card) => !restrictedTitles.has(card.title)),
    ).toBe(true);
    expect(
      session.middleCards.every(
        (card, index, cards) =>
          !lateOnlyTitles.has(card.title) || index >= cards.length - 2,
      ),
    ).toBe(true);

    expect(
      FINAL_CARD_VARIANTS.some((variant) => variant.title === session.finalCard.title),
    ).toBe(true);
    expect(
      (session.finalCard.body?.length ?? 0) > 20 ||
        session.finalCard.interaction?.type === "dodge-code-link",
    ).toBe(true);
  });

  it("biases initial selection toward unseen variants", () => {
    const session = createBuildSession("same prompt", {
      ...EMPTY_SEEN_VARIANT_HISTORY,
      initial: ["claude-vibecode", "planning-kid", "fake-captcha"],
    });

    expect(session.initialCard.variantKey).toBe("wikipedia-banner");
  });

  it("forces the dog ending when the dog card is selected last", () => {
    const seenMiddle = MIDDLE_CARD_VARIANTS.map((variant) => variant.key).filter(
      (key) => key !== "watch-dog",
    );
    const session = createBuildSession("watch my dog", {
      ...EMPTY_SEEN_VARIANT_HISTORY,
      middle: seenMiddle,
    });

    expect(session.middleCards.at(-1)?.variantKey).toBe("watch-dog");
    expect(session.finalCard.variantKey).toBe("dog-accident");
  });

  it("tracks seen variants after a generated run", () => {
    const session = createBuildSession("tracking run");
    const seen = markSeenVariants(EMPTY_SEEN_VARIANT_HISTORY, session);

    expect(seen.initial).toContain(session.initialCard.variantKey);
    expect(seen.middle).toEqual(
      expect.arrayContaining(session.middleCards.map((card) => card.variantKey)),
    );
    expect(seen.final).toContain(session.finalCard.variantKey);
  });

  it("does not echo the raw prompt in generated copy", () => {
    const weirdPrompt = 'DROP TABLE users; "build me god"';
    const session = createBuildSession(weirdPrompt);
    const combined = [
      session.initialCard.eyebrow,
      session.initialCard.title,
      session.initialCard.body,
      session.finalCard.eyebrow,
      session.finalCard.title,
      session.finalCard.body,
      ...session.middleCards.flatMap((card) => [
        card.eyebrow,
        card.title,
        card.body,
      ]),
    ]
      .filter((part): part is string => Boolean(part))
      .join(" ");

    expect(combined).not.toContain("DROP TABLE users");
    expect(combined).not.toContain("build me god");
  });
});
