const express = require("express");
const slugify = require("slugify");
const prisma = require("../../config/db");
const { asyncHandler } = require("../../middleware/errorHandler");
const { upload, processAndSaveImage } = require("../../utils/upload");

const router = express.Router();

// ---------- CATEGORIES ----------
router.post(
  "/categories",
  asyncHandler(async (req, res) => {
    const { name, description, parentId } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const category = await prisma.category.create({ data: { name, slug, description, parentId: parentId || null } });
    res.status(201).json(category);
  })
);

router.put(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
    res.json(category);
  })
);

router.delete(
  "/categories/:id",
  asyncHandler(async (req, res) => {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: "Category deleted." });
  })
);

// ---------- BRANDS ----------
router.post(
  "/brands",
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const brand = await prisma.brand.create({ data: { name, slug } });
    res.status(201).json(brand);
  })
);

router.delete(
  "/brands/:id",
  asyncHandler(async (req, res) => {
    await prisma.brand.delete({ where: { id: req.params.id } });
    res.json({ message: "Brand deleted." });
  })
);

// ---------- HOMEPAGE BANNERS ----------
router.get(
  "/banners",
  asyncHandler(async (req, res) => {
    const banners = await prisma.banner.findMany({ orderBy: { position: "asc" } });
    res.json(banners);
  })
);

router.post(
  "/banners",
  upload.single("image"),
  asyncHandler(async (req, res) => {
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      const { url } = await processAndSaveImage(req.file.buffer);
      imageUrl = url;
    }
    const banner = await prisma.banner.create({
      data: {
        title: req.body.title,
        subtitle: req.body.subtitle,
        linkUrl: req.body.linkUrl,
        position: Number(req.body.position || 0),
        imageUrl,
      },
    });
    res.status(201).json(banner);
  })
);

router.put(
  "/banners/:id",
  asyncHandler(async (req, res) => {
    const banner = await prisma.banner.update({ where: { id: req.params.id }, data: req.body });
    res.json(banner);
  })
);

router.delete(
  "/banners/:id",
  asyncHandler(async (req, res) => {
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.json({ message: "Banner deleted." });
  })
);

// ---------- COUPONS ----------
router.get(
  "/coupons",
  asyncHandler(async (req, res) => {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json(coupons);
  })
);

router.post(
  "/coupons",
  asyncHandler(async (req, res) => {
    const coupon = await prisma.coupon.create({
      data: { ...req.body, code: req.body.code.toUpperCase() },
    });
    res.status(201).json(coupon);
  })
);

router.put(
  "/coupons/:id",
  asyncHandler(async (req, res) => {
    const coupon = await prisma.coupon.update({ where: { id: req.params.id }, data: req.body });
    res.json(coupon);
  })
);

router.delete(
  "/coupons/:id",
  asyncHandler(async (req, res) => {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    res.json({ message: "Coupon deleted." });
  })
);

module.exports = router;
