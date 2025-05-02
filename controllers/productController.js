// // controllers/productController.js
// const { v4: uuidv4 } = require('uuid');
// const { uploadFile } = require('../config/cloudinary');
// const upload = require('../config/multer');
// const pool = require('../config/db');
// const Product = require('../models/product');
// const Image = require('../models/image');
// const cloudinary = require('cloudinary').v2;
// const productSchema = require('../validations/productValidation'); 

// // GET all products
// // controllers/productController.js
// const getAllProducts = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       categories = "",
//       seasons = "",
//       search = "",
//       minPrice = 0,
//       maxPrice = 200
//     } = req.query;

//     const pageNum = parseInt(page, 10);
//     const limitNum = parseInt(limit, 10);
//     const offset = (pageNum - 1) * limitNum;

//     let query = `
//       SELECT p.*, i.image_url, i.is_primary, c.name AS category_name, s.name AS season_name
//       FROM Products p
//       LEFT JOIN Images i ON p.product_id = i.product_id AND i.is_primary = true
//       LEFT JOIN Categories c ON p.category_id = c.category_id
//       LEFT JOIN Seasons s ON p.season_id = s.season_id
//     `;

//     const filters = [];
//     const values = [];

//     // Filter by categories
//     if (categories) {
//       const categoryIds = categories.split(',').map(Number).filter(Boolean);
//       if (categoryIds.length > 0) {
//         filters.push(`p.category_id IN (${categoryIds.map(() => '?').join(',')})`);
//         values.push(...categoryIds);
//       }
//     }

//     // Filter by seasons
//     if (seasons) {
//       const seasonIds = seasons.split(',').map(Number).filter(Boolean);
//       if (seasonIds.length > 0) {
//         filters.push(`p.season_id IN (${seasonIds.map(() => '?').join(',')})`);
//         values.push(...seasonIds);
//       }
//     }

//     // Search by name
//     if (search) {
//       filters.push(`p.name LIKE ?`);
//       values.push(`%${search}%`);
//     }

//     // Filter by price range
//     filters.push(`p.price BETWEEN ? AND ?`);
//     values.push(parseFloat(minPrice), parseFloat(maxPrice));

//     // Apply filters if any
//     if (filters.length > 0) {
//       query += ` WHERE ${filters.join(' AND ')}`;
//     }

//     query += ` ORDER BY p.product_id DESC LIMIT ? OFFSET ?`;
//     values.push(limitNum, offset);

//     const [products] = await pool.query(query, values);

//     // Get total count with the same filters
//     let countQuery = `SELECT COUNT(*) AS count FROM Products p`;
//     if (filters.length > 0) {
//       countQuery += ` WHERE ${filters.join(' AND ')}`;
//     }
//     const [totalCountResult] = await pool.query(countQuery, values.slice(0, -2));
//     const totalCount = totalCountResult[0].count;

//     // Format the products
//     const productsWithImages = products.reduce((acc, row) => {
//       const {
//         product_id,
//         name,
//         description,
//         price,
//         is_seasonal,
//         is_featured,
//         stock_quantity,
//         category_id,
//         season_id,
//         image_url,
//         is_primary,
//         category_name,
//         season_name
//       } = row;

//       let product = acc.find(p => p.product_id === product_id);
//       if (!product) {
//         product = {
//           product_id,
//           name,
//           description,
//           price,
//           is_seasonal,
//           is_featured,
//           stock_quantity,
//           category_id,
//           season_id,
//           category_name,
//           season_name,
//           images: []
//         };
//         acc.push(product);
//       }

//       if (image_url) {
//         product.images.push({ image_url, is_primary });
//       }

//       return acc;
//     }, []);

//     res.status(200).json({
//       data: productsWithImages,
//       totalCount,
//       totalPages: Math.ceil(totalCount / limitNum),
//       currentPage: pageNum,
//       limit: limitNum
//     });
//   } catch (error) {
//     console.error('❌ Error fetching products:', error);
//     res.status(500).json({ error: 'Failed to fetch products.' });
//   }
// };


