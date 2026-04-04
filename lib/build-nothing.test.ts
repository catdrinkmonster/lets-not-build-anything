import { describe, expect, it } from "vitest";

import {
  DEFAULT_IDEA,
  INITIAL_CARD_VARIANTS,
  MIDDLE_CARD_VARIANTS,
  FINAL_CARD_VARIANTS,
  createBuildSession,
  getVariantCount,
  getVariantPreview,
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
  it("reports the correct variant counts", () => {
    expect(getVariantCount("initial")).toBe(INITIAL_CARD_VARIANTS.length);
    expect(getVariantCount("middle")).toBe(MIDDLE_CARD_VARIANTS.length);
    expect(getVariantCount("final")).toBe(FINAL_CARD_VARIANTS.length);
  });

  it("returns stable wrapped previews for any index", () => {
    const wrapped = getVariantPreview("middle", MIDDLE_CARD_VARIANTS.length + 2);
    const direct = getVariantPreview("middle", 2);

    expect(wrapped).toEqual(direct);
  });
});

describe("createBuildSession", () => {
  it("returns a stable session for the same prompt", () => {
    const first = createBuildSession("ai accountant for bands");
    const second = createBuildSession("ai accountant for bands");

    expect(first).toEqual(second);
  });

  it("generates one initial card, three unique middle cards, and one final card", () => {
    const session = createBuildSession("dog-friendly dating app");

    expect(session.initialCard.durationMs).toBeGreaterThanOrEqual(710);
    expect(session.middleCards).toHaveLength(3);
    expect(new Set(session.middleCards.map((card) => card.id)).size).toBe(3);
    expect(session.middleCards.every((card) => card.durationMs >= 710)).toBe(true);
    expect(session.finalCard.title.length).toBeGreaterThan(20);
    expect(session.finalCard.body.length).toBeGreaterThan(20);
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
    ].join(" ");

    expect(combined).not.toContain("DROP TABLE users");
    expect(combined).not.toContain("build me god");
  });
});
