const pool = require('../config/db'); // Assuming your mysql2 pool is configured here
const { v4: uuidv4 } = require('uuid');

// Create a new image
const createImage = async (imageData) => {
  const { image_url, public_id, product_id, category_id, is_primary } = imageData;

  if (!image_url || !public_id) {
    console.error('❌ Missing image_url or public_id:', imageData);
    throw new Error('image_url and public_id are required');
  }
  const image_id = uuidv4(); // Generate a unique image_id

  try {
    const query = `
      INSERT INTO Images (image_id, image_url, public_id, product_id, category_id, is_primary)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      image_id,
      image_url,
      public_id,
      product_id || null,
      category_id || null,
      is_primary
    ]);
    return { image_id, image_url, public_id, product_id, category_id, is_primary };
  } catch (error) {
    console.error('Error creating image:', error);
    throw new Error('Failed to create image');
  }
};

// Find image by ID
const findById = async (image_id) => {
  try {
    const query = `SELECT * FROM Images WHERE image_id = ?`;
    const [rows] = await pool.query(query, [image_id]);
    return rows[0]; // Return the first image that matches the ID
  } catch (error) {
    console.error('Error fetching image by ID:', error);
    throw new Error('Failed to fetch image');
  }
};

// Find all images with optional filters
const findAllImages = async (filters = {}) => {
  const { product_id, category_id } = filters;
  try {
    let query = `SELECT * FROM Images WHERE 1=1`; // Basic query
    const params = [];

    // Apply filters if any
    if (product_id) {
      query += ` AND product_id = ?`;
      params.push(product_id);
    }

    if (category_id) {
      query += ` AND category_id = ?`;
      params.push(category_id);
    }

    const [rows] = await pool.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error fetching images:', error);
    throw new Error('Failed to fetch images');
  }
};

// Update an image by ID
const updateImage = async (image_id, updateData) => {
  const { image_url, public_id, is_primary, product_id, category_id } = updateData;
  try {
    const query = `
      UPDATE Images
      SET image_url = ?, public_id = ?, is_primary = ?, product_id = ?, category_id = ?
      WHERE image_id = ?
    `;
    const [result] = await pool.query(query, [
      image_url,
      public_id,
      is_primary,
      product_id || null,
      category_id || null,
      image_id
    ]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating image:', error);
    throw new Error('Failed to update image');
  }
};

// Delete an image by ID
const deleteImage = async (image_id) => {
  try {
    const query = `DELETE FROM Images WHERE image_id = ?`;
    const [result] = await pool.query(query, [image_id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
};

module.exports = {
  createImage,
  findById,
  findAllImages,
  updateImage,
  deleteImage
};

