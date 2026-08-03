export const metadata = {
  title: "About Us",
  description: "Learn about Sigma Cloth Store — our story, our craft, and our commitment to quality.",
};

export default function AboutPage() {
  return (
    <div className="container-wide py-20 max-w-3xl">
      <p className="eyebrow mb-2">Our Story</p>
      <h1 className="font-display text-4xl uppercase mb-8">About Sigma Cloth Store</h1>
      <div className="space-y-5 text-ink/70 leading-relaxed">
        <p>
          Sigma Cloth Store was founded on a simple idea: clothing should be built to last, fit with
          intent, and feel as good a year from now as it does the day you unbox it.
        </p>
        <p>
          Every piece in our core collection goes through fabric testing, fit sampling, and quality
          control before it reaches the shop floor. We work with a small number of mills to keep
          quality consistent and lead times honest.
        </p>
        <p>
          We're a small, independent team — every order is packed and shipped by people who actually
          care whether it arrives on time and in one piece.
        </p>
      </div>
    </div>
  );
}
