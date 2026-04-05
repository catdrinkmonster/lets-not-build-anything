import { describe, expect, it } from "vitest";

import { moveBouncingRect } from "../../lib/dvd-motion";

describe("moveBouncingRect", () => {
  it("moves at a constant velocity away from edges", () => {
    const next = moveBouncingRect(
      { x: 10, y: 10, vx: 100, vy: 80 },
      300,
      200,
      40,
      20,
      0.5,
    );

    expect(next).toEqual({
      x: 60,
      y: 50,
      vx: 100,
      vy: 80,
    });
  });

  it("bounces off the right edge without reducing speed", () => {
    const next = moveBouncingRect(
      { x: 255, y: 20, vx: 100, vy: 0 },
      300,
      200,
      40,
      20,
      0.1,
    );

    expect(next.x).toBe(260);
    expect(next.vx).toBe(-100);
    expect(next.vy).toBe(0);
  });
});
