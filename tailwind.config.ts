import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#f7f2ea",
        ink: "#221a13",
        sand: "#c9b79c",
        bone: "#ece4d6",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "#221a13", foreground: "#f7f2ea" },
        secondary: { DEFAULT: "#f7f2ea", foreground: "#221a13" },
        muted: { DEFAULT: "#ece4d6", foreground: "#5c5346" },
        accent: { DEFAULT: "#2c241a", foreground: "#f7f2ea" },
        destructive: { DEFAULT: "#b23a2c", foreground: "#f7f2ea" },
        card: { DEFAULT: "#ffffff", foreground: "#221a13" },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(34,26,19,0.04), 0 8px 24px -12px rgba(34,26,19,0.18)",
        lift: "0 30px 60px -25px rgba(34,26,19,0.45)",
        glow: "0 0 0 1px rgba(247,242,234,0.08), 0 20px 80px -20px rgba(201,183,156,0.45)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "marquee-reverse": { from: { transform: "translateX(-50%)" }, to: { transform: "translateX(0)" } },
        shine: { from: { transform: "translateX(-120%) skewX(-20deg)" }, to: { transform: "translateX(220%) skewX(-20deg)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        marquee: "marquee 40s linear infinite",
        "marquee-reverse": "marquee-reverse 40s linear infinite",
        shine: "shine 1.1s cubic-bezier(.2,.7,.2,1)",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 22s linear infinite",
      },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
