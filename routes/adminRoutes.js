const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { body, validationResult } = require('express-validator');

// Главная страница админки
router.get('/', authMiddleware, adminMiddleware, adminController.getAdminDashboard);

// Управление турами
router.get('/tours', authMiddleware, adminMiddleware, adminController.getTours);
router.get('/tours/new', authMiddleware, adminMiddleware, adminController.getNewTour);
router.post(
  '/tours',
  authMiddleware,
  adminMiddleware,
  [
    body('title').notEmpty().withMessage('Название тура обязательно'),
    body('description').notEmpty().withMessage('Описание тура обязательно'),
    body('maxGroupSize').isInt({ min: 1 }).withMessage('Максимальное количество участников должно быть больше 0'),
    body('season.start').isISO8601().withMessage('Некорректная дата начала сезона'),
    body('season.end').isISO8601().withMessage('Некорректная дата окончания сезона'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/admin/tours/new');
    }
    next();
  },
  adminController.createTour
);
router.get('/tours/:id/edit', authMiddleware, adminMiddleware, adminController.getEditTour);
router.post(
  '/tours/:id',
  authMiddleware,
  adminMiddleware,
  [
    body('title').notEmpty().withMessage('Название тура обязательно'),
    body('description').notEmpty().withMessage('Описание тура обязательно'),
    body('maxGroupSize').isInt({ min: 1 }).withMessage('Максимальное количество участников должно быть больше 0'),
    body('season.start').isISO8601().withMessage('Некорректная дата начала сезона'),
    body('season.end').isISO8601().withMessage('Некорректная дата окончания сезона'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect(`/admin/tours/${req.params.id}/edit`);
    }
    next();
  },
  adminController.updateTour
);
router.post('/tours/:id/delete', authMiddleware, adminMiddleware, adminController.deleteTour);

// Управление бронированиями
router.get('/bookings', authMiddleware, adminMiddleware, adminController.getBookings);
router.post('/bookings/:id/confirm', authMiddleware, adminMiddleware, adminController.confirmBooking);
router.post('/bookings/:id/cancel', authMiddleware, adminMiddleware, adminController.cancelBooking);

// Управление пользователями
router.get('/users', authMiddleware, adminMiddleware, adminController.getUsers);
router.post(
  '/users/:id/role',
  authMiddleware,
  adminMiddleware,
  [
    body('role').isIn(['user', 'admin', 'moderator']).withMessage('Недопустимая роль'),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error', errors.array()[0].msg);
      return res.redirect('/admin/users');
    }
    next();
  },
  adminController.updateUserRole
);

module.exports = router;