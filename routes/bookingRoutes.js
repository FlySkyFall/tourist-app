const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, bookingController.createBooking);
router.get('/', authMiddleware, bookingController.getUserBookings);
router.post('/:id/cancel', authMiddleware, bookingController.cancelBooking);
router.post('/clean-expired', bookingController.cleanExpiredBookings);

module.exports = router;