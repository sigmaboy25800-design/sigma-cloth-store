const express = require("express");
const slugify = require("slugify");
const { body } = require("express-validator");
const prisma = require("../../config/db");
const validate = require("../../middleware/validate");
const { asyncHandler, ApiError } = require("../../middleware/errorHandler");
const { upload, processAndSaveImage } = require("../../utils/upload");

const router = express.Router();

// ---------- LIST (admin — includes inactive products, no pagination cap) ----------
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const products = await prisma.product.findMany({
      include: { images: true, category: true, brand: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  })
);

// ---------- CREATE PRODUCT ----------
router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("description").trim().notEmpty(),
    body("price").isFloat({ min: 0 }),
    body("sku").trim().notEmpty(),
    body("categoryId").notEmpty(),
    body("stock").optional().isInt({ min: 0 }),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const {
      name, description, price, salePrice, sku, stock, weightKg,
      tags, sizes, colors, categoryId, brandId, isFeatured, metaTitle, metaDesc,
    } = req.body;

    const slug = slugify(name, { lower: true, strict: true }) + "-" + Math.random().toString(36).slice(2, 7);

    const product = await prisma.product.create({
      data: {
        name, slug, description,
        price, salePrice: salePrice || null,
        sku, stock: stock || 0, weightKg: weightKg || null,
        tags: tags || [], sizes: sizes || [], colors: colors || [],
        categoryId, brandId: brandId || null,
        isFeatured: !!isFeatured, metaTitle, metaDesc,
      },
    });
    res.status(201).json(product);
  })
);

// ---------- UPDATE PRODUCT ----------
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { name, ...rest } = req.body;
    const data = { ...rest };
    if (name) {
      data.name = name;
    }
    const product = await prisma.product.update({ where: { id: req.params.id }, data });
    res.json(product);
  })
);

// ---------- DELETE PRODUCT ----------
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Product deleted." });
  })
);

// ---------- UPLOAD PRODUCT IMAGES ----------
router.post(
  "/:id/images",
  upload.array("images", 8),
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) throw new ApiError(404, "Product not found.");
    if (!req.files?.length) throw new ApiError(400, "No images uploaded.");

    const existingCount = await prisma.productImage.count({ where: { productId: product.id } });

    const created = [];
    for (let i = 0; i < req.files.length; i++) {
      const { url } = await processAndSaveImage(req.files[i].buffer);
      const img = await prisma.productImage.create({
        data: { productId: product.id, url, position: existingCount + i },
      });
      created.push(img);
    }
    res.status(201).json(created);
  })
);

router.delete(
  "/:id/images/:imageId",
  asyncHandler(async (req, res) => {
    await prisma.productImage.delete({ where: { id: req.params.imageId } });
    res.json({ message: "Image removed." });
  })
);

// ---------- STOCK / PRICE QUICK UPDATE ----------
router.patch(
  "/:id/stock",
  [body("stock").isInt({ min: 0 })],
  validate,
  asyncHandler(async (req, res) => {
    const product = await prisma.product.update({ where: { id: req.params.id }, data: { stock: req.body.stock } });
    res.json(product);
  })
);

module.exports = router;
