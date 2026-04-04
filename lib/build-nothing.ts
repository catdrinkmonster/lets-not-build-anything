export type CardStage = "initial" | "middle" | "final";

export type BuildCard = {
  id: string;
  eyebrow: string;
  title: string;
  body?: string;
  interaction?: BuildCardInteraction;
  durationMs: number;
};

export type FinalCard = {
  id: string;
  eyebrow: string;
  title: string;
  body?: string;
  interaction?: FinalCardInteraction;
};

export type BuildCardInteraction = {
  type: "dino-runner";
} | {
  type: "ugly-gradients";
} | {
  type: "fake-diff";
} | {
  type: "tenor-embed";
} | {
  type: "fake-captcha";
};

export type FinalCardInteraction = {
  type: "anthropic-key";
  placeholder: string;
  invalidMessage: string;
  successMessage: string;
};

export type BuildSession = {
  id: string;
  initialCard: BuildCard;
  middleCards: BuildCard[];
  finalCard: FinalCard;
};

type BaseCardTemplate = {
  eyebrow: string;
  title: string;
  body?: string;
  minPosition?: number;
};

type CardTemplate = BaseCardTemplate & {
  interaction?: BuildCardInteraction;
};

type FinalCardTemplate = BaseCardTemplate & {
  interaction?: FinalCardInteraction;
};

const MIN_MIDDLE_CARD_COUNT = 3;
const MAX_MIDDLE_CARD_COUNT = 5;
const MIN_CARD_DURATION_MS = 5000;
const MAX_CARD_DURATION_MS = 10000;

export const DEFAULT_IDEA =
  "an ai startup for people too busy to have a personality";

export const INITIAL_CARD_VARIANTS: CardTemplate[] = [
  {
    eyebrow: "initial review",
    title: "Asking Claude how to vibecode an app",
    body: "Nevermind. I accidentally said 'hello', so I hit my limits. Asking ChatGPT instead.",
  },
  {
    eyebrow: "initial review",
    title: "Planning the project in unnecessary detail",
    body: "This might take 6 or 7 minutes.",
    interaction: {
      type: "tenor-embed",
    },
  },
  {
    eyebrow: "initial review",
    title: "Could you click this button for me?",
    body: "Otherwise I can't access T3 Code.",
    interaction: {
      type: "fake-captcha",
    },
  },
];

export const MIDDLE_CARD_VARIANTS: CardTemplate[] = [
  {
    eyebrow: "workstream",
    title: "Taking a smoke break.",
    body: "I'm European, so this is normal. VAT tax will be added to this action.",
  },
  {
    eyebrow: "workstream",
    title: "Skipping this step",
    body: "This will likely hurt the final product, but I am willing to take that risk at your expense.",
    minPosition: 2,
  },
  {
    eyebrow: "workstream",
    title: "Redoing the last step",
    body: "I lowkey forgor.",
    minPosition: 2,
  },
  {
    eyebrow: "workstream",
    title: "Watching a MrBeast video",
    body: "Just trying to manifest some money.",
  },
  {
    eyebrow: "workstream",
    title: "Can you check for me if this is a token bomb: 🔥",
    body: "3,000,000 tokens seems like a lot for an emoji.",
  },
  {
    eyebrow: "workstream",
    title: "Pushing source maps to production",
    body: "Can't hurt.",
  },
  {
    eyebrow: "workstream",
    title: "Running a local model",
    body: "HAHAHAHAHAHAHA just kidding! I want this app to actually work.",
  },
  {
    eyebrow: "workstream",
    title: "Updating AGENTS.md",
    body: "This will help me preventing mistakes in the future.",
    interaction: {
      type: "fake-diff",
    },
  },
  {
    eyebrow: "workstream",
    title: "Playing the Chrome dinosaur game",
    body: "This technically counts as product research.",
    interaction: {
      type: "dino-runner",
    },
  },
  {
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
    eyebrow: "final result",
    title: "I made the decision not to build this product.",
    body: "To be frank, it's just not a good product. If you need guidance on how to proceed with a bad product, the usual next step is to get yourself some VC funding.",
  },
  {
    eyebrow: "final result",
    title: "Bad news, Chief.",
    body: "I accidentally ran rm -rf on the entire codebase. Could you retry the whole thing? sowwy >.<",
  },
  {
    eyebrow: "final result",
    title: "I tried building your app.",
    body: "However, my Anthropic account just got nuked. Please provide me with your own Anthropic key:",
    interaction: {
      type: "anthropic-key",
      placeholder: "sk-ant-api03-...",
      invalidMessage: "Incorrect format.",
      successMessage: "not actually! you freak! im banning you!",
    },
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
      eyebrow: template.eyebrow,
      title: template.title,
      body: template.body,
      interaction: template.interaction,
    } satisfies FinalCard;
  }

  const template = getTemplate(stage, index);

  return {
    id: `${stage}-${normalizeIndex(index, getPool(stage).length)}`,
    eyebrow: template.eyebrow,
    title: template.title,
    body: template.body,
    interaction: template.interaction,
    durationMs: 920,
  } satisfies BuildCard;
}

export function createBuildSession(input: string): BuildSession {
  const prompt = normalizePrompt(input);
  const seed = hashString(prompt.toLowerCase());

  return {
    id: seed.toString(36),
    initialCard: createTimedCard("initial", selectInitialCardIndex(seed), durationFor(seed, 0)),
    middleCards: selectMiddleCards(seed),
    finalCard: createFinalCard(seed),
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
    eyebrow: template.eyebrow,
    title: template.title,
    body: template.body,
    interaction: template.interaction,
    durationMs,
  };
}

function createFinalCard(index: number): FinalCard {
  const template = getTemplate("final", index);
  const normalizedIndex = normalizeIndex(index, FINAL_CARD_VARIANTS.length);

  return {
    id: `final-${normalizedIndex}`,
    eyebrow: template.eyebrow,
    title: template.title,
    body: template.body,
    interaction: template.interaction,
  };
}

function selectInitialCardIndex(seed: number) {
  return seed % INITIAL_CARD_VARIANTS.length;
}

function selectMiddleCards(seed: number): BuildCard[] {
  const cards: BuildCard[] = [];
  const cardCount =
    MIN_MIDDLE_CARD_COUNT +
    ((seed >> 9) % (MAX_MIDDLE_CARD_COUNT - MIN_MIDDLE_CARD_COUNT + 1));
  const usedIndexes = new Set<number>();
  const random = createRandom(seed ^ 0x9e3779b9);

  while (cards.length < cardCount) {
    const eligibleIndexes = MIDDLE_CARD_VARIANTS.flatMap((template, index) => {
      if (usedIndexes.has(index)) {
        return [];
      }

      if ((template.minPosition ?? 0) > cards.length) {
        return [];
      }

      return [index];
    });
    const fallbackIndexes = MIDDLE_CARD_VARIANTS.flatMap((_, index) =>
      usedIndexes.has(index) ? [] : [index],
    );
    const pool = eligibleIndexes.length > 0 ? eligibleIndexes : fallbackIndexes;
    const selectedIndex = pool[Math.floor(random() * pool.length)];

    usedIndexes.add(selectedIndex);
    cards.push(
      createTimedCard(
        "middle",
        selectedIndex,
        durationFor(seed, cards.length + 1),
      ),
    );
  }

  return cards;
}
