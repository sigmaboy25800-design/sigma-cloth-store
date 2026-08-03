import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["400", "600", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sigma Cloth Store — Premium Streetwear & Essentials",
    template: "%s | Sigma Cloth Store",
  },
  description:
    "Sigma Cloth Store — tailored streetwear and everyday essentials. Shop new arrivals, core basics, and limited drops with fast worldwide shipping.",
  keywords: ["Sigma Cloth Store", "streetwear", "clothing brand", "online fashion store"],
  openGraph: {
    type: "website",
    siteName: "Sigma Cloth Store",
    title: "Sigma Cloth Store — Premium Streetwear & Essentials",
    description: "Tailored streetwear and everyday essentials, shipped worldwide.",
    url: siteUrl,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sigma Cloth Store",
    description: "Tailored streetwear and everyday essentials, shipped worldwide.",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  alternates: { canonical: siteUrl },
};

export const viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "Sigma Cloth Store",
    url: siteUrl,
    sameAs: [
      process.env.NEXT_PUBLIC_INSTAGRAM_URL,
      process.env.NEXT_PUBLIC_FACEBOOK_URL,
      process.env.NEXT_PUBLIC_TIKTOK_URL,
      process.env.NEXT_PUBLIC_YOUTUBE_URL,
    ].filter(Boolean),
  };

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="min-h-[60vh]">{children}</main>
            <Footer />
            <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
