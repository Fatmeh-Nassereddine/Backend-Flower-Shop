// const sequelize = require('../config/db');  // Import sequelize instance
// const User = require('./user');
// const Product = require('./product');
// const Address = require('./address');
// const Cart = require('./cart');
// const Category = require('./category');
// const Contact = require('./contact');
// const Discount = require('./discount');
// const Image = require('./image');
// const Order = require('./order');
// const OrderItem = require('./OrderItem');
// const Role = require('./role');
// const Season = require('./season');
// const Shipping = require('./shipping');

// // Associations

// // User <-> Address (One-to-Many)
// User.hasMany(Address, { foreignKey: 'user_id' });
// Address.belongsTo(User, { foreignKey: 'user_id' });

// // User <-> Cart (One-to-Many)
// User.hasMany(Cart, { foreignKey: 'user_id' });
// Cart.belongsTo(User, { foreignKey: 'user_id' });

// // User <-> Order (One-to-Many)
// User.hasMany(Order, { foreignKey: 'user_id' });
// Order.belongsTo(User, { foreignKey: 'user_id' });

// // User <-> Role (One-to-Many)
// Role.hasMany(User, { foreignKey: 'role_id' });
// // User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// // Product <-> Category (Many-to-One)
// Product.belongsTo(Category, { foreignKey: 'category_id' });
// Category.hasMany(Product, { foreignKey: 'category_id' });

// // Product <-> Season (Many-to-One)
// Product.belongsTo(Season, { foreignKey: 'season_id' });
// Season.hasMany(Product, { foreignKey: 'season_id' });

// // Product <-> Cart (Many-to-One)
// Cart.belongsTo(Product, { foreignKey: 'product_id' });
// Product.hasMany(Cart, { foreignKey: 'product_id' });

// // Order <-> Address (One-to-Many)
// Order.belongsTo(Address, { foreignKey: 'shipping_address_id' });
// Address.hasMany(Order, { foreignKey: 'shipping_address_id' });

// // Order <-> Discount (One-to-Many)
// Order.belongsTo(Discount, { foreignKey: 'discount_code_id' });
// Discount.hasMany(Order, { foreignKey: 'discount_code_id' });

// // Order <-> OrderItem (One-to-Many)
// Order.hasMany(OrderItem, { foreignKey: 'order_id' });
// OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// // OrderItem <-> Product (Many-to-One)
// OrderItem.belongsTo(Product, { foreignKey: 'product_id' });
// Product.hasMany(OrderItem, { foreignKey: 'product_id' });

// // Image <-> Product (One-to-Many)
// Image.belongsTo(Product, { foreignKey: 'product_id' });
// Product.hasMany(Image, { foreignKey: 'product_id' });

// // Image <-> Category (One-to-Many)
// Image.belongsTo(Category, { foreignKey: 'category_id' });
// Category.hasMany(Image, { foreignKey: 'category_id' });

// // Shipping <-> Order (One-to-One)
// Shipping.belongsTo(Order, { foreignKey: 'order_id' });
// Order.hasOne(Shipping, { foreignKey: 'order_id' });

// // Category <-> Category (Self-referencing Many-to-One for parent-child categories)
// Category.hasMany(Category, { foreignKey: 'parent_category_id' });
// Category.belongsTo(Category, { foreignKey: 'parent_category_id' });

// // Sync and export models
// sequelize.sync({ alter: true })
//   .then(() => console.log('Models synced successfully'))
//   .catch((err) => console.error('Error syncing models:', err));

// module.exports = {
//   User,
//   Product,
//   Address,
//   Cart,
//   Category,
//   Contact,
//   Discount,
//   Image,
//   Order,
//   OrderItem,
//   Role,
//   Season,
//   Shipping,
//   sequelize,  // Always export sequelize instance
// };

