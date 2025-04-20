




const Cart = require('../models/cart');
const Order = require('../models/order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/product');
const Shipping = require('../models/shipping');
const pool = require('../config/db');
const CartItem = require('../models/CartItem');



// Checkout a cart and create an order
exports.checkout = async (req, res) => {
    const user_id = req.user.id;
       // 🔍 Add this line to debug which user is making the request
       console.log("🔐 User ID from token:", user_id);

    const connection = await pool.getConnection(); // Step 1: Get connection from the pool

    try {
        await connection.beginTransaction(); // Step 2: Begin transaction

        // Perform all the necessary database operations using this connection
        console.log("Checking cart for user ID:", user_id);
        const userCart = await Cart.getCartByUser(user_id);
        console.log("🛒 Cart found:", userCart); 
        if (!userCart) return res.status(400).json({ error: 'Cart not found' });

        const cartItems = await CartItem.getItems(userCart.cart_id);
        console.log("🧾 Cart items:", cartItems);
        if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

        const shippingOptions = await Shipping.getAll();
        const delivery_fee = shippingOptions[0]?.delivery_fee || 0;

        let total = 0;

        // Calculate total price and check stock availability
        for (const item of cartItems) {
            const product = await Product.getById(item.product_id);
            if (!product) {
                return res.status(404).json({ error: `Product with ID ${item.product_id} not found` });
            }

            if (product.stock_quantity < item.quantity) {
                return res.status(400).json({ error: `Not enough stock for ${product.name}` });
            }

            total += product.price * item.quantity;
        }

        // Add delivery fee to the total
        total += delivery_fee;

        // Insert order into the orders table
        const orderId = await Order.create(user_id, total, 'pending', 'Cash on Delivery', null, connection);// Pass connection to the model

        // Insert shipping details into the shipping table
        await connection.execute(
            'INSERT INTO Shippings (order_id, delivery_fee) VALUES (?, ?)',
            [orderId, delivery_fee]
        );

        // Insert order items into the order_items table
        for (const item of cartItems) {
            const product = await Product.getById(item.product_id);
            await OrderItem.create(orderId, item.product_id, item.quantity, product.price, connection); // Pass connection here
            // Update product stock
            const stockUpdated = await Product.updateStock(item.product_id, item.quantity, connection); // Update stock // Pass connection here
            if (!stockUpdated) {
                throw new Error(`Failed to update stock for product: ${item.product_id}`);
            }
        }
        // ✅ DELETE the CartItems first to avoid foreign key constraint error
        await connection.execute('DELETE FROM CartItems WHERE cart_id = ?', [userCart.cart_id]);

        // Delete items from cart after successful checkout
        await connection.execute('DELETE FROM Carts WHERE user_id = ?', [user_id]);

        await connection.commit(); // Step 4: Commit the transaction
        res.status(201).json({ message: 'Checkout successful', orderId });
    } catch (error) {
        await connection.rollback(); // Step 5: Rollback the transaction if an error occurs
        console.error(`Error during checkout for user ${user_id}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        connection.release(); // Step 6: Release the connection
    }
};


// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
        const orders = await Order.getAll();
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get Orders Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get orders by user
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.getByUserId(req.user.id);
        if (orders.length === 0) return res.status(404).json({ error: 'No orders found' });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Get User Orders Error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Get order items by order ID
exports.getOrderItems = async (req, res) => {
    try {
        const { order_id } = req.params;
        const order = await Order.getById(order_id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (req.user.id !== order.user_id && req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });

        const items = await OrderItem.getByOrderId(order_id);
        res.status(200).json(items);
    } catch (error) {
        console.error('Get Order Items Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get order items by user (customized for a user's order history)
exports.getOrderItemsByUser = async (req, res) => {
    const user_id = req.user.id;

    try {
        const [orders] = await pool.execute(
            'SELECT * FROM Orders WHERE user_id = ? ORDER BY order_date DESC',
            [user_id]
        );

        for (const order of orders) {
            const [items] = await pool.execute(
                `SELECT oi.*, p.name, p.price 
                FROM OrderItems oi 
                JOIN Products p ON oi.product_id = p.product_id 
                WHERE oi.order_id = ?`,
                [order.order_id]
            );
            order.items = items;
        }

        res.json({ orders });
    } catch (error) {
        console.error(`Error fetching order history for user ${user_id}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Cancel an order (Admin only)
exports.cancelOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

        const { order_id } = req.params;
        const order = await Order.getById(order_id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        await Order.updateStatus(order_id, 'canceled');
        res.status(200).json({ message: 'Order canceled' });
    } catch (error) {
        console.error('Cancel Order Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete an order (Admin only)
exports.deleteOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

        const { order_id } = req.params;
        const order = await Order.getById(order_id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (!['pending', 'canceled'].includes(order.status)) {
            return res.status(400).json({ error: 'Only pending or canceled orders can be deleted' });
        }

        const items = await OrderItem.getByOrderId(order_id);
        for (const item of items) {
            const product = await Product.getById(item.product_id);
            const updatedStock = product.stock_quantity + item.quantity;
            await Product.update(item.product_id, { stock_quantity: updatedStock });
        }

        await OrderItem.deleteByOrderId(order_id);

        // ✅ Delete associated shipping record to avoid foreign key constraint issue
        await pool.execute('DELETE FROM Shippings WHERE order_id = ?', [order_id]);

        await Order.delete(order_id);

        res.status(200).json({ message: 'Order and related items deleted' });
    } catch (error) {
        console.error('Delete Order Error:', error);
        res.status(500).json({ error: error.message });
    }
};


// Update order (Admin only)
exports.updateOrder = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

        const { order_id } = req.params;
        const order = await Order.getById(order_id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const { status } = req.body;
        await Order.updateStatus(order_id, status);
        res.status(200).json({ message: 'Order updated' });
    } catch (error) {
        console.error('Update Order Error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update order item
exports.updateOrderItem = async (req, res) => {
    const { order_item_id } = req.params;
    const { quantity } = req.body;

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM OrderItems WHERE order_item_id = ?',
            [order_item_id]
        );
        if (!rows.length) {
            return res.status(404).json({ error: 'Order item not found' });
        }

        await pool.execute(
            'UPDATE OrderItems SET quantity = ? WHERE order_item_id = ?',
            [quantity, order_item_id]
        );

        res.json({ message: 'Order item updated successfully' });
    } catch (error) {
        console.error(`Error updating order item ${order_item_id}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete order item
exports.deleteOrderItem = async (req, res) => {
    const { order_item_id } = req.params;

    try {
        const [rows] = await pool.execute(
            'SELECT * FROM OrderItems WHERE order_item_id = ?',
            [order_item_id]
        );
        if (!rows.length) {
            return res.status(404).json({ error: 'Order item not found' });
        }

        await pool.execute(
            'DELETE FROM OrderItems WHERE order_item_id = ?',
            [order_item_id]
        );

        res.json({ message: 'Order item deleted successfully' });
    } catch (error) {
        console.error(`Error deleting order item ${order_item_id}:`, error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get best-selling products (Admin only)
exports.getBestSellingProducts = async (req, res) => {
    try {
      const {
        year = "all",
        month = "all",
        limit = 3
      } = req.query;
  
      const filters = ["o.status = 'delivered'"];
      const values = [];
  
      // Optional: Filter by year and month
      if (year !== "all") {
        if (month !== "all") {
          const monthNumber = new Date(Date.parse(`${month} 1, ${year}`)).getMonth() + 1;
          if (isNaN(monthNumber)) {
            return res.status(400).json({ error: "Invalid month format" });
          }
          const start = `${year}-${String(monthNumber).padStart(2, '0')}-01`;
          const end = `${year}-${String(monthNumber).padStart(2, '0')}-31`;
          filters.push("o.created_at BETWEEN ? AND ?");
          values.push(start, end);
        } else {
          filters.push("YEAR(o.created_at) = ?");
          values.push(year);
        }
      }
  
      // ✅ Safely validate the limit before injecting into SQL
      const numericLimit = parseInt(limit, 10);
      if (isNaN(numericLimit) || numericLimit <= 0) {
        return res.status(400).json({ error: "Invalid limit value" });
      }
  
      // ✅ Final SQL with validated limit inserted directly
      const query = `
        SELECT 
          p.product_id,
          p.name AS product_name,
          p.stock_quantity,
          c.name AS category_name,
          SUM(oi.quantity) AS totalSales
        FROM OrderItems oi
        JOIN Products p ON oi.product_id = p.product_id
        JOIN Categories c ON p.category_id = c.category_id
        JOIN Orders o ON oi.order_id = o.order_id
        WHERE ${filters.join(" AND ")}
        GROUP BY p.product_id
        ORDER BY totalSales DESC
        LIMIT ${numericLimit}`; // 👈 Insert directly here
  
      const [rows] = await pool.execute(query, values);
  
      res.status(200).json(rows);
    } catch (error) {
      console.error("Get Best-Selling Products Error:", error);
      res.status(500).json({ error: error.message });
    }
  };
  