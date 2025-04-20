


const Shipping = require('../models/shipping');

// Get delivery fee (assumes only one or first record matters)
exports.getDeliveryFee = async (req, res) => {
  try {
    const shippings = await Shipping.getAll();
    if (shippings.length === 0) {
      return res.status(404).json({ error: 'No shipping fee set' });
    }

    res.json({ delivery_fee: shippings[0].delivery_fee });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Update or insert delivery fee
exports.updateDeliveryFee = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied! Admins only.' });
    }

    const { delivery_fee } = req.body;
    if (delivery_fee == null) {
      return res.status(400).json({ error: 'Delivery fee is required' });
    }

    const shippings = await Shipping.getAll();

    if (shippings.length === 0) {
      await Shipping.create({ delivery_fee, order_id: null });
    } else {
      await Shipping.update(shippings[0].id, {
        delivery_fee,
        order_id: shippings[0].order_id,
      });
    }

    res.json({ message: 'Delivery fee updated successfully', delivery_fee });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

