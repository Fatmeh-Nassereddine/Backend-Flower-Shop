// // helpers/orderHelpers.js
// const pool = require('../config/db');

// exports.updateOrderTotalValue = async (order_id) => {
//   const query = `
//     UPDATE Orders o
//     JOIN (
//       SELECT order_id, 
//              SUM(subtotal) + 
//              IFNULL((SELECT delivery_fee FROM Shippings WHERE order_id = ?), 0) AS total
//       FROM OrderItems 
//       WHERE order_id = ?
//       GROUP BY order_id
//     ) i ON o.order_id = i.order_id
//     SET o.total_amount = i.total
//     WHERE o.order_id = ?
//   `;

//   try {
//     await pool.execute(query, [order_id, order_id, order_id]);
//     console.log('✅ Order total updated');
//   } catch (error) {
//     throw new Error('Failed to update order total: ' + error.message);
//   }
// };

// exports.confirmOrderStatus = async (order_id) => {
//   try {
//     await pool.execute(
//       `UPDATE Orders SET status = 'confirmed' WHERE order_id = ?`,
//       [order_id]
//     );
//     console.log('✅ Order status confirmed');
//   } catch (error) {
//     throw new Error('Failed to confirm order: ' + error.message);
//   }
// };
