import { Sparkle } from "lucide-react";

/** Infinite scrolling ticker. Server-safe (pure CSS animation). */
export function Marquee({
  items,
  reverse = false,
  className = "",
}: {
  items: string[];
  reverse?: boolean;
  className?: string;
}) {
  const group = [...items, ...items];
  const Half = ({ hidden = false }: { hidden?: boolean }) => (
    <div aria-hidden={hidden} className="flex shrink-0 items-center">
      {group.map((t, i) => (
        <span key={i} className="flex items-center gap-6 whitespace-nowrap pr-6 md:gap-8 md:pr-8">
          <span>{t}</span>
          <Sparkle className="h-3 w-3 shrink-0 opacity-50" />
        </span>
      ))}
    </div>
  );
  return (
    <div
      className={`ticker relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] ${className}`}
    >
      <div className={`ticker-track flex w-max ${reverse ? "ticker-reverse" : ""}`}>
        <Half />
        <Half hidden />
      </div>
    </div>
  );
}
