import { cn, colorToHex } from "@/lib/utils";

type Props = {
  colors: string[] | null | undefined;
  size?: "sm" | "md";
  showNames?: boolean;
  className?: string;
};

export function ColorSwatches({ colors, size = "md", showNames = true, className }: Props) {
  if (!colors || colors.length === 0) return null;
  const dotSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {colors.map((color, i) => (
        <span
          key={i}
          title={color}
          className="inline-flex items-center gap-1.5 text-xs text-ink/60"
        >
          <span
            className={`${dotSize} rounded-full border border-ink/15 shrink-0`}
            style={{ backgroundColor: colorToHex(color) }}
          />
          {showNames && <span>{color}</span>}
        </span>
      ))}
    </div>
  );
}
