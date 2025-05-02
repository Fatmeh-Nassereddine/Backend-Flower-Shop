// productValidation.js
const Joi = require('joi');

// Define the schema for the Product
const productSchema = Joi.object({
  product_id: Joi.string().uuid().required(), // Ensure product_id is a valid UUID
  name: Joi.string().min(3).max(100).required(), // Name must be between 3 and 100 characters
  description: Joi.string().max(500), // Optional, max length 500 characters
  price: Joi.number().greater(0).required(), // Price must be a positive number
  is_seasonal: Joi.number().valid(0, 1).default(0), // is_seasonal should be either 0 or 1
  is_featured: Joi.number().valid(0, 1).default(0), // is_featured should be either 0 or 1
  stock_quantity: Joi.number().integer().min(0).required(), // Stock must be a non-negative integer
  category_id: Joi.string().uuid().allow(null), // Category can be null or a valid UUID
  season_id: Joi.string().alphanum().allow(null) // Season can be null or a valid UUID
});

module.exports = productSchema;
