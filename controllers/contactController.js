



const Contact = require('../models/contact'); // Import the Contact class
const { sendContactNotification } = require('../utils/mailer');

const contact = new Contact(); // Instantiate the model

// ========== Submit Contact Form ==========
exports.submitContact = async (req, res) => {
  try {
    const { first_name, email, subject, message } = req.body;

    // Validate required fields
    if (!first_name || !email || !message) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Save to DB
    const contactData = { first_name, email, subject, message };
    const result = await contact.create(contactData);

    // Send email notification to admin
    await sendContactNotification(contactData);

    res.status(201).json({
      message: 'Your message has been sent successfully.',
      contact_id: result.insertId,
    });
  } catch (error) {
    console.error('Submit Contact Error:', error);
    res.status(500).json({ error: 'Something went wrong, please try again later.' });
  }
};

// ========== Get All Contact Submissions (Admin Use) ==========
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await contact.getAll();
    res.status(200).json(contacts);
  } catch (error) {
    console.error('Get All Contacts Error:', error);
    res.status(500).json({ error: 'Failed to fetch contact submissions.' });
  }
};

// ========== Delete Contact Submission (Admin Use) ==========
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contactData = await Contact.findById(id); // Use the static findById method
    if (!contactData) {
      return res.status(404).json({ error: 'Contact entry not found.' });
    }

    await Contact.delete(id); // Use the static delete method

    res.status(200).json({ message: 'Contact entry deleted successfully.' });
  } catch (error) {
    console.error('Delete Contact Error:', error);
    res.status(500).json({ error: 'Failed to delete contact entry.' });
  }
};