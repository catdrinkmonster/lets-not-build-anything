export type BuildStep = {
  id: string;
  label: string;
  detail: string;
  durationMs: number;
};

export type BuildSession = {
  id: string;
  opener: string;
  steps: BuildStep[];
  verdict: string;
  summary: string;
};

type SummaryFactory = () => string;

type StepTemplate = {
  label: string;
  detail: string;
};

export const DEFAULT_IDEA =
  "an ai startup for people too busy to have a personality";

const OPENERS = [
  "Reviewing the idea with a serious face and unserious intent.",
  "Giving this the exact amount of thought it can survive.",
  "Applying a rigorous process of hesitation and selective effort.",
  "Opening an imaginary roadmap and immediately distrusting it.",
];

const STEP_TEMPLATES: StepTemplate[] = [
  {
    label: "Reading the brief",
    detail:
      "Scanning the concept for signs of urgency and finding mostly vibes.",
  },
  {
    label: "Competitive analysis",
    detail:
      "Watching unrelated product demos and pretending this counts as research.",
  },
  {
    label: "Technical planning",
    detail:
      "Opening a blank editor, typing nothing, and calling it architecture.",
  },
  {
    label: "Energy management",
    detail:
      "Stood up, stretched once, and decided that counted as forward progress.",
  },
  {
    label: "Design review",
    detail: "Adjusted spacing mentally and never committed the changes.",
  },
  {
    label: "Risk assessment",
    detail:
      "Concluding the main deliverable would mostly be future maintenance.",
  },
  {
    label: "Stakeholder sync",
    detail:
      "Held a private meeting with my better judgment and it was not supportive.",
  },
  {
    label: "Implementation window",
    detail: "Hovered over the keyboard, then preserved my peace instead.",
  },
  {
    label: "Shipping review",
    detail: "Asked whether this needed to exist. The silence was useful.",
  },
  {
    label: "Momentum check",
    detail:
      "Mistook a nice animation for meaningful progress and kept it moving.",
  },
];

const VERDICTS = [
  "Decided this should remain a concept.",
  "This is not surviving triage today.",
  "Could have built it. Chose dignity instead.",
  "Reviewed, judged, and respectfully left untouched.",
];

const SUMMARIES: SummaryFactory[] = [
  () => "No product was harmed. No roadmap was expanded. Morale is stable.",
  () =>
    "The interface looked busy enough to feel productive, which is what really matters.",
  () =>
    "This outcome was reached through a disciplined process of delay, deflection, and taste.",
  () => "After deep consideration, the best implementation was no implementation.",
];

export function normalizePrompt(input: string): string {
  const normalized = input.trim().replace(/\s+/g, " ");
  return normalized || DEFAULT_IDEA;
}

function hashString(input: string): number {
  let hash = 2166136261;

  for (const character of input) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function selectLine(pool: string[], seed: number, offset: number) {
  return pool[(seed + offset) % pool.length];
}

function selectSummary(pool: SummaryFactory[], seed: number, offset: number) {
  return pool[(seed + offset) % pool.length]();
}

function selectSteps(seed: number): BuildStep[] {
  const steps: BuildStep[] = [];
  const used = new Set<number>();
  let cursor = seed % STEP_TEMPLATES.length;

  while (steps.length < 4) {
    if (!used.has(cursor)) {
      const template = STEP_TEMPLATES[cursor];

      steps.push({
        id: `${steps.length}-${cursor}`,
        label: template.label,
        detail: template.detail,
        durationMs: 620 + (((seed >> (steps.length * 4)) & 7) + 1) * 90,
      });
      used.add(cursor);
    }

    cursor = (cursor + 3) % STEP_TEMPLATES.length;
  }

  return steps;
}

export function createBuildSession(input: string): BuildSession {
  const prompt = normalizePrompt(input);
  const seed = hashString(prompt.toLowerCase());

  return {
    id: seed.toString(36),
    opener: selectLine(OPENERS, seed, 1),
    steps: selectSteps(seed),
    verdict: selectLine(VERDICTS, seed, 3),
    summary: selectSummary(SUMMARIES, seed, 5),
  };
}
