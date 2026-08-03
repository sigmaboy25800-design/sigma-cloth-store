const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendEmail({ to, subject, html }) {
  if (!process.env.SMTP_HOST) {
    // Fail gracefully in local dev if SMTP isn't configured yet, instead
    // of crashing the request — but log loudly so it isn't missed.
    console.warn(`[email] SMTP not configured — would have sent "${subject}" to ${to}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "no-reply@sigmaclothstore.com",
    to,
    subject,
    html,
  });
}

function verificationEmail(link) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
    <h2 style="letter-spacing:2px;text-transform:uppercase">Sigma Cloth Store</h2>
    <p>Confirm your email address to activate your account.</p>
    <a href="${link}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;letter-spacing:1px">VERIFY EMAIL</a>
    <p style="color:#888;font-size:12px">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
  </div>`;
}

function resetPasswordEmail(link) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
    <h2 style="letter-spacing:2px;text-transform:uppercase">Sigma Cloth Store</h2>
    <p>We received a request to reset your password.</p>
    <a href="${link}" style="display:inline-block;padding:12px 24px;background:#111;color:#fff;text-decoration:none;letter-spacing:1px">RESET PASSWORD</a>
    <p style="color:#888;font-size:12px">This link expires in 1 hour. If you didn't request this, ignore this email — your password won't change.</p>
  </div>`;
}

function orderConfirmationEmail(order) {
  const rows = order.items
    .map(
      (i) => `<tr><td>${i.name}${i.size ? " / " + i.size : ""}${i.color ? " / " + i.color : ""}</td><td>${i.quantity}</td><td>$${i.price}</td></tr>`
    )
    .join("");
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
    <h2 style="letter-spacing:2px;text-transform:uppercase">Order Confirmed</h2>
    <p>Order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr><th align="left">Item</th><th align="left">Qty</th><th align="left">Price</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p><strong>Total: $${order.total}</strong></p>
    <p>We'll email you again once your order ships.</p>
  </div>`;
}

module.exports = { sendEmail, verificationEmail, resetPasswordEmail, orderConfirmationEmail };
