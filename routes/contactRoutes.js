


const express = require("express");
const router = express.Router();
const { submitContact, getAllContacts, deleteContact } = require("../controllers/contactController");
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware');

// Route to handle contact form submission
router.post("/submit",authenticate, submitContact);

// Route to get all contacts (for admin)
router.get("/all",authenticate, authorizeAdmin,getAllContacts);



// Route to delete a contact (for admin)
router.delete("/:id", authenticate,authorizeAdmin, deleteContact);

  

module.exports = router;
