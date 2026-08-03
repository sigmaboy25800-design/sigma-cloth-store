"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { api } from "../../lib/api";
import AddressForm from "../../components/AddressForm";
import StripePaymentForm from "../../components/StripePaymentForm";
import PaypalPaymentButton from "../../components/PaypalPaymentButton";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PAYMENT_METHODS = [
  { value: "STRIPE", label: "Card (Stripe — Visa, Mastercard, Apple Pay, Google Pay)" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "COD", label: "Cash on Delivery" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "EASYPAISA", label: "EasyPaisa" },
  { value: "JAZZCASH", label: "JazzCash" },
];

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, refresh } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("STRIPE");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/account/login?redirect=/checkout");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      api.get("/api/users/me/addresses").then((data) => {
        setAddresses(data);
        const def = data.find((a) => a.isDefault) || data[0];
        if (def) setAddressId(def.id);
      });
    }
  }, [user]);

  const shipping = subtotal - discount >= 100 ? 0 : 6.99;
  const total = Math.max(subtotal - discount + shipping, 0);

  async function applyCoupon() {
    try {
      const res = await api.post("/api/coupons/validate", { code: couponCode, subtotal });
      setDiscount(res.discount);
    } catch (e) {
      setError(e.message);
    }
  }

  async function placeOrder() {
    setError(null);
    if (!addressId) return setError("Please select or add a shipping address.");
    setPlacing(true);
    try {
      const res = await api.post("/api/orders", { addressId, paymentMethod, couponCode: couponCode || undefined });
      setOrder(res.order);
      if (paymentMethod === "STRIPE") setClientSecret(res.payment.clientSecret);
      if (paymentMethod === "PAYPAL") setPaypalOrderId(res.payment.paypalOrderId);
      if (["COD", "BANK_TRANSFER", "EASYPAISA", "JAZZCASH"].includes(paymentMethod)) {
        router.push(`/account/orders/${res.order.id}?placed=1`);
      }
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
  }

  if (authLoading || !user) return null;
  if (items.length === 0 && !order) {
    return <div className="container-wide py-24 text-center">Your bag is empty.</div>;
  }

  return (
    <div className="container-wide py-12 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
      <div className="space-y-10">
        {/* Address */}
        <section>
          <h2 className="font-display text-xl uppercase mb-4">Shipping Address</h2>
          {addresses.map((a) => (
            <label key={a.id} className="flex items-start gap-3 border border-ink/15 p-4 mb-3 cursor-pointer">
              <input type="radio" checked={addressId === a.id} onChange={() => setAddressId(a.id)} className="mt-1" />
              <span className="text-sm">
                <strong>{a.fullName}</strong> — {a.line1}, {a.city}, {a.country} — {a.phone}
              </span>
            </label>
          ))}
          {!showNewAddress ? (
            <button onClick={() => setShowNewAddress(true)} className="text-sm underline">+ Add new address</button>
          ) : (
            <AddressForm
              onSaved={(addr) => {
                setAddresses((prev) => [...prev, addr]);
                setAddressId(addr.id);
                setShowNewAddress(false);
              }}
            />
          )}
        </section>

        {/* Payment method */}
        {!order && (
          <section>
            <h2 className="font-display text-xl uppercase mb-4">Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.value} className="flex items-center gap-3 border border-ink/15 p-3 cursor-pointer text-sm">
                  <input type="radio" checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} />
                  {m.label}
                </label>
              ))}
            </div>
          </section>
        )}

        {error && <p className="text-sigma text-sm">{error}</p>}

        {!order && (
          <button onClick={placeOrder} disabled={placing} className="btn-primary w-full disabled:opacity-40">
            {placing ? "Placing order…" : "Place Order"}
          </button>
        )}

        {/* Stripe payment step */}
        {order && paymentMethod === "STRIPE" && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <StripePaymentForm orderId={order.id} />
          </Elements>
        )}

        {/* PayPal payment step */}
        {order && paymentMethod === "PAYPAL" && paypalOrderId && (
          <PayPalScriptProvider options={{ "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID }}>
            <PaypalPaymentButton paypalOrderId={paypalOrderId} orderId={order.id} />
          </PayPalScriptProvider>
        )}
      </div>

      {/* Order summary */}
      <div className="bg-stone/10 p-8 h-fit space-y-3">
        <h2 className="font-display text-xl uppercase mb-4">Order Summary</h2>
        <div className="flex gap-2">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Coupon code"
            className="flex-1 border border-ink/20 px-3 py-2 text-sm"
          />
          <button onClick={applyCoupon} className="btn-outline px-4 text-xs">Apply</button>
        </div>
        <div className="flex justify-between text-sm pt-4">
          <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-sigma">
            <span>Discount</span><span>-${discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span>Shipping</span><span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-base font-semibold border-t border-ink/20 pt-3 mt-3">
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
