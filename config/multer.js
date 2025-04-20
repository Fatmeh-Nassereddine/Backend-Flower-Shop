const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('./cloudinary'); // Assuming cloudinary configuration is done in this file

// Multer storage configuration with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'flower-shop',  // Folder name in Cloudinary (can be customized)
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'], // Allowed file formats
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Resize if required
  }
});

// Multer upload middleware using CloudinaryStorage
const upload = multer({ storage: storage });

module.exports = upload;

