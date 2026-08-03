"use client";
import { useState } from "react";
import { api } from "../../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-wide py-24 max-w-md">
      <h1 className="font-display text-3xl uppercase mb-8">Forgot Password</h1>
      {sent ? (
        <p className="text-sm text-ink/60">If an account with that email exists, a reset link has been sent.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-ink/20 px-3 py-3 text-sm" />
          {error && <p className="text-sigma text-sm">{error}</p>}
          <button disabled={loading} className="btn-primary w-full disabled:opacity-40">{loading ? "Sending…" : "Send Reset Link"}</button>
        </form>
      )}
    </div>
  );
}
