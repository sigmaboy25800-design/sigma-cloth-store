const express = require("express");
const { requireAuth, requireRole } = require("../../middleware/auth");

const router = express.Router();

// Every route under /api/admin requires a logged-in ADMIN or STAFF user.
router.use(requireAuth, requireRole("ADMIN", "STAFF"));

router.use("/products", require("./products"));
router.use("/", require("./catalog")); // /categories, /brands, /banners, /coupons
router.use("/orders", require("./orders"));
router.use("/", require("./analytics")); // /customers, /dashboard, /sales

module.exports = router;
