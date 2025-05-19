const pool = require('../config/db'); // Your MySQL pool connection

// 1. Get overall KPI summary (single endpoint)
exports.getDashboardSummary = async (req, res) => {
  try {
    // Total orders (all statuses)
    const [[{ totalOrders }]] = await pool.execute(
      `SELECT COUNT(*) AS totalOrders FROM Orders`
    );

    // Total customers
    const [[{ totalCustomers }]] = await pool.execute(
      `SELECT COUNT(*) AS totalCustomers FROM Users WHERE role = 'customer'`
    );

    // Total products
    const [[{ totalProducts }]] = await pool.execute(
      `SELECT COUNT(*) AS totalProducts FROM Products`
    );

    // Total revenue (only delivered orders)
    const [[{ totalRevenue }]] = await pool.execute(
      `SELECT IFNULL(SUM(total_amount), 0) AS totalRevenue FROM Orders WHERE status = 'delivered'`
    );

    // Active discounts count
    const [[{ activeDiscounts }]] = await pool.execute(
      `SELECT COUNT(*) AS activeDiscounts 
       FROM Discounts 
       WHERE (end_date IS NULL OR end_date > NOW()) 
         AND (max_uses IS NULL OR current_uses < max_uses)`
    );

    res.status(200).json({
      totalOrders,
      totalCustomers,
      totalProducts,
      totalRevenue,
      activeDiscounts,
    });
  } catch (error) {
    console.error('Dashboard Summary Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 2. Get order status summary (count by status)
exports.getOrderStatusSummary = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT status, COUNT(*) AS count FROM Orders GROUP BY status`
    );
    res.status(200).json({ orderStatusSummary: rows });
  } catch (error) {
    console.error('Order Status Summary Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 3. Get monthly sales totals for a given year (default: current year)
exports.getMonthlySales = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const [rows] = await pool.execute(
      `SELECT 
         MONTH(order_date) AS month,
         IFNULL(SUM(total_amount), 0) AS totalSales
       FROM Orders
       WHERE status = 'delivered' AND YEAR(order_date) = ?
       GROUP BY MONTH(order_date)
       ORDER BY month`,
      [year]
    );

    // Fill missing months with 0 sales for consistency
    const salesByMonth = Array(12).fill(0);
    rows.forEach(({ month, totalSales }) => {
      salesByMonth[month - 1] = Number(totalSales);
    });

    res.status(200).json({ year: Number(year), monthlySales: salesByMonth });
  } catch (error) {
    console.error('Monthly Sales Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 4. Get recent N orders (default 5)
exports.getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const [rows] = await pool.execute(
      `SELECT o.order_id, o.order_date, o.total_amount, o.status, u.name AS customer_name
       FROM Orders o
       LEFT JOIN Users u ON o.user_id = u.id
       ORDER BY o.order_date DESC
       LIMIT ?`,
      [limit]
    );

    res.status(200).json({ recentOrders: rows });
  } catch (error) {
    console.error('Recent Orders Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 5. Get low stock products (threshold default 5)
exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold, 10) || 5;

    const [rows] = await pool.execute(
      `SELECT p.product_id, p.name, p.stock_quantity, c.name AS category_name
       FROM Products p
       LEFT JOIN Categories c ON p.category_id = c.category_id
       WHERE p.stock_quantity <= ?
       ORDER BY p.stock_quantity ASC`,
      [threshold]
    );

    res.status(200).json({ lowStockProducts: rows });
  } catch (error) {
    console.error('Low Stock Products Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 6. Get top favorited products (default top 5)
exports.getTopFavoritedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const [rows] = await pool.execute(
      `SELECT p.product_id, p.name, COUNT(f.id) AS favorites_count
       FROM Favorites f
       JOIN Products p ON f.product_id = p.product_id
       GROUP BY p.product_id
       ORDER BY favorites_count DESC
       LIMIT ?`,
      [limit]
    );

    res.status(200).json({ topFavoritedProducts: rows });
  } catch (error) {
    console.error('Top Favorited Products Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 7. Get active discounts list
exports.getActiveDiscounts = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT discount_id, code, description, discount_type, amount, start_date, end_date
       FROM Discounts
       WHERE (end_date IS NULL OR end_date > NOW())
         AND (max_uses IS NULL OR current_uses < max_uses)`
    );
    res.status(200).json({ activeDiscounts: rows });
  } catch (error) {
    console.error('Active Discounts Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 8. Get recent contact messages (default 5)
exports.getRecentContacts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const [rows] = await pool.execute(
      `SELECT id, first_name, email, subject, message
       FROM Contacts
       ORDER BY id DESC
       LIMIT ?`,
      [limit]
    );

    res.status(200).json({ recentContacts: rows });
  } catch (error) {
    console.error('Recent Contacts Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
