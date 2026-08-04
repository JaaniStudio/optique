"use client";

import { useState } from "react";
import { MessageCircle, MapPin, Mail, Clock, Send, AlertCircle, CheckCircle2 } from "lucide-react";

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

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-ink to-ink/90 text-cream py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-cream/50">We're here to help</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Get in Touch</h1>
          <p className="text-lg text-cream/70 max-w-xl mx-auto">
            Have a question? Need help choosing? Send us a message and we'll get back to you.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="mx-auto max-w-6xl px-4 md:px-8 -mt-10 relative z-10">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: MessageCircle,
              title: "WhatsApp",
              value: "Fastest way to reach us",
              href: `https://wa.me/${waNumber}`,
              label: "Start Chat",
            },
            {
              icon: Mail,
              title: "Email",
              value: "hello@chashmish.pk",
              href: "mailto:hello@chashmish.pk",
              label: "Send Email",
            },
            {
              icon: MapPin,
              title: "Location",
              value: "Karachi, Pakistan",
              href: null,
              label: null,
            },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-ink/10 bg-white p-6 text-center shadow-sm">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-ink text-cream mb-4">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1">{c.title}</h3>
              <p className="text-sm text-ink/50 mb-4">{c.value}</p>
              {c.href && (
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-semibold text-ink underline underline-offset-4 hover:no-underline"
                >
                  {c.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Form + info */}
      <section className="mx-auto max-w-6xl px-4 md:px-8 py-20">
        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/40 mb-2">Leave a Message</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Send us a note</h2>
            <p className="text-ink/60 leading-relaxed mb-6">
              Fill in the form and we'll reply as soon as possible. For urgent questions,
              WhatsApp is always the fastest option.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-ink/5 px-4 py-3">
                <Clock className="h-5 w-5 text-ink/50" />
                <div>
                  <p className="text-sm font-semibold">Quick Response</p>
                  <p className="text-xs text-ink/50">We reply within a few hours during business time.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            {!formspreeId ? (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
                <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold">Form not connected yet</p>
                  <p className="opacity-80">
                    Set your Formspree ID via the <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_FORMSPREE_ID</code>{" "}
                    environment variable and the form will start working.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-ink/10 bg-white p-6 md:p-8 shadow-sm space-y-5">
                <h3 className="font-display font-bold text-xl">Contact Form</h3>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Name</label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Email</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Message</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help?"
                    rows={5}
                    className="w-full rounded-md border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none placeholder:text-ink/40 focus:ring-1 focus:ring-ink"
                  />
                </div>

                {status === "success" && (
                  <p className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2 className="h-5 w-5" /> Thanks! Your message has been sent. We'll be in touch shortly.
                  </p>
                )}
                {status === "error" && (
                  <p className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5" /> Something went wrong. Please try again, or reach us on WhatsApp.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3 text-sm font-semibold text-cream transition-colors hover:bg-ink/85 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}