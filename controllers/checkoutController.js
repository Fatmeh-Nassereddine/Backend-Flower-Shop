// const { getOrCreateAddress } = require('../controllers/addressController');
// const { createOrder } = require('../controllers/orderController');
// const OrderItem = require('../models/OrderItem');
// const Shipping = require('../models/shipping');
// const { updateOrderTotalValue, confirmOrderStatus } = require('../helpers/orderHelpers');
// const Cart = require('../models/cart');
// const CartItem = require('../models/CartItem');

// exports.handleCheckout = async (req, res) => {
//     const user_id = req.user.id;  // Assuming the user is authenticated and their ID is available
//     const { address, payment_method, delivery_fee} = req.body;
  
//     try {
//         // Step 1: Check if the user has a cart
//         const cart = await Cart.getCartByUser(user_id);
        
//         // If no cart exists, return an error
//         if (!cart) {
//             return res.status(400).json({
//                 error: "You do not have a cart. Please add items to your cart before proceeding."
//             });
//         }

//         // Step 2: Get items from the cart
//         const items = await CartItem.getItems(cart.cart_id);
        
//         // If no items in the cart, return an error
//         if (items.length === 0) {
//             return res.status(400).json({
//                 error: "Your cart is empty. Please add items to your cart before proceeding."
//             });
//         }

//         // Step 3: Validate each item in the cart (e.g., quantity should be greater than 0)
//         for (const item of items) {
//             if (item.quantity <= 0) {
//                 return res.status(400).json({
//                     error: `Invalid quantity for product: ${item.product_name}. Quantity must be greater than 0.`
//                 });
//             }
//         }

//         // Step 4: Calculate the total (sum of item subtotals + delivery fee)
//         const total = items.reduce((acc, item) => acc + (item.subtotal || 0), 0) + delivery_fee;

//         // Step 5: Get or create the shipping address
//         const shipping_address_id = await getOrCreateAddress(req, address);

//         // Step 6: Create the order with total set to 0 for now
//         const order_id = await createOrder(user_id, shipping_address_id, 0, payment_method);

//         // Step 7: Add items to the order
//         for (const item of items) {
//             const { product_id, quantity, unit_price } = item;
//             await OrderItem.create(order_id, product_id, quantity, unit_price);
//         }

//         // Step 8: Add shipping fee to the order
//         await Shipping.create({ delivery_fee, order_id });

//         // Step 9: Update the order total (items + delivery fee)
//         await updateOrderTotalValue(order_id);

//         // Step 10: Confirm the order status (Optional)
//         await confirmOrderStatus(order_id);

//         // Step 11: Clear the cart after checkout (optional)
//         await CartItem.clearCart(cart.cart_id);

//         // Send success response
//         res.status(201).json({
//             success: true,
//             message: 'Order placed and confirmed successfully',
//             order_id
//         });

//     } catch (error) {
//         console.error('❌ Checkout error:', error.message);
//         res.status(500).json({ success: false, message: 'Checkout failed', error: error.message });
//     }
// };
