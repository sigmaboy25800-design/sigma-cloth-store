// Run with: npm run seed
// Creates the first admin account (from env vars) plus starter categories
// and a couple of sample products so the storefront isn't empty on first boot.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@sigmaclothstore.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: "Store",
        lastName: "Admin",
        role: "ADMIN",
        isEmailVerified: true,
      },
    });
    console.log(`Admin created: ${adminEmail} / ${adminPassword}  (CHANGE THIS PASSWORD IMMEDIATELY)`);
  } else {
    console.log("Admin already exists, skipping.");
  }

  const categories = ["Men", "Women", "Kids", "Accessories"];
  const categoryRecords = {};
  for (const name of categories) {
    const slug = name.toLowerCase();
    categoryRecords[name] = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  const brand = await prisma.brand.upsert({
    where: { slug: "sigma-house" },
    update: {},
    create: { name: "Sigma House", slug: "sigma-house" },
  });

  const sampleProducts = [
    {
      name: "Classic Oversized Hoodie",
      price: 59.99,
      salePrice: 44.99,
      category: "Men",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "Charcoal", "Sand"],
    },
    {
      name: "Essential Cropped Tee",
      price: 24.99,
      category: "Women",
      sizes: ["XS", "S", "M", "L"],
      colors: ["White", "Black"],
    },
    {
      name: "Utility Cargo Pants",
      price: 69.99,
      category: "Men",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Olive", "Black"],
    },
  ];

  for (const p of sampleProducts) {
    const slug = p.name.toLowerCase().replace(/\s+/g, "-") + "-" + Math.random().toString(36).slice(2, 6);
    const sku = "SGC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: `${p.name} — premium fabric, tailored fit, part of the Sigma Cloth Store core collection.`,
        price: p.price,
        salePrice: p.salePrice || null,
        sku,
        stock: 50,
        sizes: p.sizes,
        colors: p.colors,
        tags: [p.category.toLowerCase()],
        isFeatured: true,
        categoryId: categoryRecords[p.category].id,
        brandId: brand.id,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
