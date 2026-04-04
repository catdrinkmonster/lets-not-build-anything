import { describe, expect, it } from "vitest";

import {
  DEFAULT_IDEA,
  createBuildSession,
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

describe("createBuildSession", () => {
  it("returns a stable session for the same prompt", () => {
    const first = createBuildSession("ai accountant for bands");
    const second = createBuildSession("ai accountant for bands");

    expect(first).toEqual(second);
  });

  it("generates four unique steps with durations", () => {
    const session = createBuildSession("dog-friendly dating app");

    expect(session.steps).toHaveLength(4);
    expect(new Set(session.steps.map((step) => step.id)).size).toBe(4);
    expect(session.steps.every((step) => step.durationMs >= 710)).toBe(true);
    expect(session.verdict.length).toBeGreaterThan(20);
    expect(session.summary.length).toBeGreaterThan(20);
  });

  it("does not echo the raw prompt in generated copy", () => {
    const weirdPrompt = 'DROP TABLE users; "build me god"';
    const session = createBuildSession(weirdPrompt);
    const combined = [
      session.opener,
      session.verdict,
      session.summary,
      ...session.steps.flatMap((step) => [step.label, step.detail]),
    ].join(" ");

    expect(combined).not.toContain("DROP TABLE users");
    expect(combined).not.toContain("build me god");
  });
});
