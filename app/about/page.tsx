import { Shield, Sparkles, HeartHandshake, Glasses } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-ink to-ink/90 text-cream py-20 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-8 text-center">
          <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cream/10">
            <Glasses className="h-8 w-8" />
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cream/50">Our Story</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">About Chashmish</h1>
          <p className="text-lg md:text-xl text-cream/70 max-w-2xl mx-auto leading-relaxed">
            Karachi-based eyewear bringing you carefully curated sunglasses, eyeglasses,
            and reading glasses — selected for quality, comfort, and everyday style.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-5xl px-4 md:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="aspect-square rounded-2xl bg-gradient-to-br from-ink/10 to-ink/5 flex items-center justify-center">
            <Glasses className="h-24 w-24 text-ink/20" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/40 mb-2">Why We Started</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-ink/70 leading-relaxed">
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
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white border-y border-ink/10">
        <div className="mx-auto max-w-6xl px-4 md:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/40 mb-2">What We Value</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold">Why Shop With Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
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
            ].map((v) => (
              <div key={v.title} className="rounded-2xl border border-ink/10 bg-cream p-8 text-center transition-shadow hover:shadow-md">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-ink text-cream mb-5">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-3">{v.title}</h3>
                <p className="text-ink/60 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3 text-sm font-semibold text-cream transition-colors hover:bg-ink/85"
            >
              Shop Our Collection
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}