export const metadata = {
  title: "FAQ",
  description: "Frequently asked questions about orders, shipping, returns, and payments at Sigma Cloth Store.",
};

const FAQS = [
  { q: "How long does shipping take?", a: "Standard orders ship within 1-3 business days and typically arrive within 5-9 business days depending on your location." },
  { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, Apple Pay, and Google Pay via Stripe, as well as PayPal, Cash on Delivery, Bank Transfer, EasyPaisa, and JazzCash." },
  { q: "Can I return or exchange an item?", a: "Yes — unworn items with tags attached can be returned within 14 days of delivery. Contact us via the Contact page to start a return." },
  { q: "How do I track my order?", a: "Once your order ships, you'll receive a tracking number by email, and you can also view live status from your Order History page." },
  { q: "Do you ship internationally?", a: "We currently ship to select countries; shipping options and costs are calculated at checkout based on your address." },
];

export default function FAQPage() {
  return (
    <div className="container-wide py-20 max-w-3xl">
      <h1 className="font-display text-4xl uppercase mb-10">Frequently Asked Questions</h1>
      <div className="space-y-8">
        {FAQS.map((f) => (
          <div key={f.q} className="border-b border-ink/10 pb-6">
            <h2 className="font-semibold mb-2">{f.q}</h2>
            <p className="text-ink/70 text-sm">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
