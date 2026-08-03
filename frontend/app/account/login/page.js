"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form.email, form.password);
      router.push(searchParams.get("redirect") || "/account/profile");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-wide py-24 max-w-md">
      <h1 className="font-display text-3xl uppercase mb-8">Sign In</h1>
      <form onSubmit={submit} className="space-y-4">
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full border border-ink/20 px-3 py-3 text-sm" />
        <input required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="w-full border border-ink/20 px-3 py-3 text-sm" />
        {error && <p className="text-sigma text-sm">{error}</p>}
        <button disabled={loading} className="btn-primary w-full disabled:opacity-40">{loading ? "Signing in…" : "Sign In"}</button>
      </form>
      <div className="flex justify-between mt-4 text-sm">
        <Link href="/account/forgot-password" className="underline">Forgot password?</Link>
        <Link href="/account/register" className="underline">Create account</Link>
      </div>
    </div>
  );
}
