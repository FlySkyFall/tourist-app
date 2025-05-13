const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Маршрут для списка отелей
router.get('/', hotelController.getHotels);

// Маршрут для страницы конкретного отеля
router.get('/:id', hotelController.getHotelById);

module.exports = router;