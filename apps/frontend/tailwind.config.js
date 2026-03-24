/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      colors: {
        border: "hsl(var(--border-hsl))",
        input: "hsl(var(--border-hsl))",
        ring: "hsl(var(--ring-hsl))",
        background: "hsl(var(--bg-hsl))",
        foreground: "hsl(var(--ink-hsl))",
        primary: {
          DEFAULT: "hsl(var(--accent-hsl))",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "hsl(var(--surface-alt-hsl))",
          foreground: "hsl(var(--ink-hsl))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive-hsl))",
          foreground: "hsl(var(--destructive-foreground-hsl))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted-hsl))",
          foreground: "hsl(var(--ink-muted-hsl))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent-hsl))",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "hsl(var(--surface-hsl))",
          foreground: "hsl(var(--ink-hsl))",
        },
        card: {
          DEFAULT: "hsl(var(--surface-hsl))",
          foreground: "hsl(var(--ink-hsl))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
