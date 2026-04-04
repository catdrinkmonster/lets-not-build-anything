export type CardStage = "initial" | "middle" | "final";

export type BuildCard = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  durationMs: number;
};

export type FinalCard = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
};

export type BuildSession = {
  id: string;
  initialCard: BuildCard;
  middleCards: BuildCard[];
  finalCard: FinalCard;
};

type CardTemplate = {
  eyebrow: string;
  title: string;
  body: string;
};

const MIDDLE_CARD_COUNT = 3;

export const DEFAULT_IDEA =
  "an ai startup for people too busy to have a personality";

export const INITIAL_CARD_VARIANTS: CardTemplate[] = [
  {
    eyebrow: "initial review",
    title: "Reading the room",
    body: "Starting with a measured pause and a professional amount of doubt.",
  },
  {
    eyebrow: "initial review",
    title: "Opening the brief",
    body: "Looking over the idea like this will require emotional labor.",
  },
  {
    eyebrow: "initial review",
    title: "First pass",
    body: "Applying immediate skepticism before any fake momentum begins.",
  },
  {
    eyebrow: "initial review",
    title: "Sizing it up",
    body: "Giving the concept one respectful glance before the avoidance cycle starts.",
  },
];

export const MIDDLE_CARD_VARIANTS: CardTemplate[] = [
  {
    eyebrow: "workstream",
    title: "Competitive analysis",
    body: "Watching unrelated product demos and pretending this counts as research.",
  },
  {
    eyebrow: "workstream",
    title: "Technical planning",
    body: "Opening a blank editor, typing nothing, and calling it architecture.",
  },
  {
    eyebrow: "workstream",
    title: "Risk assessment",
    body: "Concluding the main deliverable would mostly be future maintenance.",
  },
  {
    eyebrow: "workstream",
    title: "Momentum check",
    body: "Mistaking a convincing interface for meaningful progress.",
  },
  {
    eyebrow: "workstream",
    title: "Design review",
    body: "Adjusting spacing mentally and never committing the changes.",
  },
  {
    eyebrow: "workstream",
    title: "Energy management",
    body: "Standing up once and counting that as a productivity system.",
  },
  {
    eyebrow: "workstream",
    title: "Scope control",
    body: "Reducing ambition until the concept becomes spiritually optional.",
  },
  {
    eyebrow: "workstream",
    title: "Stakeholder sync",
    body: "Holding a private meeting with better judgment and hearing strong objections.",
  },
];

export const FINAL_CARD_VARIANTS: CardTemplate[] = [
  {
    eyebrow: "final result",
    title: "Decided this should remain a concept.",
    body: "No product was harmed. No roadmap was expanded. Morale is stable.",
  },
  {
    eyebrow: "final result",
    title: "This is not surviving triage today.",
    body: "The process was thorough, the outcome was negative, and the restraint was tasteful.",
  },
  {
    eyebrow: "final result",
    title: "Could have built it. Chose dignity instead.",
    body: "After serious review, the cleanest implementation was not implementing anything.",
  },
  {
    eyebrow: "final result",
    title: "Reviewed, judged, and respectfully left untouched.",
    body: "The interface implied progress long enough for everyone to move on peacefully.",
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
  const template = getTemplate(stage, index);

  if (stage === "final") {
    return {
      id: `${stage}-${normalizeIndex(index, getPool(stage).length)}`,
      eyebrow: template.eyebrow,
      title: template.title,
      body: template.body,
    } satisfies FinalCard;
  }

  return {
    id: `${stage}-${normalizeIndex(index, getPool(stage).length)}`,
    eyebrow: template.eyebrow,
    title: template.title,
    body: template.body,
    durationMs: 920,
  } satisfies BuildCard;
}

export function createBuildSession(input: string): BuildSession {
  const prompt = normalizePrompt(input);
  const seed = hashString(prompt.toLowerCase());

  return {
    id: seed.toString(36),
    initialCard: createTimedCard(
      "initial",
      selectInitialIndex(seed),
      durationFor(seed, 0),
    ),
    middleCards: selectMiddleCards(seed),
    finalCard: createFinalCard(selectFinalIndex(seed)),
  };
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

function normalizeIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function getTemplate(stage: CardStage, index: number) {
  const pool = getPool(stage);
  return pool[normalizeIndex(index, pool.length)];
}

function hashString(input: string): number {
  let hash = 2166136261;

  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function durationFor(seed: number, index: number) {
  return 620 + (((seed >> (index * 4)) & 7) + 1) * 90;
}

function selectInitialIndex(seed: number) {
  return seed % INITIAL_CARD_VARIANTS.length;
}

function selectFinalIndex(seed: number) {
  return (seed >> 3) % FINAL_CARD_VARIANTS.length;
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
  };
}

function selectMiddleCards(seed: number): BuildCard[] {
  const cards: BuildCard[] = [];
  const used = new Set<number>();
  let cursor = (seed >> 1) % MIDDLE_CARD_VARIANTS.length;

  while (cards.length < MIDDLE_CARD_COUNT) {
    if (!used.has(cursor)) {
      cards.push(createTimedCard("middle", cursor, durationFor(seed, cards.length + 1)));
      used.add(cursor);
    }

    cursor = (cursor + 3) % MIDDLE_CARD_VARIANTS.length;
  }

  return cards;
}
