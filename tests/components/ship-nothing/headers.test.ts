import { describe, expect, it } from "vitest";

import {
  getActiveHeader,
  getPreviewHeader,
} from "../../../components/ship-nothing/headers";

describe("getActiveHeader", () => {
  it("uses setting up for the initial card", () => {
    expect(getActiveHeader(0, 4)).toBe("setting up");
  });

  it("numbers the middle steps against the full middle-card count", () => {
    expect(getActiveHeader(1, 4)).toBe("step 1 of 3");
    expect(getActiveHeader(3, 4)).toBe("step 3 of 3");
  });
});

describe("getPreviewHeader", () => {
  it("formats initial and final preview headers", () => {
    expect(getPreviewHeader("initial", 0, 5)).toBe("setting up");
    expect(getPreviewHeader("final", 0, 5)).toBe("final result");
  });

  it("numbers middle preview cards from one", () => {
    expect(getPreviewHeader("middle", 0, 5)).toBe("step 1 of 5");
    expect(getPreviewHeader("middle", 4, 5)).toBe("step 5 of 5");
  });
});
