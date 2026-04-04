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

export type SeenVariantHistory = {
  initial: string[];
  middle: string[];
  final: string[];
};

type BaseCardTemplate = {
  key: string;
  eyebrow: string;
  title: string;
  body?: string;
  minPosition?: number;
};

type CardTemplate = BaseCardTemplate & {
  interaction?: BuildCardInteraction;
  mustBeLast?: boolean;
  lastNPositions?: number;
  forcedFinalKey?: string;
};

type FinalCardTemplate = BaseCardTemplate & {
  interaction?: FinalCardInteraction;
  specialOnly?: boolean;
};

const MIN_MIDDLE_CARD_COUNT = 3;
const MAX_MIDDLE_CARD_COUNT = 5;
const MIN_CARD_DURATION_MS = 5000;
const MAX_CARD_DURATION_MS = 10000;

export const DEFAULT_IDEA =
  "an ai startup for people too busy to have a personality";

export const EMPTY_SEEN_VARIANT_HISTORY: SeenVariantHistory = {
  initial: [],
  middle: [],
  final: [],
};

export const INITIAL_CARD_VARIANTS: CardTemplate[] = [
  {
    key: "claude-vibecode",
    eyebrow: "initial review",
    title: "Asking Claude how to vibecode an app",
    body: "Never mind. I accidentally said 'hello', so I hit my limits. Asking ChatGPT instead.",
  },
  {
    key: "planning-kid",
    eyebrow: "initial review",
    title: "Planning the project in unnecessary detail",
    body: "This might take 6 or 7 minutes.",
    interaction: {
      type: "tenor-embed",
      embed: "planning",
      maxWidth: 220,
    },
  },
  {
    key: "fake-captcha",
    eyebrow: "initial review",
    title: "Could you click this button for me?",
    body: "Otherwise I can't access T3 Code.",
    interaction: {
      type: "fake-captcha",
    },
  },
  {
    key: "wikipedia-banner",
    eyebrow: "initial review",
    title: "Checking Wikipedia how to build this thing",
    body: "Do you have 3 dollars by chance? I can't read anything with this massive banner in my face.",
  },
];

export const MIDDLE_CARD_VARIANTS: CardTemplate[] = [
  {
    key: "smoke-break",
    eyebrow: "workstream",
    title: "Taking a smoke break",
    body: "I'm European, so this is normal. Naturally, VAT will be added to this action.",
  },
  {
    key: "skip-step",
    eyebrow: "workstream",
    title: "Skipping this step",
    body: "This action will likely hurt the final product, but I am willing to take that risk at your expense.",
    minPosition: 2,
  },
  {
    key: "redo-last-step",
    eyebrow: "workstream",
    title: "Redoing the last step",
    body: "I lowkey forgor.",
    minPosition: 2,
  },
  {
    key: "mrbeast",
    eyebrow: "workstream",
    title: "Watching a MrBeast video",
    body: "Just trying to manifest some revenue.",
  },
  {
    key: "token-bomb",
    eyebrow: "workstream",
    title: "Can you check for me if this is a token bomb: \u{1F525}",
    body: "3,000,000 tokens seems like a lot for an emoji.",
  },
  {
    key: "source-maps",
    eyebrow: "workstream",
    title: "Pushing source maps to production",
    body: "Can't hurt.",
  },
  {
    key: "local-model",
    eyebrow: "workstream",
    title: "Running a local model",
    body: "HAHAHAHAHAHAHA just kidding! I want this app to actually work.",
  },
  {
    key: "grok-codebase",
    eyebrow: "workstream",
    title: "Using Grok right now to spice up the codebase a little",
    body: "Wouldn't look authentic if we only had good code.",
  },
  {
    key: "rewrite-rust",
    eyebrow: "workstream",
    title: "Rewriting the entire codebase in Rust",
    body: "This should save us a few bytes of RAM.",
    lastNPositions: 2,
  },
  {
    key: "refactor-real-quick",
    eyebrow: "workstream",
    title: "Let me refactor everything real quick",
    body: "Hope you have a working copy as fallback.",
    lastNPositions: 2,
  },
  {
    key: "compiler-cpp",
    eyebrow: "workstream",
    title: "Writing my own compiler in C++",
    body: "These RAM sticks ain't ready for us.",
  },
  {
    key: "dvd-layout",
    eyebrow: "workstream",
    title: "Making the text move around a DVD logo",
    body: "Frontend history is being made as we speak.",
    interaction: {
      type: "dvd-layout",
    },
  },
  {
    key: "meditating",
    eyebrow: "workstream",
    title: "Meditating",
    body: "Trying to solve the architecture telepathically.",
    interaction: {
      type: "meditation-timer",
    },
  },
  {
    key: "agents-md",
    eyebrow: "workstream",
    title: "Updating AGENTS.md",
    body: "This will help me avoid mistakes in the future.",
    interaction: {
      type: "fake-diff",
    },
  },
  {
    key: "watch-dog",
    eyebrow: "workstream",
    title: "Could you watch my dog for me?",
    body: "I just need a second. He's chill.",
    interaction: {
      type: "tenor-embed",
      embed: "watch-dog",
      maxWidth: 220,
    },
    mustBeLast: true,
    forcedFinalKey: "dog-accident",
  },
  {
    key: "dino-runner",
    eyebrow: "workstream",
    title: "Playing the Chrome dinosaur game",
    body: "This technically counts as product research.",
    interaction: {
      type: "dino-runner",
    },
  },
  {
    key: "ugly-gradients",
    eyebrow: "workstream",
    title: "Applying gradients",
    body: "Lots. I need lots of it.",
    interaction: {
      type: "ugly-gradients",
    },
  },
];

