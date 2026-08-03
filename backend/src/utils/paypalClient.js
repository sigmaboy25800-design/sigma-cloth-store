// Thin wrapper around PayPal's REST "Orders v2" API using plain fetch,
// so there's no dependency on the (unmaintained) paypal-rest-sdk package.
const PAYPAL_BASE =
  process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("Failed to authenticate with PayPal.");
  const data = await res.json();
  return data.access_token;
}

async function createPaypalOrder(amountUsd, orderNumber) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderNumber,
          amount: { currency_code: "USD", value: amountUsd.toFixed(2) },
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`PayPal order creation failed: ${await res.text()}`);
  return res.json();
}

async function capturePaypalOrder(paypalOrderId) {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`PayPal capture failed: ${await res.text()}`);
  return res.json();
}

module.exports = { createPaypalOrder, capturePaypalOrder };
