


const express = require("express");
const router = express.Router();
const { submitContact, getAllContacts, deleteContact } = require("../controllers/contactController");
const { protect, authorizeCustomer,authorizeAdmin } = require('../middlewares/authMiddleware');

// Route to handle contact form submission
router.post("/submit",protect, authorizeCustomer,submitContact);

// Route to get all contacts (for admin)
router.get("/all",protect,authorizeAdmin, getAllContacts);



// Route to delete a contact (for admin)
router.delete("/:id", protect,authorizeAdmin, deleteContact);

  

module.exports = router;