// // GET single product
// const getProductById = async (req, res) => {
//   try {
//     const { product_id } = req.params;
//     const productData = await Product.getById(product_id);

//     if (!productData) return res.status(404).json({ error: 'Product not found.' });

//     const images = await Image.findAllImages({ product_id });

//     res.status(200).json({
//       ...productData,
//       images
//     });
//   } catch (error) {
//     console.error('Error fetching product:', error);
//     res.status(500).json({ error: 'Failed to fetch product.' });
//   }
// };

// // ADD product
// const addProduct = async (req, res) => {
//   const {
//     name,
//     description,
//     price,
//     stock_quantity,
//     category_id,
//     season_id,
//     is_seasonal,
//     is_featured
//   } = req.body;

//   if (!name || !description || !price || !stock_quantity) {
//     return res.status(400).json({
//       data: null,
//       message: "All required fields must be provided",
//       error: null,
//     });
//   }

//   const newProductId = uuidv4();
//   const productData = {
//     product_id: newProductId,
//     name,
//     description,
//     price,
//     is_seasonal: is_seasonal || false,
//     is_featured: is_featured || false,
//     stock_quantity,
//     category_id: category_id || null,
//     season_id: season_id || null,
//   };

//   try {
//     const newProduct = await Product.create(productData);

//     // ✅ Save uploaded image data from req.files (already uploaded to Cloudinary)
//     if (req.files && req.files.length > 0) {
//       for (let i = 0; i < req.files.length; i++) {
//         const file = req.files[i];
//         const imageId = uuidv4();
//         const imageUrl = file.path; // URL from Cloudinary
//         const publicId = file.filename; // Cloudinary public ID
//         const isPrimary = i === 0;

//         await pool.query(
//           'INSERT INTO Images (image_id, image_url, public_id, product_id, is_primary) VALUES (?, ?, ?, ?, ?)',
//           [imageId, imageUrl, publicId, newProductId, isPrimary]
//         );
//       }
//     }

//     res.status(201).json({
//       data: newProduct,
//       message: "Product added successfully with images",
//       error: null,
//     });
//   } catch (error) {
//     console.error("Error adding product:", error);
//     res.status(500).json({
//       data: null,
//       message: "Error adding product",
//       error: error.message,
//     });
//   }
// };


//new ADD product
// const { pool } = require('../db'); // Assuming you have a MySQL pool connection
// const { v4: uuidv4 } = require('uuid'); // For generating UUIDs
// const productSchema = require('../validations/productValidation'); // Import Joi validation schema

// // ADD product with Transaction Support
// const addProduct = async (req, res) => {
//   const { error } = productSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.status(400).json({
//       data: null,
//       message: "Validation error",
//       error: error.details.map(err => err.message),
//     });
//   }

//   const {
//     name,
//     description,
//     price,
//     stock_quantity,
//     category_id,
//     season_id,
//     is_seasonal,
//     is_featured
//   } = req.body;

//   const newProductId = uuidv4(); // Generate new UUID for the product

//   // Start a MySQL transaction
//   const connection = await pool.getConnection();
//   await connection.beginTransaction(); // Begin the transaction

//   try {
//     // Insert the product into the Product table
//     const [result] = await connection.query(
//       'INSERT INTO Product (product_id, name, description, price, stock_quantity, is_seasonal, is_featured, category_id, season_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
//       [newProductId, name, description, price, stock_quantity, is_seasonal || false, is_featured || false, category_id || null, season_id || null]
//     );

//     // Handle uploaded image files (if any)
//     if (req.files && req.files.length > 0) {
//       for (let i = 0; i < req.files.length; i++) {
//         const file = req.files[i];
//         const imageId = uuidv4();
//         const imageUrl = file.path; // Assuming file.path is the Cloudinary URL
//         const publicId = file.filename; // Assuming file.filename is the public ID from Cloudinary
//         const isPrimary = i === 0; // First image is primary

