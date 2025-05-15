const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const { checkAchievements } = require('../services/achievementService');
const Hotel = require('../models/Hotel'); // Импортируем модель Hotel для обработки ошибок валидации

// Маршрут для списка отелей
router.get('/', hotelController.getHotels);

// Маршрут для страницы конкретного отеля
router.get('/:id', hotelController.getHotelById);

// Маршрут для добавления отзыва
router.post(
  '/:id/reviews',
  authMiddleware,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Оценка должна быть от 1 до 5'),
    body('comment').trim().notEmpty().withMessage('Комментарий обязателен').isLength({ max: 500 }).withMessage('Комментарий не должен превышать 500 символов'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const hotel = await Hotel.findById(req.params.id).populate('reviews.userId', 'username').lean();
        return res.status(400).render('hotels/hotel', {
          hotel: hotel || null,
          user: req.user || null,
          hasReviewed: req.user && hotel ? hotel.reviews.some(review => review.userId._id.toString() === req.user._id.toString()) : false,
          error: errors.array()[0].msg,
          csrfToken: req.csrfToken ? req.csrfToken() : '',
        });
      }
      await hotelController.addReview(req, res);
      if (req.user) {
        await checkAchievements(req.user._id);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;