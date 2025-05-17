const Address = require('../models/address');

// Get or Create Address for a User

exports.createAddress = async (req, res) => {
  try {
      const { street_address, city, governorate, phone_number, user_id } = req.body;

      if (!street_address || !city || !governorate || !user_id) {
          return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await Address.create({ street_address, city, governorate, phone_number, user_id });
    // Ensure result includes insertId (assuming MySQL or similar)
    if (result) {
      console.log('Address created, insertId:', result.insertId); // Log the insertId
      return res.status(201).json({ message: `Address created successfully, ${result}`, insertId: result.insertId });
    } else {
      return res.status(500).json({ error: 'Failed to create address' });
    }
  } catch (error) {
      console.log('Error: Address creation failed', error); // Log the failure response
    return res.status(500).json({ error: 'Something went wrong while creating the address' });
  }
};


exports.getUserAddresses = async (req, res) => {
  try {
    const user_id = req.user.id; // assuming req.user is set by auth middleware

    const addresses = await Address.findByUserId(user_id);

    if (addresses.length === 0) {
      return res.status(404).json({ error: 'No addresses found for this user' });
    }

    return res.status(200).json({ addresses });
  } catch (error) {
    console.error('Get Addresses Error:', error);
    return res.status(500).json({ error: 'Something went wrong while fetching addresses' });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const { address_id } = req.params;

    const address = await Address.findById(address_id);

    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    return res.status(200).json({ address });
  } catch (error) {
    console.error('Get Address by ID Error:', error);
    return res.status(500).json({ error: 'Something went wrong while fetching the address' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { address_id } = req.params;
    const { street_address, city, governorate, phone_number, user_id } = req.body;

    if (!street_address || !city || !governorate || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await Address.update(address_id, {
      street_address,
      city,
      governorate,
      phone_number,
      user_id,
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Address not found or no changes made' });
    }

    return res.status(200).json({ message: 'Address updated successfully' });
  } catch (error) {
    console.error('Update Address Error:', error);
    return res.status(500).json({ error: 'Something went wrong while updating the address' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { address_id } = req.params;

    const result = await Address.delete(address_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    return res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete Address Error:', error);
    return res.status(500).json({ error: 'Something went wrong while deleting the address' });
  }
};
