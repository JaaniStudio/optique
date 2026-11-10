import { Star, Quote } from "lucide-react";
import { RevealText } from "@/components/reveal-text";

const testimonials = [
  { name: "Sarah K.", text: "Amazing quality! I've been wearing mine every day and they still look brand new. Highly recommend Chashmish." },
  { name: "Ahmed R.", text: "Great selection and fast delivery. The prescription glasses fit perfectly and the customer service was excellent." },
  { name: "Zara M.", text: "Love my new sunglasses! The style is exactly what I was looking for and the price was very reasonable." },
  { name: "Hassan A.", text: "First time ordering online glasses and I'm impressed. The fit was perfect and they arrived sooner than expected." },
  { name: "Ayesha S.", text: "Been a loyal customer for months. Their collection keeps getting better and the quality never disappoints." },
];

function Card({ t }: { t: (typeof testimonials)[number] }) {
  return (
    <figure className="w-[300px] shrink-0 rounded-3xl border border-ink/10 bg-white/60 p-7 shadow-soft backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-lift md:w-[380px]">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-ink text-ink" />
          ))}
        </div>
        <Quote className="h-6 w-6 text-sand" />
      </div>
      <blockquote className="leading-relaxed text-ink/75">&ldquo;{t.text}&rdquo;</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-sm text-cream">
          {t.name[0]}
        </span>
        <span className="text-sm font-semibold">{t.name}</span>
      </figcaption>
    </figure>
  );
}

/** Two counter-scrolling rows of reviews; pauses on hover. */
export function Testimonials() {
  const row = [...testimonials, ...testimonials];
  return (
    <section className="overflow-hidden py-24 md:py-32">
      <div className="mx-auto mb-14 max-w-7xl px-4 md:px-8">
        <p className="eyebrow mb-4">Kind words</p>
        <RevealText text="Loved across Karachi" className="section-title" />
      </div>
      <div className="space-y-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        {[false, true].map((reverse) => (
          <div key={String(reverse)} className="group flex overflow-hidden">
            <div
              className={`flex w-max gap-6 pr-6 group-hover:[animation-play-state:paused] ${
                reverse ? "animate-marquee-reverse" : "animate-marquee"
              }`}
            >
              {[...row, ...row].map((t, i) => (
                <Card key={i} t={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
