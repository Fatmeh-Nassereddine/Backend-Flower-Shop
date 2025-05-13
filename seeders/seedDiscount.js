const { v4: uuidv4 } = require('uuid');
const Discount = require('../models/discount');  // Your Discount model

async function seedDiscount() {
  // Array of discounts to be created
  const discounts = [
    {
      code: "SPRING15",
      description: "15% off for spring season!",
      discount_type: "percentage",
      amount: 15,
      start_date: "2025-05-14",
      end_date: "2025-06-01",
      max_uses: 50,
      current_uses: 0,
    },
    {
      code: "SUMMER20",
      description: "20% off for summer sale!",
      discount_type: "percentage",
      amount: 20,
      start_date: "2025-06-01",
      end_date: "2025-07-01",
      max_uses: 100,
      current_uses: 0,
    },
    {
      code: "WINTER30",
      description: "30% off for winter discounts!",
      discount_type: "percentage",
      amount: 30,
      start_date: "2025-12-01",
      end_date: "2025-12-31",
      max_uses: 30,
      current_uses: 0,
    },
    {
      code: "BLACKFRIDAY50",
      description: "50% off for Black Friday special!",
      discount_type: "percentage",
      amount: 50,
      start_date: "2025-11-27",
      end_date: "2025-11-30",
      max_uses: 200,
      current_uses: 0,
    },
    {
      code: "NEWYEAR10",
      description: "10% off for New Year celebration!",
      discount_type: "percentage",
      amount: 10,
      start_date: "2025-12-31",
      end_date: "2026-01-05",
      max_uses: 75,
      current_uses: 0,
    },
    {
      code: "WINTERSALE25",
      description: "Flat $25 off on winter items!",
      discount_type: "fixed",
      amount: 25,
      start_date: "2025-12-01",
      end_date: "2025-12-31",
      max_uses: 50,
      current_uses: 0,
    }
  ];

  // Loop through each discount and create them in the database
  for (const discount of discounts) {
    await Discount.create({
      discount_id: uuidv4(),  // Generate a unique ID for each discount
      code: discount.code,
      description: discount.description,
      discount_type: discount.discount_type,
      amount: discount.amount,
      start_date: discount.start_date,
      end_date: discount.end_date,
      max_uses: discount.max_uses,
      current_uses: discount.current_uses,
    });
  }

  console.log("✅ Discounts seeded");
}

seedDiscount().catch(console.error);
