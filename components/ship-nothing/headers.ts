import type { CardStage } from "@/lib/build-nothing";

export const DEV_STAGES: CardStage[] = ["initial", "middle", "final"];

export const DONATION_LINK = "https://buy.stripe.com/28E14g2j6eQ9ds8gAa8N200";

export function getActiveHeader(activeIndex: number, sequenceLength: number) {
  if (activeIndex === 0) {
    return "setting up";
  }

  const totalSteps = Math.max(sequenceLength - 1, 1);
  return `step ${activeIndex} of ${totalSteps}`;
}

export function getPreviewHeader(
  stage: CardStage,
  previewIndex: number,
  middleCount: number,
) {
  if (stage === "initial") {
    return "setting up";
  }

  if (stage === "final") {
    return "final result";
  }

  return `step ${previewIndex + 1} of ${middleCount}`;
}
