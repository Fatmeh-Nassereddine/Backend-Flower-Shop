// const pool = require('../config/db');
// const Cart = require('../models/cart');

// // Helper function to fetch product details
// const getProductDetails = async (product_id) => {
//   const query = 'SELECT * FROM Products WHERE product_id = ?'; // Updated query to use product_id
//   const [productRows] = await pool.execute(query, [product_id]); // Fetch product by product_id
//   if (productRows.length === 0) throw new Error('Product not found.');
//   return productRows[0];
// };

// // Add a product to the cart
// exports.addToCart = async (req, res) => {
//   try {
//     const { product_id, quantity } = req.body;
//     const user_id = req.user.id;

//     if (!product_id || quantity <= 0) {
//       return res.status(400).json({ error: 'Invalid product or quantity.' });
//     }

//     const product = await getProductDetails(product_id);
//     const existingItem = await Cart.getProductInCart(user_id, product_id);
//     const currentQty = existingItem?.quantity || 0;
//     const totalQty = currentQty + quantity;

//     // Ensure we are checking the 'stock_quantity' from Products table instead of 'stock'
//     if (totalQty > product.stock_quantity) {
//       const available = product.stock_quantity - currentQty;
//       return res.status(400).json({
//         error: `Only ${available > 0 ? available : 0} item(s) left in stock.`,
//       });
//     }

//     if (existingItem) {
//       await Cart.updateProductQuantity(existingItem.cart_id, totalQty);
//     } else {
//       await Cart.addProductToCart(user_id, product_id, quantity);
//     }

//     return res.status(200).json({ message: 'Product added to cart.' });
//   } catch (err) {
//     console.error('Add to Cart Error:', err);
//     return res.status(500).json({ error: 'Something went wrong while adding the product to the cart.' });
//   }
// };

// // Get all items in the cart
// exports.getCart = async (req, res) => {
//   try {
//     const user_id = req.user.id;
//     const items = await Cart.getProductsInCart(user_id);
//     return res.status(200).json(items);
//   } catch (err) {
//     console.error('Get Cart Error:', err);
//     return res.status(500).json({ error: 'Something went wrong while fetching the cart.' });
//   }
// };

// // Remove an item from the cart
// exports.removeFromCart = async (req, res) => {
//   try {
//     const user_id = req.user.id;
//     const { product_id } = req.params;

//     const item = await Cart.getProductInCart(user_id, product_id);
//     if (!item) {
//       return res.status(404).json({ error: 'Product not found in cart.' });
//     }

//     const success = await Cart.removeProductFromCart(item.cart_id);
//     if (!success) throw new Error('Failed to remove item.');

//     return res.status(200).json({ message: 'Product removed from cart.' });
//   } catch (err) {
//     console.error('Remove from Cart Error:', err);
//     return res.status(500).json({ error: 'Something went wrong while removing the item.' });
//   }
// };

// // Clear the user's cart
// exports.clearCart = async (req, res) => {
//   try {
//     const user_id = req.user.id;
//     console.log('User ID:', user_id);
//     const deletedCount = await Cart.clearUserCart(user_id);
//     return res.status(200).json({
//       message: 'Cart cleared successfully.',
//       deletedItems: deletedCount,
//     });
//   } catch (err) {
//     console.error('Clear Cart Error:', err);
//     return res.status(500).json({ error: 'Something went wrong while clearing the cart.' });
//   }
// };

// // Update the quantity of a product in the cart
// exports.updateCartItem = async (req, res) => {
//   try {
//     const { product_id } = req.params;
//     const { quantity } = req.body;
//     const user_id = req.user.id;

//     if (!quantity || quantity <= 0) {
//       return res.status(400).json({ error: 'Invalid quantity.' });
//     }

//     const item = await Cart.getProductInCart(user_id, product_id);
//     if (!item) {
//       return res.status(404).json({ error: 'Product not found in cart.' });
//     }

//     const product = await getProductDetails(product_id);

//     // Use 'stock_quantity' from the Products table to check stock
//     if (quantity > product.stock_quantity) {
//       return res.status(400).json({
//         error: 'Not enough stock available.',
//         availableStock: product.stock_quantity,
//       });
//     }

//     await Cart.updateProductQuantity(item.cart_id, quantity);

//     return res.status(200).json({
//       message: 'Cart updated successfully.',
//       cartItem: { user_id, product_id, quantity },
//     });
//   } catch (err) {
//     console.error('Update Cart Error:', err);
//     return res.status(500).json({ error: 'Something went wrong while updating the cart.' });
//   }
// };

// // Get cart with product details and subtotals
// exports.getCartWithProducts = async (req, res) => {
//   try {
//     const user_id = req.user.id;
//     const items = await Cart.getProductsInCart(user_id);

//     const detailedItems = await Promise.all(items.map(async (item) => {
//       const product = await getProductDetails(item.product_id);
//       return {
//         ...item,
//         product: product || null,
//         subtotal: product ? product.price * item.quantity : 0,
//       };
//     }));

//     const totalPrice = detailedItems.reduce((acc, item) => acc + item.subtotal, 0);

//     return res.status(200).json({
//       items: detailedItems,
//       totalPrice,
//       itemCount: detailedItems.length,
//     });
//   } catch (err) {
//     console.error('Get Cart With Products Error:', err);
//     return res.status(500).json({ error: 'Something went wrong while fetching the cart.' });
//   }
// };




const Cart = require('../models/cart');
const CartItem = require('../models/CartItem');

exports.getUserCart = async (req, res) => {
  try {
    const user_id = parseInt(req.params.user_id, 10);
    if (isNaN(user_id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    let cart = await Cart.getCartByUser(user_id);

    if (!cart) {
      const newCart = await Cart.createCart(user_id);
      return res.json({ cart_id: newCart.cart_id, items: [], total: 0 });
    }

    const items = await CartItem.getItems(cart.cart_id);
    const total = items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
    res.json({ 
      success: true,  // 👈 Add this
      cart_id: cart.cart_id, 
      items, 
      total });

  } catch (err) {
    console.error("Error fetching user cart: ", err.message);
    res.status(500).json({ error: err.message });
  }
};


exports.addOrUpdateProduct = async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
    const cart = await Cart.getOrCreateCart(user_id);
    await CartItem.addOrUpdateItem(cart.cart_id, product_id, quantity);
    res.json({ message: 'Product added/updated in cart' });
  } catch (err) {
    console.error("Error adding/updating product in cart: ", err.message);  // Log error
    res.status(500).json({ error: err.message });
  }
};

exports.updateItemQuantity = async (req, res) => {
  try {
    const updated = await CartItem.updateQuantity(req.params.cart_item_id, req.body.quantity);
    if (updated) {
      res.json({ message: 'Quantity updated' });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    console.error("Error updating item quantity: ", err.message);  // Log error
    res.status(500).json({ error: err.message });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const removed = await CartItem.removeItem(req.params.cart_item_id);
    if (removed) {
      res.json({ message: 'Item removed from cart' });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    console.error("Error removing item from cart: ", err.message);  // Log error
    res.status(500).json({ error: err.message });
  }
};

exports.clearUserCart = async (req, res) => {
  try {
    const cart = await Cart.getCartByUser(req.params.user_id);
    if (!cart) return res.json({ message: 'Cart already empty' });

    await CartItem.clearCart(cart.cart_id);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error("Error clearing cart: ", err.message);  // Log error
    res.status(500).json({ error: err.message });
  }
};
