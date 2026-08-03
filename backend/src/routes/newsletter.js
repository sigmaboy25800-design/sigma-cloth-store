const express = require("express");
const { body } = require("express-validator");
const prisma = require("../config/db");
const validate = require("../middleware/validate");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.post(
  "/subscribe",
  [body("email").isEmail().normalizeEmail()],
  validate,
  asyncHandler(async (req, res) => {
    await prisma.newsletterSubscriber.upsert({
      where: { email: req.body.email },
      update: {},
      create: { email: req.body.email },
    });
    res.status(201).json({ message: "Subscribed successfully." });
  })
);

module.exports = router;
