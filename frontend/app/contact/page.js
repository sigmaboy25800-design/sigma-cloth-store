"use client";
import { useState } from "react";
import { api } from "../../lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.post("/api/contact", form).catch(() => {});
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="container-wide py-20 max-w-xl">
      <h1 className="font-display text-4xl uppercase mb-4">Contact Us</h1>
      <p className="text-ink/60 mb-10 text-sm">
        Questions about an order, sizing, or a partnership? Send us a message and we'll get back to
        you within 1-2 business days — or reach us instantly on WhatsApp using the button in the corner.
      </p>
      {status === "sent" ? (
        <p className="text-sm">Thanks — we've received your message.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-ink/20 px-3 py-3 text-sm" />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full border border-ink/20 px-3 py-3 text-sm" />
          <textarea required rows={5} placeholder="Message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="w-full border border-ink/20 px-3 py-3 text-sm" />
          <button disabled={status === "sending"} className="btn-primary">{status === "sending" ? "Sending…" : "Send Message"}</button>
        </form>
      )}
    </div>
  );
}
