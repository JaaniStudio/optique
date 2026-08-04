import { MessageCircle, MapPin, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-ink to-ink/90 text-cream py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-4 md:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Get in Touch</h1>
          <p className="text-lg text-cream/70 max-w-xl mx-auto">
            Have a question? Need help choosing? We're here for you.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="mx-auto max-w-5xl px-4 md:px-8 -mt-10 relative z-10">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: MessageCircle,
              title: "WhatsApp",
              value: "Chat with us",
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
            <div key={c.title} className="bg-white rounded-xl border border-ink/10 p-6 text-center shadow-sm">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-ink/5 mb-4">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-1">{c.title}</h3>
              <p className="text-sm text-ink/50 mb-4">{c.value}</p>
              {c.href && (
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-medium text-ink underline underline-offset-4 hover:no-underline"
                >
                  {c.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Response time */}
      <section className="mx-auto max-w-3xl px-4 md:px-8 py-20 text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-ink/5 mb-5">
          <Clock className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-display font-bold mb-3">Quick Response</h2>
        <p className="text-ink/60 max-w-md mx-auto leading-relaxed">
          We typically respond within a few hours during business hours.
          For the fastest reply, reach out to us on WhatsApp.
        </p>
      </section>
    </div>
  );
}
