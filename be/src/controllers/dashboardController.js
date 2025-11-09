const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// Get dashboard statistics (admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Get all statistics in parallel
    const [
      // Order statistics
      totalOrders,
      ordersByStatus,
      recentOrders,
      ordersRevenue,
      
      // Payment statistics
      totalPayments,
      paidPayments,
      pendingPayments,
      failedPayments,
      totalRevenue,
      
      // User statistics
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      recentUsers,
      usersWithOrders,
      
      // Shipping statistics
      totalShippings,
      pendingShipment,
      inTransit,
      delivered,
      
      // Product statistics
      totalProducts,
      activeProducts,
      totalCategories,
      activeCategories,
    ] = await Promise.all([
      // Orders
      prisma.order.count(),
      prisma.order.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.order.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ['dikemas', 'dikirim', 'diterima'] }
        },
        _sum: {
          total_amount: true,
          shipping_cost: true
        }
      }),
      
      // Payments
      prisma.payment.count(),
      prisma.payment.count({ where: { payment_status: 'paid' } }),
      prisma.payment.count({ where: { payment_status: 'pending' } }),
      prisma.payment.count({ where: { payment_status: 'failed' } }),
      prisma.payment.aggregate({
        where: { payment_status: 'paid' },
        _sum: { amount: true }
      }),
      
      // Users
      prisma.user.count(),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'user' } }),
      prisma.user.count({
        where: {
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.user.count({
        where: {
          orders: {
            some: {}
          }
        }
      }),
      
      // Shipping
      prisma.shipping.count(),
      prisma.shipping.count({ where: { shipping_status: 'pending' } }),
      prisma.shipping.count({ where: { shipping_status: 'in_transit' } }),
      prisma.shipping.count({ where: { shipping_status: 'delivered' } }),
      
      // Products
      prisma.product.count(),
      prisma.product.count({ where: { deleted_at: null } }),
      prisma.category.count(),
      prisma.category.count({ where: { deleted_at: null } }),
    ]);

    // Calculate revenue
    const orderRevenue = (parseFloat(ordersRevenue._sum.total_amount || 0) + parseFloat(ordersRevenue._sum.shipping_cost || 0));
    const paymentRevenue = totalRevenue._sum.amount ? parseFloat(totalRevenue._sum.amount) : 0;

    // Format orders by status
    const ordersStatusMap = {};
    ordersByStatus.forEach(item => {
      ordersStatusMap[item.status] = item._count;
    });

    // Get recent orders (last 10)
    const recentOrdersList = await prisma.order.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        status: true,
        total_amount: true,
        created_at: true,
        user: {
          select: {
            id: true,
            full_name: true,
            email: true
          }
        }
      }
    });

    // Get recent payments (last 10)
    const recentPaymentsList = await prisma.payment.findMany({
      take: 10,
      orderBy: { payment_date: 'desc' },
      select: {
        id: true,
        payment_method: true,
        payment_status: true,
        amount: true,
        payment_date: true,
        order: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                full_name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          byStatus: {
            belum_bayar: ordersStatusMap['belum_bayar'] || 0,
            dikemas: ordersStatusMap['dikemas'] || 0,
            dikirim: ordersStatusMap['dikirim'] || 0,
            diterima: ordersStatusMap['diterima'] || 0,
            dibatalkan: ordersStatusMap['dibatalkan'] || 0,
          },
          recent: recentOrders,
          revenue: orderRevenue,
          recentOrders: recentOrdersList
        },
        payments: {
          total: totalPayments,
          paid: paidPayments,
          pending: pendingPayments,
          failed: failedPayments,
          revenue: paymentRevenue,
          recentPayments: recentPaymentsList
        },
        users: {
          total: totalUsers,
          admins: totalAdmins,
          regular: totalRegularUsers,
          recent: recentUsers,
          withOrders: usersWithOrders,
          withoutOrders: totalUsers - usersWithOrders
        },
        shipping: {
          total: totalShippings,
          pending: pendingShipment,
          inTransit: inTransit,
          delivered: delivered
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          categories: {
            total: totalCategories,
            active: activeCategories
          }
        }
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
};

module.exports = {
  getDashboardStats
};

