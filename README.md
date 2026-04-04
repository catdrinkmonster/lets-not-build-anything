This is a small Next.js gimmick site that pretends to help you build something, then decides not to.

## Getting Started

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Other useful commands:

```bash
bun test
bun run lint
bun run build
```

The main UI lives in `components/ship-nothing.tsx`, with the fake generation logic in `lib/build-nothing.ts`.

## Notes

- No backend
- No persistence
- Pure client-side fake progress flow

Deploy wherever you want. Vercel is the obvious low-friction option.
