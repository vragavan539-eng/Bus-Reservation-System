const express = require('express');
const router = express.Router();
const {
  getSavedPassengers,
  addSavedPassenger,
  updateSavedPassenger,
  deleteSavedPassenger,
} = require('../controllers/savedPassengerController');
const { protect } = require('../middleware/auth');

/*
  savedPassengerRoutes.js
  ---------------------------------------------------------
  Place in: /backend/routes/savedPassengerRoutes.js

  Register in server.js next to your other route mounts, e.g.:
    app.use('/api/passengers', require('./routes/savedPassengerRoutes'));

  Assumes '../middleware/auth' exports `protect` the same way
  your other protected routes (bookings, profile) already use it.
  If your middleware file/export name differs, adjust the import
  above — everything else stays the same.
*/

router.get('/', protect, getSavedPassengers);
router.post('/', protect, addSavedPassenger);
router.put('/:id', protect, updateSavedPassenger);
router.delete('/:id', protect, deleteSavedPassenger);

module.exports = router;