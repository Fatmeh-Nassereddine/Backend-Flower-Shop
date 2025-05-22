// notifications.controller.js
const pool = require('../config/db');

// Get unseen orders and subscriptions
exports.getOrderAndSubscriptionNotifications = async (req, res) => {
  try {
    const [orders] = await pool.execute('SELECT order_id, order_date FROM Orders WHERE is_viewed = FALSE ORDER BY order_date DESC LIMIT 10');
    const [subscriptions] = await pool.execute('SELECT subscription_id, created_at, delivery_frequency FROM Subscriptions WHERE is_viewed = FALSE ORDER BY created_at DESC LIMIT 10');

    res.json({ orders, subscriptions });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get unseen messages
exports.getMessageNotifications = async (req, res) => {
  try {
    const [messages] = await pool.execute('SELECT id, first_name, subject, created_at FROM Contacts WHERE is_viewed = FALSE ORDER BY created_at DESC LIMIT 10');
    res.json({ messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all unseen orders as viewed
exports.markOrdersViewed = async (req, res) => {
  try {
    await pool.execute('UPDATE Orders SET is_viewed = TRUE WHERE is_viewed = FALSE');
    res.json({ message: 'Orders marked as viewed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all unseen subscriptions as viewed
exports.markSubscriptionsViewed = async (req, res) => {
  try {
    await pool.execute('UPDATE Subscriptions SET is_viewed = TRUE WHERE is_viewed = FALSE');
    res.json({ message: 'Subscriptions marked as viewed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark all unseen messages as viewed
exports.markMessagesViewed = async (req, res) => {
  try {
    await pool.execute('UPDATE Contacts SET is_viewed = TRUE WHERE is_viewed = FALSE');
    res.json({ message: 'Messages marked as viewed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
