const User = require('../models/User');

/*
  savedPassengerController.js
  ---------------------------------------------------------
  Place in: /backend/controllers/savedPassengerController.js

  Requires User.savedPassengers to exist on the User schema —
  see the models/User.js snippet shared alongside this file.

  All routes are protected (req.user.id comes from your auth
  middleware, the same one used on /my-bookings etc.).
*/

// GET /api/passengers
exports.getSavedPassengers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedPassengers');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ passengers: user.savedPassengers || [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching saved passengers', error: err.message });
  }
};

// POST /api/passengers
exports.addSavedPassenger = async (req, res) => {
  try {
    const { name, age, gender } = req.body;
    if (!name || !age || !gender) {
      return res.status(400).json({ message: 'Name, age and gender are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if ((user.savedPassengers || []).length >= 15) {
      return res.status(400).json({ message: 'Maximum 15 saved passengers allowed' });
    }

    user.savedPassengers.push({ name, age, gender });
    await user.save();

    res.status(201).json({ passengers: user.savedPassengers });
  } catch (err) {
    res.status(500).json({ message: 'Error saving passenger', error: err.message });
  }
};

// PUT /api/passengers/:id
exports.updateSavedPassenger = async (req, res) => {
  try {
    const { name, age, gender } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const passenger = user.savedPassengers.id(req.params.id);
    if (!passenger) return res.status(404).json({ message: 'Saved passenger not found' });

    if (name) passenger.name = name;
    if (age) passenger.age = age;
    if (gender) passenger.gender = gender;

    await user.save();
    res.json({ passengers: user.savedPassengers });
  } catch (err) {
    res.status(500).json({ message: 'Error updating passenger', error: err.message });
  }
};

// DELETE /api/passengers/:id
exports.deleteSavedPassenger = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const passenger = user.savedPassengers.id(req.params.id);
    if (!passenger) return res.status(404).json({ message: 'Saved passenger not found' });

    passenger.deleteOne();
    await user.save();

    res.json({ passengers: user.savedPassengers });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting passenger', error: err.message });
  }
};