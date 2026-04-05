import { describe, expect, it } from "vitest";

import {
  BENCHMARK_CHART_ROWS,
  BENCHMARK_ROW_FILL_DURATION_S,
  BENCHMARK_ROW_STAGGER_S,
  getBenchmarkRowDelay,
} from "../../lib/benchmark-chart";

describe("BENCHMARK_CHART_ROWS", () => {
  it("keeps the benchmark absurdly skewed in favor of your app", () => {
    expect(BENCHMARK_CHART_ROWS[0]).toMatchObject({
      label: "your app",
      value: 97,
    });
    expect(BENCHMARK_CHART_ROWS[1]?.label).toBe("openclaw fork #7,284,119");
    expect(BENCHMARK_CHART_ROWS[2]?.label).toBe("travel route optimizer");
    expect(BENCHMARK_CHART_ROWS[3]?.label).toBe("thing that exists but for xyz");
  });

  it("animates the bars from the bottom row upward", () => {
    expect(BENCHMARK_ROW_FILL_DURATION_S).toBe(1.12);
    expect(BENCHMARK_ROW_STAGGER_S).toBe(1.12);
    expect(
      BENCHMARK_CHART_ROWS.map((_, index) =>
        Number(
          getBenchmarkRowDelay(index, BENCHMARK_CHART_ROWS.length).toFixed(2),
        ),
      ),
    ).toEqual([3.36, 2.24, 1.12, 0]);
  });
});