//         // Insert image into the Images table
//         await connection.query(
//           'INSERT INTO Images (image_id, image_url, public_id, product_id, is_primary) VALUES (?, ?, ?, ?, ?)',
//           [imageId, imageUrl, publicId, newProductId, isPrimary]
//         );
//       }
//     }

//     // Commit the transaction
//     await connection.commit();
//     res.status(201).json({
//       message: "Product added successfully with images",
//       data: { product_id: newProductId },
//       error: null,
//     });
//   } catch (error) {
//     // If any error occurs, rollback the transaction
//     await connection.rollback();
//     console.error('Error during transaction:', error);
//     res.status(500).json({
//       message: "Error adding product",
//       data: null,
//       error: error.message,
//     });
//   } finally {
//     // Release the connection back to the pool
//     connection.release();
//   }
// };




// UPDATE product
// const updateProduct = async (req, res) => {
//   try {
//     const {
//       name,
//       description,
//       price,
//       is_seasonal,
//       is_featured,
//       stock_quantity,
//       category_id,
//       season_id
//     } = req.body;

//     const productId = req.params.product_id;
//     const existingProduct = await Product.getById(productId);

//     if (!existingProduct) {
//       return res.status(404).json({ error: 'Product not found.' });
//     }

//     // ✅ Update product fields
//     await Product.update(productId, {
//       name,
//       description,
//       price,
//       is_seasonal: is_seasonal === 'true',
//       is_featured: is_featured === 'true',
//       stock_quantity,
//       category_id: category_id || null,
//       season_id: season_id || null
//     });

//     // ✅ Handle multiple new images (already uploaded to Cloudinary)
//     if (req.files && req.files.length > 0) {
//       // Optionally remove old images here if needed

//       // Set existing primary image to false (if any)
//       await pool.query(
//         'UPDATE Images SET is_primary = false WHERE product_id = ?',
//         [productId]
//       );

//       for (let i = 0; i < req.files.length; i++) {
//         const file = req.files[i];
//         const imageId = uuidv4();
//         const imageUrl = file.path;
//         const publicId = file.filename;
//         const isPrimary = i === 0; // First uploaded image becomes the new primary

//         await pool.query(
//           'INSERT INTO Images (image_id, image_url, public_id, product_id, is_primary) VALUES (?, ?, ?, ?, ?)',
//           [imageId, imageUrl, publicId, productId, isPrimary]
//         );
//       }
//     }

//     const updatedProduct = await Product.getById(productId);
//     const images = await Image.findAllImages({ product_id: productId });

//     res.status(200).json({
//       ...updatedProduct,
//       images
//     });
//   } catch (err) {
//     console.error('Error updating Product:', err);
//     res.status(500).json({ message: 'Failed to update product' });
//   }
// };

//
// New UPDATE product with Transaction Support
// const updateProduct = async (req, res) => {
//   const { error } = productSchema.validate(req.body, { abortEarly: false });
//   if (error) {
//     return res.status(400).json({
//       data: null,
//       message: "Validation error",
//       error: error.details.map(err => err.message),
//     });
//   }

//   const {
//     name,
//     description,
//     price,
//     is_seasonal,
//     is_featured,
//     stock_quantity,
//     category_id,
//     season_id
//   } = req.body;

//   const productId = req.params.product_id;

//   // Start a MySQL transaction
//   const connection = await pool.getConnection();
//   await connection.beginTransaction(); // Begin the transaction

//   try {
//     // Check if product exists
//     const [existingProduct] = await connection.query('SELECT * FROM Product WHERE product_id = ?', [productId]);
//     if (!existingProduct) {
//       return res.status(404).json({ error: 'Product not found.' });
//     }

