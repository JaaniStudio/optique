import Link from "next/link";
import { Shield, Sparkles, HeartHandshake, Glasses, ArrowRight } from "lucide-react";
import { FadeIn, FadeInItem, FadeInStagger } from "@/components/fade-in";
import { RevealText } from "@/components/reveal-text";
import { Marquee } from "@/components/marquee";
import { ParallaxHero } from "@/components/parallax-hero";
import { TiltCard } from "@/components/tilt-card";

const values = [
  {
    icon: Shield,
    title: "Quality First",
    desc: "Every frame is handpicked and tested for durability, comfort, and style. We stand behind what we sell.",
  },
  {
    icon: Sparkles,
    title: "Curated Selection",
    desc: "We don't just stock everything — we carefully select each piece to ensure it meets our standards.",
  },
  {
    icon: HeartHandshake,
    title: "Personal Service",
    desc: "Order with confidence. Our WhatsApp-based support means you get real help from real people, fast.",
  },
];

const steps = [
  { n: "01", title: "Browse", desc: "Pick the frame that feels like you from our curated collections." },
  { n: "02", title: "Order", desc: "Place your order and pay directly via bank transfer." },
  { n: "03", title: "Confirm", desc: "Send your payment screenshot on WhatsApp — we take it from there." },
];

export default function AboutPage() {
  return (
    <div>
      <ParallaxHero bigWord="Chashmish">
        <FadeIn>
          <div className="mx-auto mb-8 inline-flex h-16 w-16 animate-float items-center justify-center rounded-2xl border border-cream/15 bg-cream/5 backdrop-blur">
            <Glasses className="h-8 w-8" />
          </div>
        </FadeIn>
        <p className="eyebrow mb-6 justify-center text-cream/50">Our Story</p>
        <RevealText as="h1" text="About Chashmish" className="font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-8xl" />
        <FadeIn delay={0.3}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-cream/70 md:text-xl">
            Karachi-based eyewear bringing you carefully curated sunglasses, eyeglasses,
            and reading glasses — selected for quality, comfort, and everyday style.
          </p>
        </FadeIn>
      </ParallaxHero>

      <div className="border-b border-ink/10 bg-cream py-5 font-display text-2xl italic text-ink/80 md:text-3xl">
        <Marquee items={["Handpicked frames", "Honest prices", "Made for Karachi", "Real people, real help"]} />
      </div>

      {/* Story */}
      <section className="mx-auto max-w-6xl px-4 py-24 md:px-8 md:py-32">
        <div className="grid items-center gap-14 md:grid-cols-2">
          <FadeIn>
            <div className="perspective">
              <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-ink shadow-lift">
                <div className="absolute inset-0 bg-gradient-to-br from-accent via-ink to-black" />
                <div className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border border-dashed border-cream/15" />
                <div className="absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cream/10" />
                <Glasses className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 animate-float text-cream/80" strokeWidth={1} />
                <p className="absolute bottom-6 left-6 font-display text-sm italic text-cream/60">Est. in Karachi</p>
              </div>
            </div>
          </FadeIn>
          <div>
            <p className="eyebrow mb-5">Why We Started</p>
            <RevealText text="Great eyewear shouldn't be complicated." className="section-title" />
            <FadeIn delay={0.2}>
              <div className="mt-8 space-y-5 leading-relaxed text-ink/70">
                <p>
                  Chashmish was born from a simple belief: great eyewear shouldn't be complicated.
                  We started with a small collection of handpicked frames and grew into a
                  go-to destination for quality glasses in Pakistan.
                </p>
                <p>
                  Every pair we stock is selected for its build quality, comfort, and timeless
                  style. We work directly with trusted manufacturers to bring you premium
                  eyewear at honest prices.
                </p>
                <p>
                  We keep things simple: browse, order, and pay directly via bank transfer.
                  Send your payment confirmation over WhatsApp and we'll get your order on its way.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-ink py-24 text-cream md:py-32">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mb-14 text-center">
            <p className="eyebrow mb-5 justify-center text-cream/50">What We Value</p>
            <RevealText text="Why shop with us" className="section-title" />
          </div>
          <FadeInStagger className="grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <FadeInItem key={v.title}>
                <TiltCard className="rounded-[1.75rem] border border-cream/10 bg-cream/[0.04] p-8 md:p-10">
                  <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-full bg-cream text-ink" style={{ transform: "translateZ(40px)" }}>
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 font-display text-2xl font-bold" style={{ transform: "translateZ(30px)" }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed text-cream/60">{v.desc}</p>
                </TiltCard>
              </FadeInItem>
            ))}
          </FadeInStagger>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-24 md:px-8 md:py-32">
        <div className="mb-14">
          <p className="eyebrow mb-5">How it works</p>
          <RevealText text="Three simple steps" className="section-title" />
        </div>
        <FadeInStagger className="grid border-t border-ink/10 md:grid-cols-3">
          {steps.map((s) => (
            <FadeInItem key={s.n}>
              <div className="group border-b border-ink/10 py-10 md:border-b-0 md:border-r md:px-8 md:last:border-r-0 md:first:pl-0">
                <p className="text-outline font-display text-7xl font-bold text-ink/30 transition-colors duration-500 group-hover:text-ink">{s.n}</p>
                <h3 className="mt-6 font-display text-2xl font-bold">{s.title}</h3>
                <p className="mt-3 text-ink/60">{s.desc}</p>
              </div>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden px-4 pb-28 text-center md:pb-36">
        <RevealText text="Find the frame that feels like you." className="section-title mx-auto max-w-3xl" />
        <FadeIn delay={0.3} className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/products" className="btn-pill btn-ink">
            Shop our collection <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="btn-pill btn-ghost">Talk to us</Link>
        </FadeIn>
      </section>
    </div>
  );
}
