const { v4: uuidv4 } = require('uuid');
const { uploadFile } = require('../config/cloudinary');
const upload = require('../config/multer'); // Import the multer upload middleware
const pool = require('../config/db');
const Category = require('../models/category');

// Add Category Controller
const createCategory = async (req, res) => {
    const { name, description, parent_category_id } = req.body;

    if (!name || !description) {
        return res.status(400).json({
            data: null,
            message: "All required fields must be provided",
            error: null,
        });
    }

    const newCategoryId = uuidv4();
    const categoryData = {
        category_id: newCategoryId,
        name,
        description,
        parent_category_id: parent_category_id || null,
    };

    try {
        const newCategory = await Category.create(categoryData);

        if (req.file) {
            const imageUrl = req.file.path;
            const imageId = uuidv4();

            await pool.query(
                'INSERT INTO Images (image_id, image_url, public_id, category_id, is_primary) VALUES (?, ?, ?, ?, ?)',
                [imageId, imageUrl, req.file.filename, newCategoryId, true]
            );

            return res.status(201).json({
                data: { ...newCategory, imageUrl },
                message: "Category added successfully",
                error: null,
            });
        } else {
            return res.status(201).json({
                data: newCategory,
                message: "Category added successfully (no image)",
                error: null,
            });
        }
    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({
            data: null,
            message: "Error adding category",
            error: error.message,
        });
    }
};

// Use the upload middleware for the file upload on the API routes
const uploadMiddleware = upload.single('image'); // Centralized upload middleware

// Get All Categories
const getAllCategories = async (req, res) => {
    try {
      const query = `
        SELECT 
          c.category_id AS id, 
          c.name, 
          c.description,
          i.image_url
        FROM Categories c
        LEFT JOIN Images i 
          ON c.category_id = i.category_id AND i.is_primary = true
        ORDER BY c.name
      `;
      const [categories] = await pool.query(query);
      console.log(categories);
      res.status(200).json(categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  };
  

// Get Category by ID
const getCategoryById = async (req, res) => {
    try {
        const categoryData = await Category.findById(req.params.category_id);

        if (!categoryData) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json(categoryData);
    } catch (err) {
        console.error('Error fetching category by ID:', err);
        res.status(500).json({ message: 'Failed to fetch category' });
    }
};

// Update Category
const updateCategory = async (req, res) => {
    try {
        // const { name, description, parent_category_id } = req.body;
        const categoryId = req.params.category_id;
        // ✅ Log request body for debugging
    console.log('Incoming form data:', req.body);

    // Extract fields from form data (parsed by multer)
    const name = req.body.name || null;
    const description = req.body.description || null;
    const parent_category_id = req.body.parent_category_id || null;

        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await Category.update(categoryId, {
            name: name || existingCategory.name,
            description: description || existingCategory.description,
            parent_category_id: parent_category_id || existingCategory.parent_category_id,
        });

        if (req.file) {
            const result = await uploadImageToCloudinary(req.file.buffer, 'Categories');
            const imageUrl = result.secure_url;
            const publicId = result.public_id;

            const [existingImage] = await pool.query(
                'SELECT * FROM Images WHERE category_id = ? AND is_primary = true',
                [categoryId]
            );

            if (existingImage.length) {
                await pool.query(
                    'UPDATE Images SET image_url = ? WHERE category_id = ? AND is_primary = true',
                    [imageUrl, categoryId]
                );
            } else {
                await pool.query(
                    'INSERT INTO Images (image_id, image_url, category_id, is_primary) VALUES (?, ?, ?, ?)',
                    [uuidv4(), imageUrl, categoryId, true]
                );
            }
        }

        const updatedCategory = await Category.findById(categoryId);
        res.status(200).json(updatedCategory);
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({ message: 'Failed to update category' });
    }
};

// Delete Category
const deleteCategory = async (req, res) => {
    try {
      const categoryId = req.params.category_id;
  
      const existingCategory = await Category.findById(categoryId);
      if (!existingCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      // Delete images related to this category first
      await pool.query('DELETE FROM Images WHERE category_id = ?', [categoryId]);
  
      // Then delete the category itself
      await Category.delete(categoryId);
  
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
      console.error('Error deleting category:', err);
      res.status(500).json({ message: 'Failed to delete category' });
    }
  };
  

module.exports = {
    uploadMiddleware,
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
