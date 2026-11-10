"use client";

import { useState } from "react";
import { MessageCircle, MapPin, Mail, Clock, Send, AlertCircle, CheckCircle2, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { ParallaxHero } from "@/components/parallax-hero";
import { RevealText } from "@/components/reveal-text";
import { FadeIn, FadeInItem, FadeInStagger } from "@/components/fade-in";
import { TiltCard } from "@/components/tilt-card";

export default function ContactPage() {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const formspreeId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formspreeId) return;
    setSending(true);
    setStatus("idle");
    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        setStatus("success");
        setName(""); setEmail(""); setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
    }
  }

  const field =
    "peer w-full rounded-2xl border border-ink/15 bg-cream/40 px-4 pb-2.5 pt-6 text-sm outline-none transition-all duration-300 placeholder:text-transparent focus:border-ink focus:bg-white focus:shadow-soft";
  const floatLabel =
    "pointer-events-none absolute left-4 top-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/45 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:font-normal peer-focus:top-2 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-[0.18em]";

  const cards = [
    { icon: MessageCircle, title: "WhatsApp", value: "Fastest way to reach us", href: `https://wa.me/${waNumber}`, label: "Start Chat" },
    { icon: Mail, title: "Email", value: "hello@chashmish.pk", href: "mailto:hello@chashmish.pk", label: "Send Email" },
    { icon: MapPin, title: "Location", value: "Karachi, Pakistan", href: null, label: null },
  ];

  return (
    <div>
      <ParallaxHero bigWord="Hello">
        <p className="eyebrow mb-6 justify-center text-cream/50">We're here to help</p>
        <RevealText as="h1" text="Get in touch" className="font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-8xl" />
        <FadeIn delay={0.3}>
          <p className="mx-auto mt-8 max-w-xl text-lg text-cream/70">
            Have a question? Need help choosing? Send us a message and we'll get back to you.
          </p>
        </FadeIn>
      </ParallaxHero>

      {/* Contact cards */}
      <section className="relative z-10 mx-auto -mt-20 max-w-6xl px-4 md:px-8">
        <FadeInStagger className="grid gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <FadeInItem key={c.title}>
              <TiltCard className="group rounded-[1.75rem] border border-ink/10 bg-white p-7 shadow-soft">
                <div className="flex items-start justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink text-cream transition-transform duration-500 ease-expo group-hover:scale-110" style={{ transform: "translateZ(30px)" }}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  {c.href && (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 transition-all duration-500 ease-expo group-hover:rotate-45 group-hover:bg-ink group-hover:text-cream">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <h3 className="mt-8 font-display text-2xl font-bold">{c.title}</h3>
                <p className="mt-1 text-sm text-ink/55">{c.value}</p>
                {c.href && (
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline mt-5 inline-block text-sm font-semibold after:absolute after:inset-0 after:content-['']"
                  >
                    {c.label}
                  </a>
                )}
              </TiltCard>
            </FadeInItem>
          ))}
        </FadeInStagger>
      </section>

      {/* Form + info */}
      <section className="mx-auto max-w-6xl px-4 py-24 md:px-8 md:py-32">
        <div className="grid items-start gap-12 md:grid-cols-5">
          <div className="md:sticky md:top-28 md:col-span-2">
            <p className="eyebrow mb-5">Leave a Message</p>
            <RevealText text="Send us a note" className="section-title" />
            <FadeIn delay={0.2}>
              <p className="mb-8 mt-6 leading-relaxed text-ink/60">
                Fill in the form and we'll reply as soon as possible. For urgent questions,
                WhatsApp is always the fastest option.
              </p>
              <div className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white/60 px-5 py-4 backdrop-blur">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink text-cream">
                  <Clock className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-ping rounded-full bg-green-500/70" />
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-green-500" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Quick Response</p>
                  <p className="text-xs text-ink/50">We reply within a few hours during business time.</p>
                </div>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.15} className="md:col-span-3">
            {!formspreeId ? (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Form not connected yet</p>
                  <p className="opacity-80">
                    Set your Formspree ID via the <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_FORMSPREE_ID</code>{" "}
                    environment variable and the form will start working.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-soft md:p-10">
                <h3 className="font-display text-2xl font-bold">Contact Form</h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="relative">
                    <input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
                    <label htmlFor="c-name" className={floatLabel}>Name</label>
                  </div>
                  <div className="relative">
                    <input id="c-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={field} />
                    <label htmlFor="c-email" className={floatLabel}>Email</label>
                  </div>
                </div>
                <div className="relative">
                  <textarea id="c-msg" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" rows={6} className={`${field} resize-none`} />
                  <label htmlFor="c-msg" className={floatLabel}>Message</label>
                </div>

                {status === "success" && (
                  <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2 className="h-5 w-5" /> Thanks! Your message has been sent. We'll be in touch shortly.
                  </motion.p>
                )}
                {status === "error" && (
                  <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5" /> Something went wrong. Please try again, or reach us on WhatsApp.
                  </motion.p>
                )}

                <button type="submit" disabled={sending} className="btn-pill btn-ink w-full disabled:opacity-60 md:w-auto">
                  <Send className={`h-4 w-4 transition-transform duration-500 ${sending ? "translate-x-1 -translate-y-1" : ""}`} />
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
