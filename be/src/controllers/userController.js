const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all users with pagination and filtering (Admin only)
 * GET /api/admin/users
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      sort = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Parse pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const where = {
      AND: [
        // Search by name or email
        search ? {
          OR: [
            { full_name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        // Filter by role
        role ? { role } : {}
      ].filter(condition => Object.keys(condition).length > 0)
    };

    // Build orderBy clause
    const orderBy = {};
    if (sort === 'name') {
      orderBy.full_name = sortOrder;
    } else if (sort === 'email') {
      orderBy.email = sortOrder;
    } else if (sort === 'role') {
      orderBy.role = sortOrder;
    } else {
      orderBy.created_at = sortOrder;
    }

    // Get users with pagination
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          role: true,
          created_at: true,
          updated_at: true,
          _count: {
            select: {
              addresses: true,
              cart_items: true,
              orders: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      data: users,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limitNum,
        has_next_page: hasNextPage,
        has_prev_page: hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pengguna',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user by ID (Admin only)
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        created_at: true,
        updated_at: true,
        addresses: {
          select: {
            id: true,
            address_line: true,
            city: true,
            province: true,
            postal_code: true,
            is_primary: true,
            created_at: true
          }
        },
        _count: {
          select: {
            cart_items: true,
            orders: true,
            transactions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pengguna',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update user role (Admin only)
 * PUT /api/admin/users/:id/role
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role tidak valid. Gunakan: user atau admin'
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        updated_at: true
      }
    });

    res.json({
      success: true,
      message: 'Role pengguna berhasil diperbarui',
      data: updatedUser
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui role pengguna',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete user (Admin only)
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus akun sendiri'
      });
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Pengguna berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus pengguna',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user statistics (Admin only)
 * GET /api/admin/users/stats
 */
const getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      recentUsers,
      usersWithOrders
    ] = await Promise.all([
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
      })
    ]);

    res.json({
      success: true,
      data: {
        total_users: totalUsers,
        total_admins: totalAdmins,
        total_regular_users: totalRegularUsers,
        recent_users: recentUsers,
        users_with_orders: usersWithOrders,
        users_without_orders: totalUsers - usersWithOrders
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik pengguna',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserStats
};
