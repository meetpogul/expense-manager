export const themeTokens = {
  radius: {
    sm: "calc(var(--radius) - 4px)",
    md: "calc(var(--radius) - 2px)",
    lg: "var(--radius)",
    xl: "calc(var(--radius) + 4px)",
  },
  spacing: {
    shell: "var(--spacing-shell)",
    section: "var(--spacing-section)",
  },
  typography: {
    sans: "var(--font-geist-sans)",
    mono: "var(--font-geist-mono)",
  },
} as const;
