




const Discount = require('../models/discount');
const { v4: uuidv4 } = require('uuid');

// ========== Create Discount (Admin Only) ==========
const createDiscount = async (req, res) => {
  try {
    const {
      code,
      description,
      discount_type,
      amount,
      start_date,
      end_date,
      max_uses
    } = req.body;

    if (!code || !discount_type || !amount) {
      return res.status(400).json({ message: 'Code, discount type, and amount are required.' });
    }

    const [existingDiscount] = await Discount.findByCode(code);
    if (existingDiscount.length > 0) {
      return res.status(400).json({ message: 'Discount code already exists.' });
    }

    const discount_id = uuidv4();

    await Discount.create({
      discount_id,
      code,
      description,
      discount_type,
      amount,
      start_date,
      end_date,
      max_uses,
      current_uses: 0
    });

    res.status(201).json({ message: 'Discount created successfully.', discount_id });
  } catch (error) {
    console.error('Create Discount Error:', error);
    res.status(500).json({ message: 'Server error while creating discount.' });
  }
};

// ========== Get All Active Discounts ==========
const getAllDiscounts = async (req, res) => {
  try {
    const [discounts] = await Discount.getAll();
    console.log("Fetched discounts from DB:", discounts);  // Log the result to ensure the DB is returning the data
    
    const now = new Date();
    console.log("Current date:", now);  // Log the current date
    now.setHours(0, 0, 0, 0);  // Set current time to midnight to only compare the date part
    console.log('Today (normalized):', now);
    
    const activeDiscounts = discounts.filter(d => {
      const start = new Date(d.start_date);
      
      const end = new Date(d.end_date);
      start.setHours(0, 0, 0, 0);  // Set start date time to midnight
      end.setHours(23, 59, 59, 999);  // Set end date to the last possible time of the day (23:59:59)

      // 🔍 DEBUG LOGS
      console.log(`Checking discount: ${d.code}`);
      console.log('Start:', start, '| End:', end, '| Now:', now);
      return start <= now && end >= now;
    });
    console.log('Active Discounts:', activeDiscounts.map(d => d.code)); // Log active ones
    res.status(200).json(activeDiscounts);
  } catch (error) {
    console.error('Get Discounts Error:', error);
    res.status(500).json({ message: 'Server error while fetching discounts.' });
  }
};

// ========== Get Discount by Code ==========
const getDiscountByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const [discount] = await Discount.findByCode(code);

    if (discount.length === 0) {
      return res.status(404).json({ message: 'Discount not found.' });
    }

    res.status(200).json(discount[0]);
  } catch (error) {
    console.error('Get Discount Error:', error);
    res.status(500).json({ message: 'Server error while fetching discount.' });
  }
};

// ========== Update Discount (Admin Only) ==========
const updateDiscount = async (req, res) => {
  try {
    const { discount_id } = req.params;
    const [existing] = await Discount.findById(discount_id);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Discount not found.' });
    }

    await Discount.update(discount_id, req.body);
    res.status(200).json({ message: 'Discount updated successfully.' });
  } catch (error) {
    console.error('Update Discount Error:', error);
    res.status(500).json({ message: 'Server error while updating discount.' });
  }
};

// ========== Delete Discount (Admin Only) ==========
const deleteDiscount = async (req, res) => {
  try {
    const { discount_id } = req.params;
    const [existing] = await Discount.findById(discount_id);

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Discount not found.' });
    }

    await Discount.delete(discount_id);
    res.status(200).json({ message: 'Discount deleted successfully.' });
  } catch (error) {
    console.error('Delete Discount Error:', error);
    res.status(500).json({ message: 'Server error while deleting discount.' });
  }
};

module.exports = {
  createDiscount,
  getAllDiscounts,
  getDiscountByCode,
  updateDiscount,
  deleteDiscount,
};
