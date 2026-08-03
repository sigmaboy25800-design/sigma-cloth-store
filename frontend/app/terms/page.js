export const metadata = {
  title: "Terms & Conditions",
  description: "The terms and conditions governing purchases and use of the Sigma Cloth Store website.",
};

export default function TermsPage() {
  return (
    <div className="container-wide py-20 max-w-3xl text-ink/70 leading-relaxed space-y-6">
      <h1 className="font-display text-4xl uppercase mb-8 text-ink">Terms &amp; Conditions</h1>
      <p>Last updated: {new Date().getFullYear()}</p>
      <section>
        <h2 className="font-semibold text-ink mb-2">Orders &amp; Payment</h2>
        <p>By placing an order you confirm the shipping and payment details provided are accurate. All
        prices are listed in USD unless otherwise stated and are subject to change without notice.</p>
      </section>
      <section>
        <h2 className="font-semibold text-ink mb-2">Shipping</h2>
        <p>Estimated delivery times are provided at checkout and are not guaranteed. Sigma Cloth Store
        is not responsible for delays caused by the shipping carrier or customs.</p>
      </section>
      <section>
        <h2 className="font-semibold text-ink mb-2">Returns</h2>
        <p>Unworn items with original tags may be returned within 14 days of delivery for a refund or
        exchange, subject to the conditions described on our FAQ page.</p>
      </section>
      <section>
        <h2 className="font-semibold text-ink mb-2">Limitation of Liability</h2>
        <p>Sigma Cloth Store's liability for any claim relating to a purchase is limited to the amount
        paid for the item(s) in question.</p>
      </section>
      <p className="text-sm">
        This is starter terms text — please have it reviewed by a lawyer before going live.
      </p>
    </div>
  );
}
