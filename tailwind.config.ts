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
        cream: "#f7f2ea",
        ink: "#221a13",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#221a13",
          foreground: "#f7f2ea",
        },
        secondary: {
          DEFAULT: "#f7f2ea",
          foreground: "#221a13",
        },
        muted: {
          DEFAULT: "#ece4d6",
          foreground: "#5c5346",
        },
        accent: {
          DEFAULT: "#2c241a",
          foreground: "#f7f2ea",
        },
        destructive: {
          DEFAULT: "#b23a2c",
          foreground: "#f7f2ea",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#221a13",
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
