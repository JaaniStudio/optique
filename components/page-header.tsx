import { RevealText } from "@/components/reveal-text";

/** Shared editorial page heading used on inner pages for consistency with the home page. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative mb-10 border-b border-ink/10 pb-10 pt-6 md:mb-14 md:pb-14">
      {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <RevealText as="h1" text={title} className="section-title max-w-3xl" />
        {description && <p className="max-w-sm text-ink/60 leading-relaxed">{description}</p>}
      </div>
      {children}
    </div>
  );
}