//     // Update the product in the Product table
//     await connection.query(
//       'UPDATE Product SET name = ?, description = ?, price = ?, stock_quantity = ?, is_seasonal = ?, is_featured = ?, category_id = ?, season_id = ? WHERE product_id = ?',
//       [name, description, price, stock_quantity, is_seasonal, is_featured, category_id || null, season_id || null, productId]
//     );

//     // Handle uploaded image files (if any)
//     if (req.files && req.files.length > 0) {
//       // Optionally remove old images before adding new ones (not implemented here)
//       await connection.query('UPDATE Images SET is_primary = false WHERE product_id = ?', [productId]);

//       // Insert new image records into the Images table
//       for (let i = 0; i < req.files.length; i++) {
//         const file = req.files[i];
//         const imageId = uuidv4();
//         const imageUrl = file.path;
//         const publicId = file.filename;
//         const isPrimary = i === 0; // Mark the first image as primary

//         await connection.query(
//           'INSERT INTO Images (image_id, image_url, public_id, product_id, is_primary) VALUES (?, ?, ?, ?, ?)',
//           [imageId, imageUrl, publicId, productId, isPrimary]
//         );
//       }
//     }

//     // Commit the transaction
//     await connection.commit();
//     res.status(200).json({
//       message: "Product updated successfully with images",
//       data: { product_id: productId },
//       error: null,
//     });
//   } catch (error) {
//     // If any error occurs, rollback the transaction
//     await connection.rollback();
//     console.error('Error during transaction:', error);
//     res.status(500).json({
//       message: "Error updating product",
//       data: null,
//       error: error.message,
//     });
//   } finally {
//     // Release the connection back to the pool
//     connection.release();
//   }
// };








// // DELETE product
// const deleteProduct = async (req, res) => {
//   try {
//     const productId = req.params.product_id;

//     const existingProduct = await Product.getById(productId);
//     if (!existingProduct) {
//       return res.status(404).json({ message: 'Product not found' });
//     }

//     // 🔥 1. Get all Cloudinary public_ids of product images
//     const [images] = await pool.query('SELECT public_id FROM images WHERE product_id = ?', [productId]);

//     // 🔥 2. Delete each image from Cloudinary
//     for (const img of images) {
//       if (img.public_id) {
//         await cloudinary.uploader.destroy(img.public_id);
//       }
//     }

//     // 🔥 3. Delete image records from DB
//     await pool.query('DELETE FROM images WHERE product_id = ?', [productId]);

//     // 🔥 4. Delete the product itself
//     await Product.delete(productId);

//     res.status(200).json({ message: 'Product and images deleted successfully' });

//   } catch (err) {
//     console.error('Error deleting Product:', err);
//     res.status(500).json({ message: 'Failed to delete Product' });
//   }
// };

// const getProductsBySeason = async (req, res) => {
//   try {
//     const { season_id } = req.params; // Extract season_id from the request URL
//     console.log(`Fetching products for season_id: ${season_id}`);

//     const query = `
//       SELECT p.*, i.image_url, s.name AS season_name
//       FROM Products p
//       LEFT JOIN Images i ON p.product_id = i.product_id AND i.is_primary = true
//       LEFT JOIN Seasons s ON p.season_id = s.season_id
//       WHERE p.season_id = ?  -- Filter by season_id
//     `;
  
//     const [products] = await pool.query(query, [season_id]);

//     if (products.length === 0) {
//       return res.status(404).json({ message: 'No products found for this season.' });
//     }

//     res.status(200).json(products); // Return the products with season info and images
//   } catch (error) {
//     console.error('Error fetching products by season:', error);
//     res.status(500).json({ message: 'Failed to fetch products by season.' });
//   }
// };



// module.exports = {
//   getAllProducts,
//   getProductById,
//   addProduct,
//   updateProduct,
//   deleteProduct,
//   getProductsBySeason
// };











