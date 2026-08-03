const express = require("express");
const prisma = require("../config/db");
const { optionalAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

const router = express.Router();

// ---------- LIST / SEARCH / FILTER ----------
// GET /api/products?search=&category=&brand=&minPrice=&maxPrice=&size=&color=&sort=&page=&limit=
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const where = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }
    if (category) where.category = { slug: category };
    if (brand) where.brand = { slug: brand };
    if (size) where.sizes = { has: size };
    if (color) where.colors = { has: color };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const orderBy =
      {
        newest: { createdAt: "desc" },
        price_asc: { price: "asc" },
        price_desc: { price: "desc" },
        name_asc: { name: "asc" },
      }[sort] || { createdAt: "desc" };

    const take = Math.min(Number(limit), 100);
    const skip = (Number(page) - 1) * take;

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          images: { orderBy: { position: "asc" } },
          category: true,
          brand: true,
          reviews: { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const results = items.map(withRatingSummary);

    res.json({ items: results, total, page: Number(page), pages: Math.ceil(total / take) });
  })
);

// ---------- FEATURED (homepage) ----------
router.get(
  "/featured",
  asyncHandler(async (req, res) => {
    const items = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      include: { images: { orderBy: { position: "asc" } }, reviews: { select: { rating: true } } },
    });
    res.json(items.map(withRatingSummary));
  })
);

// ---------- PRODUCT DETAIL ----------
router.get(
  "/:slug",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: { orderBy: { position: "asc" } },
        category: true,
        brand: true,
        reviews: { include: { user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!product || !product.isActive) return res.status(404).json({ error: "Product not found." });

    if (req.user) {
      await prisma.recentlyViewed.upsert({
        where: { userId_productId: { userId: req.user.id, productId: product.id } },
        update: { viewedAt: new Date() },
        create: { userId: req.user.id, productId: product.id },
      });
    }

    res.json(withRatingSummary(product));
  })
);

// ---------- RELATED PRODUCTS (same category) ----------
router.get(
  "/:slug/related",
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
    if (!product) return res.status(404).json({ error: "Product not found." });

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, isActive: true, NOT: { id: product.id } },
      take: 8,
      include: { images: { orderBy: { position: "asc" } } },
    });
    res.json(related);
  })
);

function withRatingSummary(product) {
  const ratings = product.reviews?.map((r) => r.rating) || [];
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  return { ...product, avgRating: Math.round(avgRating * 10) / 10, reviewCount: ratings.length };
}

module.exports = router;
