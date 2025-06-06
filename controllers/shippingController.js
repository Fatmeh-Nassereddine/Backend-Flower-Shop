


const Shipping = require('../models/shipping'); // Import the Shipping model
const ShippingOption = require('../models/shippingOption');
// Create a new shipping record
exports.createShipping = async (req, res) => {
  const { delivery_fee, order_id } = req.body;

  if (!delivery_fee || !order_id) {
    return res.status(400).json({ 
      success: false,
      error: 'Delivery fee and order ID are required',
      details: { received: { delivery_fee, order_id } }
    });
  }

  try {
    const shippingId = await Shipping.create({ delivery_fee, order_id });
    
    if (!shippingId) {
      throw new Error('Failed to get shipping ID from database');
    }

    res.status(201).json({ 
      success: true,
      message: 'Shipping record created successfully', 
      shippingId 
    });
    
  } catch (error) {
    console.error('Shipping creation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create shipping record',
      details: error.message 
    });
  }
};

// Get all shipping records
exports.getAllShippings = async (req, res) => {
  try {
    const shippings = await Shipping.getAll();
    res.status(200).json(shippings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a shipping record by ID
exports.getShippingById = async (req, res) => {
  const { id } = req.params;

  try {
    const shipping = await Shipping.getById(id);

    if (!shipping) {
      return res.status(404).json({ message: 'Shipping record not found' });
    }

    res.status(200).json(shipping);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a shipping record
exports.updateShipping = async (req, res) => {
  const { id } = req.params;
  const { delivery_fee, order_id } = req.body;

  if (!delivery_fee && !order_id) {
    return res.status(400).json({ error: 'At least one field (delivery_fee or order_id) is required to update' });
  }

  try {
    const updated = await Shipping.update(id, { delivery_fee, order_id });

    if (!updated) {
      return res.status(404).json({ message: 'Shipping record not found' });
    }

    res.status(200).json({ message: 'Shipping record updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a shipping record
exports.deleteShipping = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Shipping.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Shipping record not found' });
    }

    res.status(200).json({ message: 'Shipping record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getShippingOptions = async (req, res) => {
  try {
    const options = await ShippingOption.getAll();
    res.status(200).json(options);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
