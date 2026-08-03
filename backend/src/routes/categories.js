const express = require("express");
const prisma = require("../config/db");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { name: "asc" },
    });
    res.json(categories);
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const category = await prisma.category.findUnique({ where: { slug: req.params.slug }, include: { children: true } });
    if (!category) return res.status(404).json({ error: "Category not found." });
    res.json(category);
  })
);

module.exports = router;
