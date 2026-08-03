"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "../../../lib/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/api/auth/reset-password", {
        uid: searchParams.get("uid"),
        token: searchParams.get("token"),
        password,
      });
      setDone(true);
      setTimeout(() => router.push("/account/login"), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-wide py-24 max-w-md">
      <h1 className="font-display text-3xl uppercase mb-8">Reset Password</h1>
      {done ? (
        <p className="text-sm text-ink/60">Password reset. Redirecting to sign in…</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <input required type="password" placeholder="New password (min 8 chars, 1 number)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-ink/20 px-3 py-3 text-sm" />
          {error && <p className="text-sigma text-sm">{error}</p>}
          <button disabled={loading} className="btn-primary w-full disabled:opacity-40">{loading ? "Saving…" : "Reset Password"}</button>
        </form>
      )}
    </div>
  );
}
