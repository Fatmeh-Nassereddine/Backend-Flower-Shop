




// app.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const path = require('path');

const app = express();

// ✅ Static folder for uploads (images, files, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ CORS configuration
const allowedOrigins = [
  'http://localhost:3000', 
  'http://yourfrontend.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ Security, Logging, Parsing
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// ✅ Routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const discountRoutes = require('./routes/discountRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const addressRoutes = require('./routes/addressRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/shippings', shippingRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/address', addressRoutes); 
app.use('/api/favorites', favoriteRoutes);

// ✅ Global Error Handler
const errorMiddleware = require('./middlewares/error.middleware');
app.use(errorMiddleware);

module.exports = app;

