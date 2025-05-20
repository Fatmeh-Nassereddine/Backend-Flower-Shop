const pool = require('../config/db');
const { sendCancelEmail } = require('../utils/mailer');

// Create new subscription
const createSubscription = async (req, res) => {
  const user_id = req.user.id; // from auth middleware
  const { start_date, delivery_frequency } = req.body;

  if (!start_date || !delivery_frequency) {
    return res.status(400).json({ message: 'Start date and delivery frequency are required' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO Subscriptions (user_id, start_date, delivery_frequency) VALUES (?, ?, ?)`,
      [user_id, start_date, delivery_frequency]
    );

    res.status(201).json({ subscription_id: result.insertId, message: 'Subscription created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all subscriptions for logged-in user
const getUserSubscriptions = async (req, res) => {
  const user_id = req.user.id;

  try {
    const [subscriptions] = await pool.execute(
      `SELECT subscription_id, start_date, delivery_frequency, status FROM Subscriptions WHERE user_id = ?`,
      [user_id]
    );

    res.json(subscriptions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel a subscription
const cancelSubscription = async (req, res) => {
  const user_id = req.user.id;
  const subscription_id = req.params.id;

  try {
    // Check subscription belongs to user
    const [subs] = await pool.execute(
      `SELECT * FROM Subscriptions WHERE subscription_id = ? AND user_id = ?`,
      [subscription_id, user_id]
    );
    if (subs.length === 0) return res.status(404).json({ message: 'Subscription not found' });

    // Update status to cancelled
    await pool.execute(
      `UPDATE Subscriptions SET status = 'cancelled' WHERE subscription_id = ?`,
      [subscription_id]
    );

    // Send cancellation email
    const [userRows] = await pool.execute('SELECT email FROM Users WHERE id = ?', [user_id]);
    const userEmail = userRows[0]?.email;
    if (userEmail) {
      await sendCancelEmail(userEmail, subscription_id);
    }

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllSubscriptions = async (req, res) => {
    try {
      const [subscriptions] = await pool.execute(
        `SELECT s.subscription_id, s.user_id, u.email, s.start_date, s.delivery_frequency, s.status
         FROM Subscriptions s
         JOIN Users u ON s.user_id = u.id`
      );
      res.json(subscriptions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

module.exports = {
  createSubscription,
  getUserSubscriptions,
  cancelSubscription,
  getAllSubscriptions,
};
