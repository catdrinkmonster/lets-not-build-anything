import {
  DEFAULT_CARD_DURATION_MS,
  DEFAULT_IDEA,
  FINAL_CARD_VARIANTS,
  INITIAL_CARD_VARIANTS,
  INITIAL_ROTATION_STATE,
  MIDDLE_CARD_VARIANTS,
} from "./build-nothing-variants";
import type {
  BuildCard,
  BuildSession,
  CardStage,
  CardTemplate,
  FinalCard,
  FinalCardTemplate,
  VariantRotationState,
} from "./build-nothing-types";

export type {
  BaseCardTemplate,
  BuildCard,
  BuildCardInteraction,
  BuildSession,
  CardStage,
  CardTemplate,
  FinalCard,
  FinalCardInteraction,
  FinalCardTemplate,
  VariantRotationState,
} from "./build-nothing-types";

export {
  DEFAULT_CARD_DURATION_MS,
  DEFAULT_IDEA,
  FINAL_CARD_VARIANTS,
  INITIAL_CARD_VARIANTS,
  INITIAL_ROTATION_STATE,
  MIDDLE_CARD_VARIANTS,
} from "./build-nothing-variants";

const MIN_MIDDLE_CARD_COUNT = 3;
const MAX_MIDDLE_CARD_COUNT = 5;

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
    durationMs: DEFAULT_CARD_DURATION_MS,
  } satisfies BuildCard;
}

export function createBuildSession(
  input: string,
  rotationState: VariantRotationState = INITIAL_ROTATION_STATE,
): BuildSession {
  const prompt = normalizePrompt(input);
  const seed = hashString(prompt.toLowerCase());
  const workingRotationState = cloneRotationState(rotationState);
  const initialIndex = selectInitialCardIndex(seed, workingRotationState);
  const middleSelection = selectMiddleCards(seed, workingRotationState);

  return {
    id: seed.toString(36),
    initialCard: createTimedCard("initial", initialIndex, durationFor()),
    middleCards: ensureValidMiddleCardCount(middleSelection.cards),
    finalCard: createFinalCard(
      seed,
      workingRotationState,
      middleSelection.forcedFinalKey,
    ),
  };
}

export function advanceRotationState(
  current: VariantRotationState,
  session: BuildSession,
): VariantRotationState {
  let nextState = cloneRotationState(current);

  nextState = consumeRotationKey("initial", nextState, session.initialCard.variantKey);
  nextState = session.middleCards.reduce(
    (state, card) => consumeRotationKey("middle", state, card.variantKey),
    nextState,
  );

  return consumeRotationKey("final", nextState, session.finalCard.variantKey);
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

function durationFor() {
  return DEFAULT_CARD_DURATION_MS;
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
  rotationState: VariantRotationState,
  forcedFinalKey?: string,
): FinalCard {
  const availablePool = forcedFinalKey
    ? FINAL_CARD_VARIANTS.filter((variant) => variant.key === forcedFinalKey)
    : FINAL_CARD_VARIANTS.filter((variant) => !variant.specialOnly);
  const { variant: template, nextKeys } = pickRotatingVariant(
    availablePool,
    rotationState.final,
    createRandom(seed ^ 0x45d9f3b),
  );
  rotationState.final = nextKeys;
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

function selectInitialCardIndex(
  seed: number,
  rotationState: VariantRotationState,
) {
  const { variant: selected, nextKeys } = pickRotatingVariant(
    INITIAL_CARD_VARIANTS,
    rotationState.initial,
    createRandom(seed ^ 0x27d4eb2d),
  );
  rotationState.initial = nextKeys;

  return INITIAL_CARD_VARIANTS.findIndex((variant) => variant.key === selected.key);
}

function selectMiddleCards(seed: number, rotationState: VariantRotationState) {
  const cards: BuildCard[] = [];
  const countRandom = createRandom(seed ^ 0x85ebca6b);
  const cardCount =
    MIN_MIDDLE_CARD_COUNT +
    Math.floor(
      countRandom() * (MAX_MIDDLE_CARD_COUNT - MIN_MIDDLE_CARD_COUNT + 1),
    );
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
    const { variant: selected, nextKeys } = pickRotatingVariant(
      candidates,
      rotationState.middle,
      random,
      MIDDLE_CARD_VARIANTS,
    );
    rotationState.middle = nextKeys;
    const selectedIndex = MIDDLE_CARD_VARIANTS.findIndex(
      (variant) => variant.key === selected.key,
    );

    usedKeys.add(selected.key);

    if (selected.forcedFinalKey) {
      forcedFinalKey = selected.forcedFinalKey;
    }

    cards.push(createTimedCard("middle", selectedIndex, durationFor()));
  }

  return { cards, forcedFinalKey };
}

function pickRotatingVariant<T extends { key: string }>(
  eligiblePool: T[],
  remainingKeys: string[],
  random: () => number,
  fullPool: T[] = eligiblePool,
) {
  const normalizedRemainingKeys = normalizeRotationKeys(remainingKeys, fullPool);
  const remainingKeySet = new Set(normalizedRemainingKeys);
  const remainingEligiblePool = eligiblePool.filter((variant) =>
    remainingKeySet.has(variant.key),
  );
  const selectionPool =
    remainingEligiblePool.length > 0 ? remainingEligiblePool : eligiblePool;
  const variant = selectionPool[Math.floor(random() * selectionPool.length)];

  return {
    variant,
    nextKeys: advanceRotationKeys(normalizedRemainingKeys, fullPool, variant.key),
  };
}

function cloneRotationState(state: VariantRotationState) {
  return {
    initial: normalizeRotationKeys(state.initial, INITIAL_CARD_VARIANTS),
    middle: normalizeRotationKeys(state.middle, MIDDLE_CARD_VARIANTS),
    final: normalizeRotationKeys(state.final, FINAL_CARD_VARIANTS),
  };
}

function consumeRotationKey(
  stage: CardStage,
  state: VariantRotationState,
  key: string,
): VariantRotationState {
  const nextKeys =
    stage === "initial"
      ? advanceRotationKeys(state.initial, INITIAL_CARD_VARIANTS, key)
      : stage === "middle"
        ? advanceRotationKeys(state.middle, MIDDLE_CARD_VARIANTS, key)
        : advanceRotationKeys(state.final, FINAL_CARD_VARIANTS, key);

  return {
    ...state,
    [stage]: nextKeys,
  };
}

function normalizeRotationKeys<T extends { key: string }>(
  keys: string[],
  pool: T[],
) {
  const validKeys = new Set(pool.map((variant) => variant.key));
  const dedupedKeys = keys.filter(
    (key, index) => validKeys.has(key) && keys.indexOf(key) === index,
  );

  return dedupedKeys.length > 0
    ? dedupedKeys
    : pool.map((variant) => variant.key);
}

function advanceRotationKeys<T extends { key: string }>(
  keys: string[],
  pool: T[],
  selectedKey: string,
) {
  const nextKeys = keys.filter((key) => key !== selectedKey);

  return nextKeys.length > 0
    ? nextKeys
    : pool.map((variant) => variant.key);
}

function ensureValidMiddleCardCount(cards: BuildCard[]) {
  if (
    cards.length < MIN_MIDDLE_CARD_COUNT ||
    cards.length > MAX_MIDDLE_CARD_COUNT
  ) {
    throw new Error(
      `Expected ${MIN_MIDDLE_CARD_COUNT}-${MAX_MIDDLE_CARD_COUNT} middle cards, received ${cards.length}.`,
    );
  }

  return cards;
}
