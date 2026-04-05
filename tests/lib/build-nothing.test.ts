import { describe, expect, it } from "vitest";

import {
  DEFAULT_CARD_DURATION_MS,
  DEFAULT_IDEA,
  FINAL_CARD_VARIANTS,
  INITIAL_ROTATION_STATE,
  INITIAL_CARD_VARIANTS,
  MIDDLE_CARD_VARIANTS,
  advanceRotationState,
  createBuildSession,
  getVariantCount,
  getVariantPreview,
  isLikelyAnthropicApiKey,
  normalizePrompt,
} from "../../lib/build-nothing";

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
    expect(getVariantCount("initial")).toBe(6);
    expect(getVariantCount("middle")).toBe(19);
    expect(getVariantCount("final")).toBe(7);
  });

  it("returns the same preview regardless of index wrapping", () => {
    expect(getVariantPreview("initial", 0)).toEqual(getVariantPreview("initial", 6));
    expect(getVariantPreview("middle", 0)).toEqual(getVariantPreview("middle", 19));
    expect(getVariantPreview("final", 0)).toEqual(getVariantPreview("final", 14));
  });

  it("exposes the tenor embed interaction on the planning initial variant", () => {
    const variant = INITIAL_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "tenor-embed",
    );

    expect(variant?.title).toBe("Planning the project in absurd detail");
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

    expect(variant?.title).toBe("Reading Wikipedia on how to build this shit");
  });

  it("includes the Obsidian-mapping initial variant", () => {
    const variant = INITIAL_CARD_VARIANTS.find(
      (card) => card.key === "obsidian-vault",
    );

    expect(variant?.title).toBe("Mapping out the idea in Obsidian first");
    expect(variant?.body).toBe(
      "We need at least 7 million nodes to satisfy the other two Obsidian users.",
    );
    expect(variant?.interaction?.type).toBe("obsidian-graph");
  });

  it("exposes the benchmark chart interaction on the dedicated initial variant", () => {
    const variant = INITIAL_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "benchmark-chart",
    );

    expect(variant?.title).toBe("Benchmarking your idea against absolut garbage");
  });

  it("exposes the dino-runner interaction on the dedicated middle variant", () => {
    const variant = MIDDLE_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "dino-runner",
    );

    expect(variant?.title).toBe("Hold up, internet down");
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

  it("exposes the favicon bloat interaction on the dedicated middle variant", () => {
    const variant = MIDDLE_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "favicon-bloat",
    );

    expect(variant?.title).toBe("Making the logo slightly bigger");
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

    expect(variant?.body).toBe("This should save us a few valuable bytes of RAM.");
    expect(variant?.lastNPositions).toBe(2);
  });

  it("includes the YC-speedrun variant", () => {
    const variant = MIDDLE_CARD_VARIANTS.find(
      (card) => card.key === "yc-speedrun",
    );

    expect(variant?.title).toBe("Watching a YC video at 1.75x speed");
  });

  it("includes the waitlist variant", () => {
    const variant = MIDDLE_CARD_VARIANTS.find(
      (card) => card.key === "waitlist-mom",
    );

    expect(variant?.body).toBe(
      "Sending your mom an invite to artificially inflate demand. She's a sweetheart.",
    );
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

    expect(variant?.title).toBe("The app has been built! Have a look:");
    expect(variant?.interaction?.successMessage).toContain("go back to twitter");
  });

  it("exposes the zip-bomb interaction on the dedicated final variant", () => {
    const variant = FINAL_CARD_VARIANTS.find(
      (card) => card.interaction?.type === "zip-bomb",
    );

    expect(variant?.title).toBe("The download is ready");
    expect(variant?.interaction?.fileSize).toBe("182 KB");
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
    expect(session.initialCard.durationMs).toBe(DEFAULT_CARD_DURATION_MS);

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
        (card) => card.durationMs === DEFAULT_CARD_DURATION_MS,
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

  it("always generates between three and five middle cards across many prompts", () => {
    for (let index = 0; index < 250; index += 1) {
      const session = createBuildSession(`count-range-${index}`, INITIAL_ROTATION_STATE);

      expect(session.middleCards.length).toBeGreaterThanOrEqual(3);
      expect(session.middleCards.length).toBeLessThanOrEqual(5);
    }
  });

  it("prefers the remaining initial rotation pool before reusing variants", () => {
    const session = createBuildSession("same prompt", {
      ...INITIAL_ROTATION_STATE,
      initial: [
        "obsidian-vault",
        "benchmark-garbage",
      ],
    });

    expect(["obsidian-vault", "benchmark-garbage"]).toContain(
      session.initialCard.variantKey,
    );
  });

  it("forces the dog ending when the dog card is selected last", () => {
    const session = createBuildSession("watch my dog", {
      ...INITIAL_ROTATION_STATE,
      middle: ["watch-dog"],
    });

    expect(session.middleCards.at(-1)?.variantKey).toBe("watch-dog");
    expect(session.finalCard.variantKey).toBe("dog-accident");
  });

  it("advances the rotation state after a generated run", () => {
    const session = createBuildSession("tracking run");
    const nextRotationState = advanceRotationState(INITIAL_ROTATION_STATE, session);

    expect(nextRotationState.initial).not.toContain(session.initialCard.variantKey);
    for (const card of session.middleCards) {
      expect(nextRotationState.middle).not.toContain(card.variantKey);
    }
    expect(nextRotationState.final).not.toContain(session.finalCard.variantKey);
  });

  it("keeps filling middle cards even when the remaining pool depletes mid-run", () => {
    const session = createBuildSession("mid-run pool reset", {
      ...INITIAL_ROTATION_STATE,
      middle: ["watch-dog"],
    });

    expect(session.middleCards.length).toBeGreaterThanOrEqual(3);
    expect(session.middleCards.length).toBeLessThanOrEqual(5);
    expect(session.middleCards.at(-1)?.variantKey).toBe("watch-dog");
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
