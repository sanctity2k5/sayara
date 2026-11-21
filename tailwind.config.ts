import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        elevated: "rgb(var(--color-elevated) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        signal: "rgb(var(--color-signal) / <alpha-value>)",
        "signal-hover": "rgb(var(--color-signal-hover) / <alpha-value>)",
        champagne: "rgb(var(--color-champagne) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(2.75rem, 6.5vw, 5.75rem)", { lineHeight: "0.96", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.1rem, 4.2vw, 3.75rem)", { lineHeight: "1.02", letterSpacing: "-0.025em" }],
        "display-md": ["clamp(1.6rem, 2.6vw, 2.35rem)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      spacing: {
        "section-sm": "var(--space-section-sm)",
        "section-lg": "var(--space-section-lg)",
      },
      boxShadow: {
        elevated: "0 20px 50px -24px rgba(0, 0, 0, 0.55)",
      },
    },
  },
  plugins: [],
};

export default config;
