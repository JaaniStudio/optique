import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f1f1f1",
        ink: "#080808",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#080808",
          foreground: "#f1f1f1",
        },
        secondary: {
          DEFAULT: "#f1f1f1",
          foreground: "#080808",
        },
        muted: {
          DEFAULT: "#e5e5e5",
          foreground: "#4a4a4a",
        },
        accent: {
          DEFAULT: "#1a1a1a",
          foreground: "#f1f1f1",
        },
        destructive: {
          DEFAULT: "#c0392b",
          foreground: "#f1f1f1",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#080808",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
