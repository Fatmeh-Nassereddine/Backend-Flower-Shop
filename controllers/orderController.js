




// const Cart = require('../models/cart');
// const CartItem = require('../models/CartItem');
// const Order = require('../models/order');
// const OrderItem = require('../models/OrderItem');

// const Shipping = require('../models/shipping');
// const pool = require('../config/db');

// Helper to create address inside a transaction
// async function createAddressInTransaction(connection, addressData) {
//   const { street_address, city, governorate, phone_number, user_id } = addressData;
//   const [result] = await connection.execute(
//     `INSERT INTO Addresses 
//        (street_address, city, governorate, phone_number, user_id)
//      VALUES (?, ?, ?, ?, ?)`,
//     [street_address, city, governorate, phone_number || null, user_id]
//   );
//   return result.insertId;
// }

// // Checkout a cart and create an order
// exports.checkout = async (req, res) => {
//   const connection = await pool.getConnection();
//   await connection.beginTransaction();

//   try {
//     const user_id = req.user.id;
//     const { shippingAddress } = req.body;

//     // 1. Get user's cart
//     const userCart = await Cart.getCartByUser(user_id);
//     if (!userCart) return res.status(400).json({ error: 'Cart not found' });

//     // 2. Get cart items
//     const cartItems = await CartItem.getItems(userCart.cart_id);
//     if (!cartItems.length) return res.status(400).json({ error: 'Cart is empty' });

//     // 3. Get shipping fee
//     const shippingOptions = await Shipping.getAll();
//     const delivery_fee = parseFloat(shippingOptions[0]?.delivery_fee || 0);

//     // 4. Calculate total and check stock
//     let total_product_amount = 0;
//     for (const item of cartItems) {
//       const product = await Product.getById(item.product_id);
//       if (!product) {
//         throw new Error(`Product with ID ${item.product_id} not found`);
//       }
//       if (product.stock_quantity < item.quantity) {
//         throw new Error(`Not enough stock for ${product.name}`);
//       }
//       total_product_amount += product.price * item.quantity;
//     }
//     const total_amount = total_product_amount + delivery_fee;

//     // 5. Handle shipping address
//     let shipping_address_id;
//     if (shippingAddress?.address_id) {
//       shipping_address_id = shippingAddress.address_id;
//     } else if (
//       shippingAddress?.street_address &&
//       shippingAddress?.city &&
//       shippingAddress?.governorate
//     ) {
//       shipping_address_id = await createAddressInTransaction(connection, {
//         street_address: shippingAddress.street_address,
//         city: shippingAddress.city,
//         governorate: shippingAddress.governorate,
//         phone_number: shippingAddress.phone_number,
//         user_id
//       });
//     } else {
//       throw new Error('Invalid or missing shipping address.');
//     }

//     // 6. Create Order
//     const [orderResult] = await connection.execute(
//       `INSERT INTO Orders 
//          (user_id, total_amount, status, payment_method, shipping_address_id)
//        VALUES (?, ?, ?, ?, ?)`,
//       [user_id, total_amount, 'pending', 'Cash on Delivery', shipping_address_id]
//     );
//     const order_id = orderResult.insertId;

//     // 7. Insert Shipping
//     await connection.execute(
//       `INSERT INTO Shippings (order_id, delivery_fee) VALUES (?, ?)`,
//       [order_id, delivery_fee]
//     );

//     // 8. Insert OrderItems
//     for (const item of cartItems) {
//       // fetch current unit price to ensure correctness
//       const product = await Product.getById(item.product_id);
//       const unit_price = product.price;
//       const subtotal = unit_price * item.quantity;

//       await connection.execute(
//         `INSERT INTO OrderItems
//            (quantity, unit_price, subtotal, order_id, product_id)
//          VALUES (?, ?, ?, ?, ?)`,
//         [item.quantity, unit_price, subtotal, order_id, item.product_id]
//       );

//       // deduct stock
//       await Product.update(item.product_id, {
//         stock_quantity: product.stock_quantity - item.quantity
//       });
//     }

//     await connection.commit();
//     res.status(200).json({ message: 'Order placed successfully', order_id });
//   } catch (error) {
//     await connection.rollback();
//     console.error('Checkout Error:', error);
//     res.status(500).json({ error: 'Checkout failed', details: error.message });
//   } finally {
//     connection.release();
//   }
// };







const pool = require('../config/db');
const Order = require('../models/order');
const Shipping = require('../models/shipping');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/product');

