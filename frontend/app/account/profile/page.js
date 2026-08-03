"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";
import AddressForm from "../../../components/AddressForm";

export default function ProfilePage() {
  const { user, loading, logout, setUser } = useAuth();
  const router = useRouter();
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push("/account/login?redirect=/account/profile");
    if (user) {
      setProfileForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || "" });
      api.get("/api/users/me/addresses").then(setAddresses);
    }
  }, [user, loading, router]);

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const updated = await api.put("/api/users/me", profileForm);
      setUser((u) => ({ ...u, ...updated }));
      setMessage({ type: "ok", text: "Profile updated." });
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    try {
      await api.post("/api/auth/change-password", passwordForm);
      setMessage({ type: "ok", text: "Password changed. Please sign in again." });
      setTimeout(() => logout().then(() => router.push("/account/login")), 1200);
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    }
  }

  if (!user) return null;

  return (
    <div className="container-wide py-12 max-w-2xl space-y-16">
      <div>
        <h1 className="font-display text-3xl uppercase mb-8">My Account</h1>
        <nav className="flex gap-6 text-sm mb-8">
          <span className="font-semibold underline">Profile</span>
          <Link href="/account/orders" className="text-ink/60 hover:text-ink">Order History</Link>
          <button onClick={() => logout().then(() => router.push("/"))} className="text-ink/60 hover:text-ink">Logout</button>
        </nav>
      </div>

      {message && <p className={message.type === "error" ? "text-sigma text-sm" : "text-sm text-ink/60"}>{message.text}</p>}

      <section>
        <h2 className="font-display text-xl uppercase mb-4">Edit Profile</h2>
        <form onSubmit={saveProfile} className="space-y-3 max-w-sm">
          <input value={profileForm.firstName} onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))} className="w-full border border-ink/20 px-3 py-2 text-sm" placeholder="First name" />
          <input value={profileForm.lastName} onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))} className="w-full border border-ink/20 px-3 py-2 text-sm" placeholder="Last name" />
          <input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} className="w-full border border-ink/20 px-3 py-2 text-sm" placeholder="Phone" />
          <button className="btn-outline">Save Changes</button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl uppercase mb-4">Change Password</h2>
        <form onSubmit={changePassword} className="space-y-3 max-w-sm">
          <input type="password" required placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))} className="w-full border border-ink/20 px-3 py-2 text-sm" />
          <input type="password" required placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))} className="w-full border border-ink/20 px-3 py-2 text-sm" />
          <button className="btn-outline">Update Password</button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl uppercase mb-4">Addresses</h2>
        <div className="space-y-3 mb-4">
          {addresses.map((a) => (
            <div key={a.id} className="border border-ink/15 p-3 text-sm">
              <strong>{a.fullName}</strong> — {a.line1}, {a.city}, {a.country}
              {a.isDefault && <span className="ml-2 text-xs text-sigma">Default</span>}
            </div>
          ))}
        </div>
        {!showAddressForm ? (
          <button onClick={() => setShowAddressForm(true)} className="text-sm underline">+ Add address</button>
        ) : (
          <AddressForm onSaved={(addr) => { setAddresses((p) => [...p, addr]); setShowAddressForm(false); }} />
        )}
      </section>
    </div>
  );
}