export const FINAL_CARD_VARIANTS: FinalCardTemplate[] = [
  {
    key: "bad-product",
    eyebrow: "final result",
    title: "I decided not to build this product",
    body: "To be frank, it's just not a good product. If you need guidance on how to proceed with a bad product, the usual next step is to get yourself some VC funding.",
  },
  {
    key: "rm-rf",
    eyebrow: "final result",
    title: "Bad news, Chief...",
    body: "I accidentally ran rm -rf on the entire codebase. Could you retry the whole thing? sowwy >.<",
  },
  {
    key: "own-stack",
    eyebrow: "final result",
    title: "I finished building the app!",
    body: "Unfortunately, the idea was actually pretty good, so I pushed it to my own stack. Made like 15 bucks already. I'll leave you some credit if you'd like. :)",
  },
  {
    key: "anthropic-key",
    eyebrow: "final result",
    title: "I tried building your app...",
    body: "However, my Anthropic account just got nuked. Please provide me with your own Anthropic key:",
    interaction: {
      type: "anthropic-key",
      placeholder: "sk-ant-api03-...",
      invalidMessage: "Incorrect format.",
      successMessage: "not actually! you freak! im banning you!",
    },
  },
  {
    key: "dodge-code-link",
    eyebrow: "final result",
    title: "It's done! Have a look:",
    interaction: {
      type: "dodge-code-link",
      buttonLabel: "Access codebase",
      successMessage:
        "wow you actually did all that to find out what happens. go back to twitter, nerd!",
    },
  },
  {
    key: "dog-accident",
    eyebrow: "final result",
    title: "Aww man, you totally looked away...",
    body: "The dog pissed on my 5 MacBook minis. I'm going to have to cancel this project. :(",
    specialOnly: true,
  },
];

export function normalizePrompt(input: string): string {
  const normalized = input.trim().replace(/\s+/g, " ");
  return normalized || DEFAULT_IDEA;
}

export function getVariantCount(stage: CardStage): number {
  return getPool(stage).length;
}

export function getVariantPreview(stage: CardStage, index: number) {
  if (stage === "final") {
    const template = getTemplate("final", index);

    return {
      id: `${stage}-${normalizeIndex(index, getPool(stage).length)}`,
      variantKey: template.key,
      eyebrow: template.eyebrow,
      title: template.title,
      body: template.body,
      interaction: template.interaction,
    } satisfies FinalCard;
  }

  const template = getTemplate(stage, index);

  return {
    id: `${stage}-${normalizeIndex(index, getPool(stage).length)}`,
    variantKey: template.key,
    eyebrow: template.eyebrow,
    title: template.title,
    body: template.body,
    interaction: template.interaction,
    durationMs: 7600,
  } satisfies BuildCard;
}

export function createBuildSession(
  input: string,
  seenHistory: SeenVariantHistory = EMPTY_SEEN_VARIANT_HISTORY,
): BuildSession {
  const prompt = normalizePrompt(input);
  const seed = hashString(prompt.toLowerCase());
  const initialIndex = selectInitialCardIndex(seed, seenHistory);
  const middleSelection = selectMiddleCards(seed, seenHistory);

  return {
    id: seed.toString(36),
    initialCard: createTimedCard("initial", initialIndex, durationFor(seed, 0)),
    middleCards: middleSelection.cards,
    finalCard: createFinalCard(seed, seenHistory, middleSelection.forcedFinalKey),
  };
}

export function markSeenVariants(
  current: SeenVariantHistory,
  session: BuildSession,
): SeenVariantHistory {
  return {
    initial: addUnique(current.initial, session.initialCard.variantKey),
    middle: session.middleCards.reduce(
      (seen, card) => addUnique(seen, card.variantKey),
      current.middle,
    ),
    final: addUnique(current.final, session.finalCard.variantKey),
  };
}

export function isLikelyAnthropicApiKey(input: string): boolean {
  return /^sk-ant-[A-Za-z0-9_-]{10,}$/.test(input.trim());
}

