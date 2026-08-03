const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { asyncHandler } = require("../middleware/errorHandler");
const { sendEmail } = require("../utils/email");

const router = express.Router();

router.post(
  "/",
  [body("name").trim().notEmpty(), body("email").isEmail().normalizeEmail(), body("message").trim().notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;
    const ownerEmail = process.env.STORE_OWNER_EMAIL || process.env.SMTP_USER;
    await sendEmail({
      to: ownerEmail,
      subject: `New contact form message from ${name}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message.replace(/</g, "&lt;")}</p>`,
    });
    res.status(201).json({ message: "Message sent." });
  })
);

module.exports = router;
