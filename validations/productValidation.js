// productValidation.js
// const Joi = require('joi');

// // Define the schema for the Product
// const productSchema = Joi.object({
//   product_id: Joi.string().uuid().optional(), // Ensure product_id is a valid UUID
//   name: Joi.string().min(3).max(100).required(), // Name must be between 3 and 100 characters
//   description: Joi.string().max(500), // Optional, max length 500 characters
//   price: Joi.number().greater(0).required(), // Price must be a positive number
//   is_seasonal: Joi.number().valid(0, 1).default(0), // is_seasonal should be either 0 or 1
//   is_featured: Joi.number().valid(0, 1).default(0), // is_featured should be either 0 or 1
//   stock_quantity: Joi.number().integer().min(0).required(), // Stock must be a non-negative integer
//   category_id: Joi.string().uuid().allow(null), // Category can be null or a valid UUID
//   season_id: Joi.string().alphanum().allow(null) // Season can be null or a valid UUID
// });

// module.exports = productSchema;



const Joi = require('joi');
// In productValidation.js
const productSchema = Joi.object({
  product_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(1000).allow(''), // Increased limit
  price: Joi.number().precision(2).positive().required(), // Ensures 2 decimal places
 is_seasonal: Joi.number().valid(0, 1).default(0), // is_seasonal should be either 0 or 1
  is_featured: Joi.number().valid(0, 1).default(0), // is_featured should be either 0 or 1
  stock_quantity: Joi.number().integer().min(0).required(),
  category_id: Joi.string().uuid().required(), // Changed from allow(null)
  season_id: Joi.string().pattern(/^[A-Za-z0-9]+$/).max(10).required() // Specific pattern for season IDs
}).prefs({ convert: true }); // ✅ allow string-to-number conversion


module.exports = productSchema;