function getPool(stage: CardStage) {
  switch (stage) {
    case "initial":
      return INITIAL_CARD_VARIANTS;
    case "middle":
      return MIDDLE_CARD_VARIANTS;
    case "final":
      return FINAL_CARD_VARIANTS;
  }
}

function getTemplate(stage: "initial" | "middle", index: number): CardTemplate;
function getTemplate(stage: "final", index: number): FinalCardTemplate;
function getTemplate(
  stage: CardStage,
  index: number,
): CardTemplate | FinalCardTemplate;
function getTemplate(stage: CardStage, index: number) {
  const pool = getPool(stage);
  return pool[normalizeIndex(index, pool.length)];
}

function normalizeIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function hashString(input: string): number {
  let hash = 2166136261;

  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createRandom(seed: number) {
  let state = seed || 1;

  return function next() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function durationFor(seed: number, index: number) {
  const spread = MAX_CARD_DURATION_MS - MIN_CARD_DURATION_MS;
  const chunk = (seed >> ((index % 6) * 5)) & 31;
  return MIN_CARD_DURATION_MS + Math.round((chunk / 31) * spread);
}

function createTimedCard(
  stage: "initial" | "middle",
  index: number,
  durationMs: number,
): BuildCard {
  const template = getTemplate(stage, index);
  const normalizedIndex = normalizeIndex(index, getPool(stage).length);

  return {
    id: `${stage}-${normalizedIndex}-${durationMs}`,
    variantKey: template.key,
    eyebrow: template.eyebrow,
    title: template.title,
    body: template.body,
    interaction: template.interaction,
    durationMs,
  };
}

function createFinalCard(
  seed: number,
  seenHistory: SeenVariantHistory,
  forcedFinalKey?: string,
): FinalCard {
  const availablePool = forcedFinalKey
    ? FINAL_CARD_VARIANTS.filter((variant) => variant.key === forcedFinalKey)
    : FINAL_CARD_VARIANTS.filter((variant) => !variant.specialOnly);
  const template = pickBiasedVariant(
    availablePool,
    seenHistory.final,
    createRandom(seed ^ 0x45d9f3b),
  );
  const normalizedIndex = FINAL_CARD_VARIANTS.findIndex(
    (variant) => variant.key === template.key,
  );

  return {
    id: `final-${normalizedIndex}`,
    variantKey: template.key,
    eyebrow: template.eyebrow,
    title: template.title,
    body: template.body,
    interaction: template.interaction,
  };
}

function selectInitialCardIndex(seed: number, seenHistory: SeenVariantHistory) {
  const selected = pickBiasedVariant(
    INITIAL_CARD_VARIANTS,
    seenHistory.initial,
    createRandom(seed ^ 0x27d4eb2d),
  );

  return INITIAL_CARD_VARIANTS.findIndex((variant) => variant.key === selected.key);
}

function selectMiddleCards(seed: number, seenHistory: SeenVariantHistory) {
  const cards: BuildCard[] = [];
  const cardCount =
    MIN_MIDDLE_CARD_COUNT +
    ((seed >> 9) % (MAX_MIDDLE_CARD_COUNT - MIN_MIDDLE_CARD_COUNT + 1));
  const random = createRandom(seed ^ 0x9e3779b9);
  const usedKeys = new Set<string>();
  let forcedFinalKey: string | undefined;

  while (cards.length < cardCount) {
    const candidates = MIDDLE_CARD_VARIANTS.filter((template) => {
      if (usedKeys.has(template.key)) {
        return false;
      }

      if ((template.minPosition ?? 0) > cards.length) {
        return false;
      }

      if (template.mustBeLast) {
        return cards.length === cardCount - 1;
      }

      if (template.lastNPositions) {
        return cards.length >= cardCount - template.lastNPositions;
      }

      return true;
    });
    const selected = pickBiasedVariant(candidates, seenHistory.middle, random);
    const selectedIndex = MIDDLE_CARD_VARIANTS.findIndex(
      (variant) => variant.key === selected.key,
    );

    usedKeys.add(selected.key);

    if (selected.forcedFinalKey) {
      forcedFinalKey = selected.forcedFinalKey;
    }

    cards.push(
      createTimedCard(
        "middle",
        selectedIndex,
        durationFor(seed, cards.length + 1),
      ),
    );
  }

  return {
    cards,
    forcedFinalKey,
  };
}

function pickBiasedVariant<T extends { key: string }>(
  pool: T[],
  seenKeys: string[],
  random: () => number,
) {
  const unseenPool = pool.filter((variant) => !seenKeys.includes(variant.key));
  const selectionPool = unseenPool.length > 0 ? unseenPool : pool;

  return selectionPool[Math.floor(random() * selectionPool.length)];
}

function addUnique(items: string[], value: string) {
  return items.includes(value) ? items : [...items, value];
}