exports.createFullOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      user_id,
      shipping_address_id,
      total_amount,
      payment_method,
      delivery_fee,
      items, // Array of { product_id, quantity, unit_price }
    } = req.body;

    // 1. Create the Order
    const order_id = await Order.create(
      user_id,
      total_amount,
      'pending',
      payment_method,
      shipping_address_id,
      connection
    );

    // 2. Create the Shipping
    await Shipping.create({ delivery_fee, order_id }, connection);

    // 3. Create each Order Item
    for (const item of items) {
      const { product_id, quantity, unit_price } = item;

      await OrderItem.create(
        { order_id, product_id, quantity, unit_price },
        connection
      );
    }

    // 4. Commit Transaction
    await connection.commit();

    res.status(201).json({
      message: 'Order placed successfully',
      order_id,
    });
  } catch (error) {
    await connection.rollback();
    console.error('❌ Transaction failed:', error.message);
    res.status(500).json({ error: 'Failed to create order' });
  } finally {
    connection.release();
  }
};



// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admins only' });
    }
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
    if (!orders.length) {
      return res.status(404).json({ error: 'No orders found' });
    }
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
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (req.user.id !== order.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const items = await OrderItem.getByOrderId(order_id);
    res.status(200).json(items);
  } catch (error) {
    console.error('Get Order Items Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get full order history for a user
exports.getOrderItemsByUser = async (req, res) => {
  const user_id = req.user.id;
  try {
    const [orders] = await pool.execute(
      `SELECT * FROM Orders WHERE user_id = ? ORDER BY order_date DESC`,
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

// Cancel an order (Admin only)
exports.cancelOrder = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admins only' });
    }
    const { order_id } = req.params;
    const order = await Order.getById(order_id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
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
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admins only' });
    }
    const { order_id } = req.params;
    const order = await Order.getById(order_id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (!['pending', 'canceled'].includes(order.status)) {
      return res.status(400).json({ error: 'Only pending or canceled orders can be deleted' });
    }
    const items = await OrderItem.getByOrderId(order_id);
    for (const item of items) {
      const product = await Product.getById(item.product_id);
      await Product.update(item.product_id, {
        stock_quantity: product.stock_quantity + item.quantity
      });
    }
    await OrderItem.deleteByOrderId(order_id);
    await pool.execute('DELETE FROM Shippings WHERE order_id = ?', [order_id]);
    await Order.delete(order_id);
    res.status(200).json({ message: 'Order and related items deleted' });
  } catch (error) {
    console.error('Delete Order Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update an order (Admin only)
exports.updateOrder = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admins only' });
    }
    const { order_id } = req.params;
    const { status } = req.body;
    const order = await Order.getById(order_id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    await Order.updateStatus(order_id, status);
    res.status(200).json({ message: 'Order updated' });
  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update a specific order item
exports.updateOrderItem = async (req, res) => {
  const { order_item_id } = req.params;
  const { quantity } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get current item
    const [existingItems] = await connection.execute(
      'SELECT * FROM OrderItems WHERE order_item_id = ?',
      [order_item_id]
    );

    if (!existingItems.length) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    const existingItem = existingItems[0];
    const { product_id, quantity: oldQty } = existingItem;

    const [products] = await connection.execute(
      'SELECT stock_quantity FROM Products WHERE product_id = ?',
      [product_id]
    );

    if (!products.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    const quantityDiff = quantity - oldQty;

    if (product.stock_quantity < quantityDiff) {
      return res.status(400).json({ error: 'Not enough stock to update quantity' });
    }

    await connection.execute(
      'UPDATE OrderItems SET quantity = ? WHERE order_item_id = ?',
      [quantity, order_item_id]
    );

    await connection.execute(
      'UPDATE Products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
      [quantityDiff, product_id]
    );

    await connection.commit();
    res.json({ message: 'Order item updated successfully' });

  } catch (error) {
    await connection.rollback();
    console.error(`Update Order Item Error:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    connection.release();
  }
};





// Get best-selling products (Admin only)
exports.getBestSellingProducts = async (req, res) => {
  try {
    const { year = 'all', month = 'all', limit = 3 } = req.query;
    const filters = ["o.status = 'delivered'"];
    const values = [];

    if (year !== 'all') {
      if (month !== 'all') {
        const monthNum = new Date(Date.parse(`${month} 1, ${year}`)).getMonth() + 1;
        if (isNaN(monthNum)) {
          return res.status(400).json({ error: 'Invalid month format' });
        }
        const start = `${year}-${String(monthNum).padStart(2, '0')}-01`;
        const end = `${year}-${String(monthNum).padStart(2, '0')}-31`;
        filters.push('o.order_date BETWEEN ? AND ?');
        values.push(start, end);
      } else {
        filters.push('YEAR(o.order_date) = ?');
        values.push(year);
      }
    }

    const numericLimit = parseInt(limit, 10);
    if (isNaN(numericLimit) || numericLimit <= 0) {
      return res.status(400).json({ error: 'Invalid limit value' });
    }

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
      WHERE ${filters.join(' AND ')}
      GROUP BY p.product_id
      ORDER BY totalSales DESC
      LIMIT ${numericLimit}
    `;

    const [rows] = await pool.execute(query, values);
    res.status(200).json({ bestSellingProducts: rows });
  } catch (error) {
    console.error('Get Best-Selling Products Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