const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;
const pool = require('../config/db');
const productSchema = require('../validations/productValidation');
const Product = require('../models/product');
const Image = require('../models/image');
const handleError = require('../utils/handleError'); // ✅ Central error handler
const { uploadFile } = require('../config/cloudinary');
const upload = require('../config/multer');

// GET all products
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      categories = "",
      seasons = "",
      search = "",
      minPrice = 0,
      maxPrice = 200
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT p.*, i.image_url, i.is_primary, c.name AS category_name, s.name AS season_name
      FROM Products p
      LEFT JOIN Images i ON p.product_id = i.product_id AND i.is_primary = true
      LEFT JOIN Categories c ON p.category_id = c.category_id
      LEFT JOIN Seasons s ON p.season_id = s.season_id
    `;

    const filters = [];
    const values = [];

    if (categories) {
      const categoryIds = categories.split(',').map(id => id.trim()).filter(Boolean);

      if (categoryIds.length > 0) {
        filters.push(`p.category_id IN (${categoryIds.map(() => '?').join(',')})`);
        values.push(...categoryIds);
      }
    }

    if (seasons) {
      const seasonIds = seasons.split(',').map(id => id.trim()).filter(Boolean);
      if (seasonIds.length > 0) {
        filters.push(`p.season_id IN (${seasonIds.map(() => '?').join(',')})`);
        values.push(...seasonIds);
      }
    }

    if (search) {
      filters.push(`p.name LIKE ?`);
      values.push(`%${search}%`);
    }

    filters.push(`p.price BETWEEN ? AND ?`);
    values.push(parseFloat(minPrice), parseFloat(maxPrice));

    if (filters.length > 0) {
      query += ` WHERE ${filters.join(' AND ')}`;
    }

    query += ` ORDER BY p.product_id DESC LIMIT ? OFFSET ?`;
    values.push(limitNum, offset);

    const [products] = await pool.query(query, values);

    let countQuery = `SELECT COUNT(*) AS count FROM Products p`;
    if (filters.length > 0) {
      countQuery += ` WHERE ${filters.join(' AND ')}`;
    }
    const [totalCountResult] = await pool.query(countQuery, values.slice(0, -2));
    const totalCount = totalCountResult[0].count;

    const productsWithImages = products.reduce((acc, row) => {
      const {
        product_id, name, description, price, is_seasonal,
        is_featured, stock_quantity, category_id, season_id,
        image_url, is_primary, category_name, season_name
      } = row;

      let product = acc.find(p => p.product_id === product_id);
      if (!product) {
        product = {
          product_id, name, description, price, is_seasonal,
          is_featured, stock_quantity, category_id, season_id,
          category_name, season_name, images: []
        };
        acc.push(product);
      }

      if (image_url) {
        product.images.push({ image_url, is_primary });
      }

      return acc;
    }, []);

    res.status(200).json({
      data: productsWithImages,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      limit: limitNum
    });

  } catch (error) {
    handleError(res, 'Failed to fetch products', error);
  }
};

// GET product by ID
const getProductById = async (req, res) => {
  try {
    const { product_id } = req.params;
    const productData = await Product.getById(product_id);
    if (!productData) return res.status(404).json({ error: 'Product not found.' });

    const images = await Image.findAllImages({ product_id });

    res.status(200).json({ ...productData, images });
  } catch (error) {
    handleError(res, 'Failed to fetch product', error);
  }
};

// ADD product
const addProduct = async (req, res) => {
  const { error } = productSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      data: null,
      message: "Validation error",
      error: error.details.map(err => err.message),
    });
  }

  const {
    name, description, price, stock_quantity,
    category_id, season_id, is_seasonal, is_featured
  } = req.body;

  const newProductId = uuidv4();

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    await connection.query(
      'INSERT INTO Products (product_id, name, description, price, stock_quantity, is_seasonal, is_featured, category_id, season_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [newProductId, name, description, price, stock_quantity, is_seasonal || false, is_featured || false, category_id || null, season_id || null]
    );

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageId = uuidv4();
        const imageUrl = file.path;
        const publicId = file.filename;
        const isPrimary = i === 0;

        await connection.query(
          'INSERT INTO Images (image_id, image_url, public_id, product_id, is_primary) VALUES (?, ?, ?, ?, ?)',
          [imageId, imageUrl, publicId, newProductId, isPrimary]
        );
      }
    }

    await connection.commit();
    res.status(201).json({
      message: "Product added successfully with images",
      data: { product_id: newProductId },
      error: null,
    });
  } catch (error) {
    await connection.rollback();
    handleError(res, 'Error adding product', error);
  } finally {
    connection.release();
  }
};

// UPDATE product
const updateProduct = async (req, res) => {
  console.log('season_id:', req.body.season_id);  // Debugging line
  const { error } = productSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      data: null,
      message: "Validation error",
      error: error.details.map(err => err.message),
    });
  }

  const {
    name, description, price, is_seasonal,
    is_featured, stock_quantity, category_id, season_id
  } = req.body;

  const productId = req.params.product_id;
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const [existingProduct] = await connection.query('SELECT * FROM Products WHERE product_id = ?', [productId]);
    if (existingProduct.length === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await connection.query(
      'UPDATE Products SET name = ?, description = ?, price = ?, stock_quantity = ?, is_seasonal = ?, is_featured = ?, category_id = ?, season_id = ? WHERE product_id = ?',
      [name, description, price, stock_quantity, is_seasonal, is_featured, category_id || null, season_id || null, productId]
    );

    if (req.files && req.files.length > 0) {
      await connection.query('UPDATE Images SET is_primary = false WHERE product_id = ?', [productId]);

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageId = uuidv4();
        const imageUrl = file.path;
        const publicId = file.filename;
        const isPrimary = i === 0;

        await connection.query(
          'INSERT INTO Images (image_id, image_url, public_id, product_id, is_primary) VALUES (?, ?, ?, ?, ?)',
          [imageId, imageUrl, publicId, productId, isPrimary]
        );
      }
    }

    await connection.commit();
    res.status(200).json({
      message: "Product updated successfully with images",
      data: { product_id: productId },
      error: null,
    });
  } catch (error) {
    await connection.rollback();
    handleError(res, 'Error updating product', error);
  } finally {
    connection.release();
  }
};

// DELETE product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.product_id;

    const existingProduct = await Product.getById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [images] = await pool.query('SELECT public_id FROM images WHERE product_id = ?', [productId]);

    for (const img of images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await pool.query('DELETE FROM images WHERE product_id = ?', [productId]);
    await Product.delete(productId);

    res.status(200).json({ message: 'Product and images deleted successfully' });
  } catch (err) {
    handleError(res, 'Failed to delete product', err);
  }
};

// GET products by season
const getProductsBySeason = async (req, res) => {
  try {
    const { season_id } = req.params;

    const query = `
      SELECT p.*, i.image_url, s.name AS season_name
      FROM Products p
      LEFT JOIN Images i ON p.product_id = i.product_id AND i.is_primary = true
      LEFT JOIN Seasons s ON p.season_id = s.season_id
      WHERE p.season_id = ?
    `;

    const [products] = await pool.query(query, [season_id]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this season.' });
    }

    res.status(200).json(products);
  } catch (error) {
    handleError(res, 'Failed to fetch products by season', error);
  }
  // Controller to get products by category
};
// ✅ Controller to get products by category
const getProductsByCategory = async (req, res) => {
  const { category_id } = req.params;

  try {
    const products = await Product.getProductsByCategory(category_id);

    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      res.status(404).json({ message: 'No products found for this category' });
    }
  } catch (error) {
    console.error("❌ Error fetching products by category:", error);
    res.status(500).json({ message: 'Failed to fetch products. Please try again later.' });
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductsBySeason,
  getProductsByCategory
};




