import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "outline" | "sale" | "success" | "warning" }) {
  const variants = {
    default: "bg-ink text-cream",
    outline: "border border-ink/20 text-ink bg-transparent",
    sale: "bg-red-600 text-white",
    success: "bg-green-700 text-white",
    warning: "bg-yellow-500 text-black",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
