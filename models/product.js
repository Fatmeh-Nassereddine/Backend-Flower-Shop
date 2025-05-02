const pool = require('../config/db');

class Product {
  constructor(product_id, name, description, price, is_seasonal, is_featured, stock_quantity, category_id, season_id) {
    this.product_id = product_id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.is_seasonal = is_seasonal || false;
    this.is_featured = is_featured || false;
    this.stock_quantity = stock_quantity;
    this.category_id = category_id || null;
    this.season_id = season_id || null;
  }

  static async create(productData) {
    const { product_id, name, description, price, is_seasonal, is_featured, stock_quantity, category_id, season_id } = productData;
    try {
      const query = `
        INSERT INTO Products (product_id, name, description, price, is_seasonal, is_featured, stock_quantity, category_id, season_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await pool.query(query, [
        product_id,
        name,
        description,
        price,
        is_seasonal,
        is_featured,
        stock_quantity,
        category_id,
        season_id
      ]);
      return { ...productData };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  static async getAll() {
    const query = `
      SELECT p.*, i.image_url
      FROM Products p
      LEFT JOIN Images i ON p.product_id = i.product_id AND i.is_primary = true
    `;
    try {
      const [results] = await pool.query(query);
      return results;
    } catch (err) {
      throw new Error('Error fetching products: ' + err.message);
    }
  }

  static async getById(product_id) {
    const query = `
      SELECT p.*, i.image_url
      FROM Products p
      LEFT JOIN Images i ON p.product_id = i.product_id AND i.is_primary = true
      WHERE p.product_id = ?
    `;
    try {
      const [results] = await pool.query(query, [product_id]);
      return results.length > 0 ? results[0] : null;
    } catch (err) {
      throw new Error('Error fetching product by ID: ' + err.message);
    }
  }
// update Product.
  static async update(product_id, updateData) {
    try {
      const fields = Object.keys(updateData);
      if (fields.length === 0) throw new Error('No data provided for update');
  
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updateData[field]);
  
      values.push(product_id); // for WHERE clause
  
      const query = `UPDATE Products SET ${setClause} WHERE product_id = ?`;
  
      const [result] = await pool.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }
  

  static async delete(product_id) {
    try {
      const query = `DELETE FROM Products WHERE product_id = ?`;
      const [result] = await pool.query(query, [product_id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
  static async updateStock(product_id, quantity, connection = pool) {
    try {
      const query = 'UPDATE Products SET stock_quantity = stock_quantity - ? WHERE product_id = ?';
      const [result] = await connection.execute(query, [quantity, product_id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Failed to update product stock: ' + error.message);
    }
  }
  static async getProductsWithImages() {
    try {
      const query = `
        SELECT 
          p.*, 
          i.image_id, i.image_url, i.public_id, i.is_primary
        FROM Products p
        LEFT JOIN Images i ON p.product_id = i.product_id
      `;
      const [rows] = await pool.query(query);

      // Group products with images
      const productsMap = new Map();

      for (const row of rows) {
        const {
          product_id,
          image_id,
          image_url,
          public_id,
          is_primary,
          ...productData
        } = row;

        if (!productsMap.has(product_id)) {
          productsMap.set(product_id, {
            product_id,
            ...productData,
            images: []
          });
        }

        if (image_id) {
          productsMap.get(product_id).images.push({
            image_id,
            image_url,
            public_id,
            is_primary
          });
        }
      }

      return Array.from(productsMap.values());
    } catch (error) {
      console.error('❌ Error fetching products with images:', error);
      throw new Error('Failed to fetch products with images');
    }
  }

  // productsController.js (or Product model file)

static async getProductsByCategory(category_id) {
  const query = `
    SELECT p.*, i.image_url, c.name AS category_name
FROM Products p
LEFT JOIN Images i ON p.product_id = i.product_id AND i.is_primary = true
LEFT JOIN Categories c ON p.category_id = c.category_id
WHERE p.category_id = ?

  `;
  try {
    const [results] = await pool.query(query, [category_id]);
    return results;
  } catch (err) {
    throw new Error('Error fetching products by category: ' + err.message);
  }
}

}

module.exports = Product;

