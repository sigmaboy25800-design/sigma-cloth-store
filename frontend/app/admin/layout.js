"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/banners", label: "Banners" },
];

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !["ADMIN", "STAFF"].includes(user.role))) {
      router.push("/account/login?redirect=/admin");
    }
  }, [user, loading, router]);

  if (loading || !user || !["ADMIN", "STAFF"].includes(user.role)) return null;

  return (
    <div className="container-wide py-10 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10">
      <aside>
        <h2 className="font-display text-xl uppercase mb-6">Admin</h2>
        <nav className="flex md:flex-col gap-4 flex-wrap text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? "font-semibold underline" : "text-ink/60"}>
              {l.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
