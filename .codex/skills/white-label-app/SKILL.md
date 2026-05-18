---
name: white-label-app
description: White-label and branding workflow for app name, brand colors, theme tokens, manifest, icons, metadata, PWA identity, and brand-safe UI. Use when changing branding or theming.
---

# White-Label App

1. Read `.codex/rules/white-label.md`, `.codex/rules/ui-ux.md`, and PWA rules in `AGENTS.md`.
2. Align `src/app/globals.css`, `src/lib/theme/tokens.ts`, `src/app/layout.tsx`, and `public/manifest.json`.
3. Keep brand colors token-driven; avoid hardcoded brand styles in feature components.
4. Keep PWA icon paths, theme color, app name, and description consistent.
5. Run `pnpm check:pwa` when `public/sw.js` changes and `pnpm build` for production PWA verification when needed.
