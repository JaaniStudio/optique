import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-ink to-ink/90 text-cream py-20 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-8 text-center">
          <ShieldCheck className="h-10 w-10 mx-auto mb-6 opacity-60" />
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Privacy Policy</h1>
          <p className="text-lg text-cream/70 max-w-xl mx-auto">
            Your privacy matters to us at Chashmish. Here's how we handle your data.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 md:px-8 py-16">
        <div className="space-y-10 text-ink/80 leading-relaxed">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">1. Information We Collect</h2>
            <p>
              When you create an account or place an order, we collect the information you provide:
              your name, email address, phone number, shipping address, and order details. This
              information is used only to process and deliver your orders.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">2. How We Use Your Information</h2>
            <p>
              We use your details to confirm orders, arrange delivery, respond to your questions, and
              keep you updated about your order status. We do not sell, rent, or share your personal
              information with third parties for marketing purposes.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">3. Payment &amp; Banking</h2>
            <p>
              We do not store your bank account or card details. All payments are made through your own
              bank transfer, and we never ask for your banking passwords or PINs.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">4. Data Security</h2>
            <p>
              We take reasonable measures to protect your information and restrict access to it. Your
              account is protected by your login, and only authorised staff can see order details.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">5. Your Choices</h2>
            <p>
              You can update your account information anytime. If you would like your data removed,
              contact us on WhatsApp or at{" "}
              <span className="text-ink font-medium">hello@chashmish.pk</span> and we'll help you.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">6. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Any changes will be reflected on this page,
              so please check back occasionally.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
