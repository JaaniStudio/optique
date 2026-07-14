import { MessageCircle, MapPin, Mail } from "lucide-react";

export default function ContactPage() {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-16">
      <h1 className="text-3xl font-display font-bold mb-8">Contact Us</h1>
      <div className="space-y-5 text-ink/70">
        <a href={`https://wa.me/${waNumber}`} target="_blank" className="flex items-center gap-3 hover:text-ink">
          <MessageCircle className="h-5 w-5" /> Chat with us on WhatsApp
        </a>
        <div className="flex items-center gap-3"><MapPin className="h-5 w-5" /> Karachi, Pakistan</div>
        <div className="flex items-center gap-3"><Mail className="h-5 w-5" /> hello@optique.pk</div>
      </div>
    </div>
  );
}
