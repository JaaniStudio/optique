import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-ink to-ink/90 text-cream py-20 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-8 text-center">
          <FileText className="h-10 w-10 mx-auto mb-6 opacity-60" />
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Terms &amp; Conditions</h1>
          <p className="text-lg text-cream/70 max-w-xl mx-auto">
            Please read these terms carefully before ordering from Chashmish.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 md:px-8 py-16">
        <div className="space-y-10 text-ink/80 leading-relaxed">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">1. Orders &amp; Payment</h2>
            <p>
              All orders are confirmed once you submit your details through our checkout and we
              receive your payment via bank transfer. Once we receive your payment confirmation on
              WhatsApp, your order is processed and prepared for delivery.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">2. Pricing</h2>
            <p>
              All prices are listed in Pakistani Rupees (PKR) and include applicable charges unless
              stated otherwise. We reserve the right to update prices at any time without prior notice.
              The price at the time of your order is the price you pay.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">3. Shipping &amp; Delivery</h2>
            <p>
              We deliver across Pakistan. Delivery times may vary depending on your location. Once your
              order is dispatched, we share the tracking details with you on WhatsApp. We are not
              responsible for delays caused by the courier service.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">4. Returns &amp; Exchanges</h2>
            <p>
              If your product is damaged or defective on arrival, contact us within 7 days of delivery
              on WhatsApp with your order number and photos. Approved returns can be exchanged for the
              same product or store credit, subject to stock availability.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">5. Product Availability</h2>
            <p>
              While we try to keep our catalogue accurate, occasionally an item you order may be out of
              stock. In that case we will contact you to offer a replacement or a refund.
            </p>
          </div>

          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">6. Contact</h2>
            <p>
              For any questions about these terms, reach out to us on WhatsApp or at{" "}
              <span className="text-ink font-medium">hello@chashmish.pk</span>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
