"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "../lib/api";

// The official Sigma Cloth Store Facebook page. NEXT_PUBLIC_FACEBOOK_URL can
// override this in .env, but the button must never be a dead link, so we
// always fall back to the real profile if the env var isn't set.
const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/profile.php?id=61592511905411";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  async function subscribe(e) {
    e.preventDefault();
    setStatus("loading");
    try {
      // Newsletter signups reuse the coupon/marketing email list on the
      // backend; swap this for your ESP (Mailchimp/Klaviyo) endpoint if preferred.
      await api.post("/api/newsletter/subscribe", { email }).catch(() => {});
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="bg-ink text-bone mt-24">
      <div className="container-wide py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-xl uppercase tracking-widest2 mb-4">Sigma</h3>
          <p className="text-bone/60 text-sm max-w-xs">
            Tailored streetwear and everyday essentials, designed to last.
          </p>
        </div>

        <div>
          <h4 className="eyebrow text-bone/50 mb-4">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop/men" className="hover:text-sigma-light">Men</Link></li>
            <li><Link href="/shop/women" className="hover:text-sigma-light">Women</Link></li>
            <li><Link href="/shop/kids" className="hover:text-sigma-light">Kids</Link></li>
            <li><Link href="/shop/accessories" className="hover:text-sigma-light">Accessories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-bone/50 mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-sigma-light">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-sigma-light">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-sigma-light">FAQ</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-sigma-light">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-sigma-light">Terms &amp; Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-bone/50 mb-4">Stay in the loop</h4>
          <form onSubmit={subscribe} className="flex">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="bg-transparent border border-bone/30 px-3 py-2 text-sm flex-1 focus:outline-none"
            />
            <button className="bg-sigma px-4 text-sm uppercase tracking-wide">Join</button>
          </form>
          {status === "done" && <p className="text-xs text-bone/50 mt-2">Thanks — check your inbox to confirm.</p>}
          <div className="flex gap-4 mt-6 text-sm">
            {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
              <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a>
            )}
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">Facebook</a>
            {process.env.NEXT_PUBLIC_TIKTOK_URL && (
              <a href={process.env.NEXT_PUBLIC_TIKTOK_URL} target="_blank" rel="noopener noreferrer">TikTok</a>
            )}
            {process.env.NEXT_PUBLIC_YOUTUBE_URL && (
              <a href={process.env.NEXT_PUBLIC_YOUTUBE_URL} target="_blank" rel="noopener noreferrer">YouTube</a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-bone/10 py-6 text-center text-xs text-bone/40">
        © {new Date().getFullYear()} Sigma Cloth Store. All rights reserved.
      </div>
    </footer>
  );
}
