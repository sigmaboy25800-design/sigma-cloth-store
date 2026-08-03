const express = require("express");
const { body } = require("express-validator");
const prisma = require("../config/db");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();
router.use(requireAuth);

// ---------- GET MY PROFILE ----------
router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { addresses: true },
    });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  })
);

// ---------- EDIT PROFILE ----------
router.put(
  "/me",
  [body("firstName").optional().trim().notEmpty(), body("lastName").optional().trim().notEmpty(), body("phone").optional().trim()],
  validate,
  asyncHandler(async (req, res) => {
    const { firstName, lastName, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName, phone },
    });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  })
);

// ---------- ADDRESSES ----------
router.get(
  "/me/addresses",
  asyncHandler(async (req, res) => {
    const addresses = await prisma.address.findMany({ where: { userId: req.user.id } });
    res.json(addresses);
  })
);

router.post(
  "/me/addresses",
  [
    body("fullName").notEmpty(),
    body("phone").notEmpty(),
    body("line1").notEmpty(),
    body("city").notEmpty(),
    body("country").notEmpty(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    if (req.body.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const address = await prisma.address.create({ data: { ...req.body, userId: req.user.id } });
    res.status(201).json(address);
  })
);

router.put(
  "/me/addresses/:id",
  asyncHandler(async (req, res) => {
    const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) return res.status(404).json({ error: "Address not found." });
    if (req.body.isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }
    const updated = await prisma.address.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  })
);

router.delete(
  "/me/addresses/:id",
  asyncHandler(async (req, res) => {
    const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) return res.status(404).json({ error: "Address not found." });
    await prisma.address.delete({ where: { id: req.params.id } });
    res.json({ message: "Address removed." });
  })
);

module.exports = router;
