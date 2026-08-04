import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const COLOR_HEX: Record<string, string> = {
  black: "#111111",
  white: "#ffffff",
  grey: "#9ca3af",
  gray: "#9ca3af",
  silver: "#c0c0c0",
  gold: "#d4af37",
  brown: "#6d4c41",
  tortoise: "#6b4f3a",
  red: "#ef4444",
  maroon: "#800000",
  blue: "#3b82f6",
  navy: "#1e3a8a",
  green: "#22c55e",
  teal: "#14b8a6",
  yellow: "#eab308",
  orange: "#f97316",
  purple: "#a855f7",
  violet: "#8b5cf6",
  pink: "#ec4899",
  rose: "#f43f5e",
  transparent: "#e2e8f0",
  clear: "#e2e8f0",
  crystal: "#e2e8f0",
  beige: "#e8dcc8",
  cream: "#f5efe0",
};

export function colorToHex(color: string): string {
  const key = color.trim().toLowerCase();
  return COLOR_HEX[key] ?? "#cbd5e1";
}

export function normalizePhone(input: string): string | null {
  let digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("0092")) digits = digits.slice(4);
  if (digits.startsWith("92")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length !== 10 || !digits.startsWith("3")) return null;
  return `+92${digits}`;
}
