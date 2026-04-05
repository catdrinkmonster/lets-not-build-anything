export type CardStage = "initial" | "middle" | "final";

export type BuildCardInteraction =
  | {
      type: "dino-runner";
    }
  | {
      type: "ugly-gradients";
    }
  | {
      type: "fake-diff";
    }
  | {
      type: "tenor-embed";
      embed: "planning" | "watch-dog";
      maxWidth?: number;
    }
  | {
      type: "fake-captcha";
    }
  | {
      type: "meditation-timer";
    }
  | {
      type: "dvd-layout";
    }
  | {
      type: "benchmark-chart";
    }
  | {
      type: "obsidian-graph";
    }
  | {
      type: "favicon-bloat";
    };

export type FinalCardInteraction =
  | {
      type: "anthropic-key";
      placeholder: string;
      invalidMessage: string;
      successMessage: string;
    }
  | {
      type: "dodge-code-link";
      buttonLabel: string;
      successMessage: string;
    }
  | {
      type: "zip-bomb";
      fileName: string;
      fileSize: string;
    };

export type BuildCard = {
  id: string;
  variantKey: string;
  eyebrow: string;
  title: string;
  body?: string;
  interaction?: BuildCardInteraction;
  durationMs: number;
};

export type FinalCard = {
  id: string;
  variantKey: string;
  eyebrow: string;
  title: string;
  body?: string;
  interaction?: FinalCardInteraction;
};

export type BuildSession = {
  id: string;
  initialCard: BuildCard;
  middleCards: BuildCard[];
  finalCard: FinalCard;
};

export type VariantRotationState = {
  initial: string[];
  middle: string[];
  final: string[];
};

export type BaseCardTemplate = {
  key: string;
  eyebrow: string;
  title: string;
  body?: string;
  minPosition?: number;
};

export type CardTemplate = BaseCardTemplate & {
  interaction?: BuildCardInteraction;
  mustBeLast?: boolean;
  lastNPositions?: number;
  forcedFinalKey?: string;
};

export type FinalCardTemplate = BaseCardTemplate & {
  interaction?: FinalCardInteraction;
  specialOnly?: boolean;
};
