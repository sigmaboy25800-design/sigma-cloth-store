export const metadata = {
  title: "Privacy Policy",
  description: "How Sigma Cloth Store collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-wide py-20 max-w-3xl text-ink/70 leading-relaxed space-y-6">
      <h1 className="font-display text-4xl uppercase mb-8 text-ink">Privacy Policy</h1>
      <p>Last updated: {new Date().getFullYear()}</p>
      <section>
        <h2 className="font-semibold text-ink mb-2">Information We Collect</h2>
        <p>We collect information you provide directly — name, email, shipping address, phone number,
        and order details — as well as basic usage data to keep the store secure and improve performance.</p>
      </section>
      <section>
        <h2 className="font-semibold text-ink mb-2">How We Use Your Information</h2>
        <p>We use your information to process orders, provide customer support, send order and shipping
        updates, and — only with your consent via newsletter signup — send marketing emails.</p>
      </section>
      <section>
        <h2 className="font-semibold text-ink mb-2">Payment Information</h2>
        <p>Card payments are processed directly by Stripe and PayPal; we never store your full card
        number on our servers.</p>
      </section>
      <section>
        <h2 className="font-semibold text-ink mb-2">Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data at any time by
        contacting us through the Contact page.</p>
      </section>
      <p className="text-sm">
        This is starter policy text — please have it reviewed by a lawyer familiar with your
        jurisdiction (e.g. GDPR, CCPA) before going live.
      </p>
    </div>
  );
}
