"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "../../../lib/api";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const uid = searchParams.get("uid");
    if (!token || !uid) {
      setStatus("error");
      setError("Missing verification details.");
      return;
    }
    api
      .post("/api/auth/verify-email", { token, uid })
      .then(() => setStatus("done"))
      .catch((e) => {
        setStatus("error");
        setError(e.message);
      });
  }, [searchParams]);

  return (
    <div className="container-wide py-24 max-w-md text-center">
      <h1 className="font-display text-2xl uppercase mb-4">Email Verification</h1>
      {status === "verifying" && <p className="text-sm text-ink/60">Verifying your email…</p>}
      {status === "done" && (
        <>
          <p className="text-sm text-ink/60 mb-4">Your email has been verified.</p>
          <Link href="/account/login" className="btn-primary">Sign In</Link>
        </>
      )}
      {status === "error" && <p className="text-sigma text-sm">{error}</p>}
    </div>
  );
}
