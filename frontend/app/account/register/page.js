"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

export default function RegisterPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "" });
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signup(form);
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="container-wide py-24 max-w-md text-center">
        <h1 className="font-display text-2xl uppercase mb-4">Check your email</h1>
        <p className="text-sm text-ink/60">We sent a verification link to {form.email}. Verify your email to activate your account.</p>
      </div>
    );
  }

  return (
    <div className="container-wide py-24 max-w-md">
      <h1 className="font-display text-3xl uppercase mb-8">Create Account</h1>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-3">
          <input required placeholder="First name" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="w-1/2 border border-ink/20 px-3 py-3 text-sm" />
          <input required placeholder="Last name" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="w-1/2 border border-ink/20 px-3 py-3 text-sm" />
        </div>
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => update("email", e.target.value)} className="w-full border border-ink/20 px-3 py-3 text-sm" />
        <input placeholder="Phone (optional)" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full border border-ink/20 px-3 py-3 text-sm" />
        <input required type="password" placeholder="Password (min 8 chars, 1 number)" value={form.password} onChange={(e) => update("password", e.target.value)} className="w-full border border-ink/20 px-3 py-3 text-sm" />
        {error && <p className="text-sigma text-sm">{error}</p>}
        <button disabled={loading} className="btn-primary w-full disabled:opacity-40">{loading ? "Creating…" : "Create Account"}</button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <Link href="/account/login" className="underline">Sign in</Link></p>
    </div>
  );
}
