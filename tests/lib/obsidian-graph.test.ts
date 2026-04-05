import { describe, expect, it } from "vitest";

import {
  OBSIDIAN_GRAPH_EDGES,
  OBSIDIAN_GRAPH_NODES,
  OBSIDIAN_GRAPH_OFFSET,
} from "../../lib/obsidian-graph";

describe("OBSIDIAN_GRAPH_*", () => {
  it("keeps the fake Obsidian vault graph unreadably dense", () => {
    expect(OBSIDIAN_GRAPH_NODES.length).toBeGreaterThanOrEqual(150);
    expect(OBSIDIAN_GRAPH_EDGES.length).toBeGreaterThanOrEqual(400);
  });

  it("recenters the generated graph cloud inside the viewport", () => {
    expect(Math.abs(OBSIDIAN_GRAPH_OFFSET.x)).toBeLessThan(10);
    expect(Math.abs(OBSIDIAN_GRAPH_OFFSET.y)).toBeLessThan(10);
  });
});
