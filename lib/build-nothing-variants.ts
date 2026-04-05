import type {
  CardTemplate,
  FinalCardTemplate,
  VariantRotationState,
} from "./build-nothing-types";

export const DEFAULT_CARD_DURATION_MS = 8000;

export const DEFAULT_IDEA =
  "an ai startup for people too busy to have a personality";

export const INITIAL_CARD_VARIANTS: CardTemplate[] = [
  {
    key: "claude-vibecode",
    eyebrow: "initial review",
    title: "Asking Claude how to vibecode an app",
    body: "F*ck, I said 'hello' and hit my rate limit. Asking ChatGPT instead.",
  },
  {
    key: "planning-kid",
    eyebrow: "initial review",
    title: "Planning the project in absurd detail",
    body: "This might take  6   or  7   minutes.",
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
    title: "Reading Wikipedia on how to build this shit",
    body: "Do you have $3 by chance? I can't see anything with that big ass banner in my face.",
  },
  {
    key: "obsidian-vault",
    eyebrow: "initial review",
    title: "Mapping out the idea in Obsidian first",
    body: "We need at least 7 million nodes to satisfy the other two Obsidian users.",
    interaction: {
      type: "obsidian-graph",
    },
  },
  {
    key: "benchmark-garbage",
    eyebrow: "initial review",
    title: "Benchmarking your idea against absolut garbage",
    body: "Product design has really peaked. Tough competition.",
    interaction: {
      type: "benchmark-chart",
    },
  },
];

export const MIDDLE_CARD_VARIANTS: CardTemplate[] = [
  {
    key: "smoke-break",
    eyebrow: "workstream",
    title: "Taking a smoke break",
    body: "I'm European, smoking in mandatory here. Naturally though, VAT will be added to this action.",
  },
  {
    key: "skip-step",
    eyebrow: "workstream",
    title: "Skipping this step of the process",
    body: "...which will likely hurt the final product, but I am willing to take that risk at your expense.",
    minPosition: 2,
  },
  {
    key: "redo-last-step",
    eyebrow: "workstream",
    title: "Working on the the previous step",
    body: "I lowkey forgor.",
    minPosition: 2,
  },
  {
    key: "mrbeast",
    eyebrow: "workstream",
    title: "Studying the new MrBeast video",
    body: "Seems like the best way to monetize this product is by giving away $10.000 to random users.",
  },
  {
    key: "yc-speedrun",
    eyebrow: "workstream",
    title: "Watching a YC video at 1.75x speed",
    body: "Absorb as much alpha-guru-founder-larp as possible without taking any of the advice.",
  },
  {
    key: "token-bomb",
    eyebrow: "workstream",
    title: "Can you quickly check if this is a token bomb: \u{1F525}",
    body: "3,000,000 tokens feels like a lot for an emoji.",
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
    body: "Hahahahahahaha just kidding! I want this code to actually run.",
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
    body: "This should save us a few valuable bytes of RAM.",
    lastNPositions: 2,
  },
  {
    key: "refactor-real-quick",
    eyebrow: "workstream",
    title: "Let me large-scale refactor everything real quick",
    body: "Hope you have a working copy as fallback.",
    lastNPositions: 2,
  },
  {
    key: "favicon-bloat",
    eyebrow: "workstream",
    title: "Making the logo slightly bigger",
    body: "This should carry the next sprint.",
    interaction: {
      type: "favicon-bloat",
    },
  },
  {
    key: "waitlist-mom",
    eyebrow: "workstream",
    title: "Building the waitlist",
    body: "Sending your mom an invite to artificially inflate demand. She's a sweetheart.",
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
    title: "Hold up, internet down",
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
    body: "I accidentally ran rm -rf on the entire codebase. Could you redo the whole thing? sowwy >.<",
  },
  {
    key: "own-stack",
    eyebrow: "final result",
    title: "I finished building the app!",
    body: "Unfortunately, the idea was actually pretty good, so I pushed it to my own stack. Sorryyyy. Made like 15 bucks already. I'll leave you some credit if you'd like. :^)",
  },
  {
    key: "anthropic-key",
    eyebrow: "final result",
    title: "I tried building your app...",
    body: "However, my Anthropic account just got nuked. Please provide me with your own Anthropic API key:",
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
    title: "The app has been built! Have a look:",
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
  {
    key: "zip-bomb",
    eyebrow: "final result",
    title: "The download is ready",
    body: "Totally normal archive. Nothing to worry about.",
    interaction: {
      type: "zip-bomb",
      fileName: "source-code.zip",
      fileSize: "182 KB",
    },
  },
];

export const INITIAL_ROTATION_STATE: VariantRotationState = {
  initial: INITIAL_CARD_VARIANTS.map((variant) => variant.key),
  middle: MIDDLE_CARD_VARIANTS.map((variant) => variant.key),
  final: FINAL_CARD_VARIANTS.map((variant) => variant.key),
};
