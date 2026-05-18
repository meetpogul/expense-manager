# White-Label Rules

- Treat brand identity as shared platform configuration, not feature-local styling.
- Update brand color through CSS variables in `src/app/globals.css` and shared tokens in `src/lib/theme/tokens.ts`.
- Keep app name, description, theme color, icons, and manifest fields aligned across `src/app/layout.tsx` and `public/manifest.json`.
- Avoid hardcoded brand colors or brand copy inside feature components.
- Keep PWA installability intact: valid manifest fields, PNG icons, and matching theme colors.
