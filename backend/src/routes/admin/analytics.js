const express = require("express");
const prisma = require("../../config/db");
const { asyncHandler } = require("../../middleware/errorHandler");

const router = express.Router();

// ---------- CUSTOMERS ----------
router.get(
  "/customers",
  asyncHandler(async (req, res) => {
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        isEmailVerified: true, createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(customers);
  })
);

// ---------- DASHBOARD SUMMARY ----------
router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const [totalRevenueAgg, orderCount, customerCount, productCount, lowStock, recentOrders] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.product.findMany({ where: { stock: { lte: 5 }, isActive: true }, take: 10, orderBy: { stock: "asc" } }),
      prisma.order.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { user: { select: { firstName: true, lastName: true } } } }),
    ]);

    res.json({
      totalRevenue: totalRevenueAgg._sum.total || 0,
      orderCount,
      customerCount,
      productCount,
      lowStock,
      recentOrders,
    });
  })
);

// ---------- SALES REPORT (revenue over time) ----------
// GET /api/admin/analytics/sales?from=2026-01-01&to=2026-08-01&groupBy=day|month
router.get(
  "/sales",
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const where = { paymentStatus: "PAID" };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const orders = await prisma.order.findMany({
      where,
      select: { total: true, createdAt: true, paymentMethod: true },
    });

    const byDay = {};
    const byPaymentMethod = {};
    let totalRevenue = 0;

    for (const o of orders) {
      const day = o.createdAt.toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + Number(o.total);
      byPaymentMethod[o.paymentMethod] = (byPaymentMethod[o.paymentMethod] || 0) + Number(o.total);
      totalRevenue += Number(o.total);
    }

    res.json({
      totalRevenue,
      orderCount: orders.length,
      averageOrderValue: orders.length ? totalRevenue / orders.length : 0,
      revenueByDay: byDay,
      revenueByPaymentMethod: byPaymentMethod,
    });
  })
);

module.exports = router;
