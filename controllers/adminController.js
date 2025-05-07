const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getAdminDashboard = (req, res) => {
  res.render('admin/dashboard', {
    user: req.user,
    message: req.flash('success') || req.flash('error'),
  });
};

exports.getTours = async (req, res) => {
  try {
    const tours = await Tour.find().lean();
    res.render('admin/tours', {
      tours,
      user: req.user,
      message: req.flash('success') || req.flash('error'),
    });
  } catch (error) {
    console.error('Error in getTours:', error.message, error.stack);
    req.flash('error', 'Ошибка загрузки туров');
    res.redirect('/admin');
  }
};

exports.getNewTour = (req, res) => {
  res.render('admin/tour-form', {
    user: req.user,
    tour: null,
    message: req.flash('success') || req.flash('error'),
  });
};

exports.createTour = async (req, res) => {
  try {
    const { title, description, maxGroupSize, season } = req.body;
    const tour = new Tour({
      title,
      description,
      maxGroupSize,
      season: {
        start: new Date(season.start),
        end: new Date(season.end),
      },
    });
    await tour.save();
    req.flash('success', 'Тур успешно создан');
    res.redirect('/admin/tours');
  } catch (error) {
    console.error('Error in createTour:', error.message, error.stack);
    req.flash('error', 'Ошибка создания тура');
    res.redirect('/admin/tours/new');
  }
};

exports.getEditTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).lean();
    if (!tour) {
      req.flash('error', 'Тур не найден');
      return res.redirect('/admin/tours');
    }
    res.render('admin/tour-form', {
      tour,
      user: req.user,
      message: req.flash('success') || req.flash('error'),
    });
  } catch (error) {
    console.error('Error in getEditTour:', error.message, error.stack);
    req.flash('error', 'Ошибка загрузки тура');
    res.redirect('/admin/tours');
  }
};

exports.updateTour = async (req, res) => {
  try {
    const { title, description, maxGroupSize, season } = req.body;
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      req.flash('error', 'Тур не найден');
      return res.redirect('/admin/tours');
    }
    tour.title = title;
    tour.description = description;
    tour.maxGroupSize = maxGroupSize;
    tour.season = {
      start: new Date(season.start),
      end: new Date(season.end),
    };
    await tour.save();
    req.flash('success', 'Тур успешно обновлён');
    res.redirect('/admin/tours');
  } catch (error) {
    console.error('Error in updateTour:', error.message, error.stack);
    req.flash('error', 'Ошибка обновления тура');
    res.redirect(`/admin/tours/${req.params.id}/edit`);
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      req.flash('error', 'Тур не найден');
      return res.redirect('/admin/tours');
    }
    await tour.deleteOne();
    req.flash('success', 'Тур успешно удалён');
    res.redirect('/admin/tours');
  } catch (error) {
    console.error('Error in deleteTour:', error.message, error.stack);
    req.flash('error', 'Ошибка удаления тура');
    res.redirect('/admin/tours');
  }
};

exports.getTourReviews = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      req.flash('error', 'Неверный идентификатор тура');
      return res.redirect('/admin/tours');
    }
    const tour = await Tour.findById(req.params.id).populate('reviews.userId', 'username').lean();
    if (!tour) {
      req.flash('error', 'Тур не найден');
      return res.redirect('/admin/tours');
    }
    res.render('admin/reviews', {
      tour,
      user: req.user,
      message: req.flash('success') || req.flash('error'),
    });
  } catch (error) {
    console.error('Error in getTourReviews:', error.message, error.stack);
    req.flash('error', 'Ошибка загрузки отзывов');
    res.redirect('/admin/tours');
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { tourId, reviewId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tourId) || !mongoose.Types.ObjectId.isValid(reviewId)) {
      req.flash('error', 'Неверный идентификатор');
      return res.redirect('/admin/tours');
    }
    const tour = await Tour.findById(tourId);
    if (!tour) {
      req.flash('error', 'Тур не найден');
      return res.redirect('/admin/tours');
    }
    tour.reviews = tour.reviews.filter(review => review._id.toString() !== reviewId);
    await tour.save();
    req.flash('success', 'Отзыв успешно удалён');
    res.redirect(`/admin/tours/${tourId}/reviews`);
  } catch (error) {
    console.error('Error in deleteReview:', error.message, error.stack);
    req.flash('error', 'Ошибка удаления отзыва');
    res.redirect(`/admin/tours/${req.params.tourId}/reviews`);
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('tourId', 'title')
      .populate('userId', 'username email')
      .lean();
    res.render('admin/bookings', {
      bookings,
      user: req.user,
      message: req.flash('success') || req.flash('error'),
    });
  } catch (error) {
    console.error('Error in getBookings:', error.message, error.stack);
    req.flash('error', 'Ошибка загрузки бронирований');
    res.redirect('/admin');
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      req.flash('error', 'Бронирование не найдено');
      return res.redirect('/admin/bookings');
    }
    booking.status = 'confirmed';
    await booking.save();
    await User.updateOne(
      { _id: booking.userId, 'bookings._id': booking._id },
      { $set: { 'bookings.$.status': 'confirmed' } }
    );
    req.flash('success', 'Бронирование подтверждено');
    res.redirect('/admin/bookings');
  } catch (error) {
    console.error('Error in confirmBooking:', error.message, error.stack);
    req.flash('error', 'Ошибка подтверждения бронирования');
    res.redirect('/admin/bookings');
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      req.flash('error', 'Бронирование не найдено');
      return res.redirect('/admin/bookings');
    }
    booking.status = 'cancelled';
    await booking.save();
    await User.updateOne(
      { _id: booking.userId, 'bookings._id': booking._id },
      { $set: { 'bookings.$.status': 'cancelled' } }
    );
    req.flash('success', 'Бронирование отменено');
    res.redirect('/admin/bookings');
  } catch (error) {
    console.error('Error in cancelBooking:', error.message, error.stack);
    req.flash('error', 'Ошибка отмены бронирования');
    res.redirect('/admin/bookings');
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    res.render('admin/users', {
      users,
      user: req.user,
      message: req.flash('success') || req.flash('error'),
    });
  } catch (error) {
    console.error('Error in getUsers:', error.message, error.stack);
    req.flash('error', 'Ошибка загрузки пользователей');
    res.redirect('/admin');
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      req.flash('error', 'Пользователь не найден');
      return res.redirect('/admin/users');
    }
    user.role = role;
    await user.save();
    req.flash('success', 'Роль пользователя обновлена');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error in updateUserRole:', error.message, error.stack);
    req.flash('error', 'Ошибка обновления роли');
    res.redirect('/admin/users');
  }
};