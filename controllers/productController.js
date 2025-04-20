// controllers/productController.js
const { v4: uuidv4 } = require('uuid');
const { uploadFile } = require('../config/cloudinary');
const upload = require('../config/multer');
const pool = require('../config/db');
const Product = require('../models/product');
const Image = require('../models/image');
const cloudinary = require('cloudinary').v2;

// GET all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    const productsWithImages = await Promise.all(
      products.map(async (p) => {
        const images = await Image.findAllImages({ product_id: p.product_id });
        return {
          ...p,
          images
        };
      })
    );
    res.status(200).json(productsWithImages);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
};

// GET single product
const getProductById = async (req, res) => {
  try {
    const { product_id } = req.params;
    const productData = await Product.getById(product_id);

    if (!productData) return res.status(404).json({ error: 'Product not found.' });

    const images = await Image.findAllImages({ product_id });

    res.status(200).json({
      ...productData,
      images
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
};

// ADD product
const addProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    stock_quantity,
    category_id,
    season_id,
    is_seasonal,
    is_featured
  } = req.body;

  if (!name || !description || !price || !stock_quantity) {
    return res.status(400).json({
      data: null,
      message: "All required fields must be provided",
      error: null,
    });
  }

  const newProductId = uuidv4();
  const productData = {
    product_id: newProductId,
    name,
    description,
    price,
    is_seasonal: is_seasonal || false,
    is_featured: is_featured || false,
    stock_quantity,
    category_id: category_id || null,
    season_id: season_id || null,
  };

  try {
    const newProduct = await Product.create(productData);

    // ✅ Save uploaded image data from req.files (already uploaded to Cloudinary)
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageId = uuidv4();
        const imageUrl = file.path; // URL from Cloudinary
        const publicId = file.filename; // Cloudinary public ID
        const isPrimary = i === 0;

        await pool.query(
          'INSERT INTO Images (image_id, image_url, public_id, product_id, is_primary) VALUES (?, ?, ?, ?, ?)',
          [imageId, imageUrl, publicId, newProductId, isPrimary]
        );
      }
    }

    res.status(201).json({
      data: newProduct,
      message: "Product added successfully with images",
      error: null,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      data: null,
      message: "Error adding product",
      error: error.message,
    });
  }
};




// UPDATE product
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      is_seasonal,
      is_featured,
      stock_quantity,
      category_id,
      season_id
    } = req.body;

    const productId = req.params.product_id;
    const existingProduct = await Product.getById(productId);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // ✅ Update product fields
    await Product.update(productId, {
      name,
      description,
      price,
      is_seasonal: is_seasonal === 'true',
      is_featured: is_featured === 'true',
      stock_quantity,
      category_id: category_id || null,
      season_id: season_id || null
    });

    // ✅ Handle multiple new images (already uploaded to Cloudinary)
    if (req.files && req.files.length > 0) {
      // Optionally remove old images here if needed

      // Set existing primary image to false (if any)
      await pool.query(
        'UPDATE Images SET is_primary = false WHERE product_id = ?',
        [productId]
      );

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageId = uuidv4();
        const imageUrl = file.path;
        const publicId = file.filename;
        const isPrimary = i === 0; // First uploaded image becomes the new primary

        await pool.query(
          'INSERT INTO Images (image_id, image_url, public_id, product_id, is_primary) VALUES (?, ?, ?, ?, ?)',
          [imageId, imageUrl, publicId, productId, isPrimary]
        );
      }
    }

    const updatedProduct = await Product.getById(productId);
    const images = await Image.findAllImages({ product_id: productId });

    res.status(200).json({
      ...updatedProduct,
      images
    });
  } catch (err) {
    console.error('Error updating Product:', err);
    res.status(500).json({ message: 'Failed to update product' });
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

    // 🔥 1. Get all Cloudinary public_ids of product images
    const [images] = await pool.query('SELECT public_id FROM images WHERE product_id = ?', [productId]);

    // 🔥 2. Delete each image from Cloudinary
    for (const img of images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // 🔥 3. Delete image records from DB
    await pool.query('DELETE FROM images WHERE product_id = ?', [productId]);

    // 🔥 4. Delete the product itself
    await Product.delete(productId);

    res.status(200).json({ message: 'Product and images deleted successfully' });

  } catch (err) {
    console.error('Error deleting Product:', err);
    res.status(500).json({ message: 'Failed to delete Product' });
  }
};


module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};






// const publicId = req.file.filename; // Cloudinary's unique public ID (filename here as Cloudinary handles the rest)

          // Create the image entry in the database
          // const imageData = {
          //     image_url: imageUrl,
          //     public_id: publicId,
          //     product_id: newProductId,
          //     is_primary: true  // Assuming the first image uploaded is always the primary image
          // };

          // await createImage(imageData);  // Save the image details in the Images table





              // let newImageData = [];
    // if (req.files?.length > 0) {
    //   const uploads = await Promise.all(req.files.map(file => uploadFile(file.path)));

//       const oldImages = await Image.findAllImages({ product_id });
//       await Promise.all(
//         oldImages.map(async (img) => {
//           if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
//           await Image.deleteImage(img.image_id);
//         })
//       );

//       newImageData = await Promise.all(
//         uploads.map((upload, index) => {
//           return Image.createImage({
//             image_url: upload.secure_url,
//             public_id: upload.public_id,
//             product_id,
//             category_id: null,
//             is_primary: index === 0
//           });
//         })
//       );
//     }

//     res.status(200).json({
//       message: 'Product updated successfully.',
//       product: {
//         product_id,
//         name,
//         description,
//         price,
//         is_seasonal: is_seasonal === 'true',
//         is_featured: is_featured === 'true',
//         stock_quantity,
//         category_id,
//         season_id,
//         images: newImageData
//       }
//     });
//   } catch (error) {
//     console.error('Error updating product:', error);
//     res.status(500).json({ error: 'Failed to update product.' });
//   }
// };


 // if (req.user.role !== 'admin') {
    //   return res.status(403).json({ error: 'Permission denied. Admins only.' });
    // }



//     const oldImages = await Image.findAllImages({ product_id });
//     await Promise.all(
//       oldImages.map(async (img) => {
//         if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
//         await Image.deleteImage(img.image_id);
//       })
//     );

//     const deleted = await product.delete(product_id);
//     if (!deleted) {
//       return res.status(404).json({ error: 'Product not found or could not be deleted.' });
//     }

//     res.status(200).json({ message: 'Product and its images deleted successfully.' });
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     res.status(500).json({ error: 'Failed to delete product.' });
//   }
// };