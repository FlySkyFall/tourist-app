const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.createBooking = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const { tourId, tourDate, participants } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({ error: 'Неверный идентификатор тура' });
    }

    if (!tourDate) {
      return res.status(400).json({ error: 'Дата проведения тура обязательна' });
    }

    if (!participants || participants < 1) {
      return res.status(400).json({ error: 'Количество участников должно быть больше 0' });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ error: 'Тур не найден' });
    }

    const selectedDate = new Date(tourDate);
    const seasonStart = new Date(tour.season.start);
    const seasonEnd = new Date(tour.season.end);

    if (selectedDate < seasonStart || selectedDate > seasonEnd) {
      return res.status(400).json({ 
        error: `Дата должна быть в пределах сезона: с ${seasonStart.toLocaleDateString('ru-RU')} по ${seasonEnd.toLocaleDateString('ru-RU')}` 
      });
    }

    const maxCapacity = ['passive', 'health'].includes(tour.type) ? tour.hotelCapacity : tour.maxGroupSize;
    if (participants > maxCapacity) {
      return res.status(400).json({ 
        error: `Количество участников не может превышать ${maxCapacity}` 
      });
    }

    // Проверка доступных мест
    const existingBookings = await Booking.find({
      tourId,
      tourDate: {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(selectedDate.setHours(23, 59, 59, 999)),
      },
      status: { $ne: 'cancelled' },
    });

    const totalParticipants = existingBookings.reduce((sum, booking) => sum + booking.participants, 0);
    if (totalParticipants + participants > maxCapacity) {
      return res.status(400).json({ 
        error: `Недостаточно мест для ${participants} участников на выбранную дату` 
      });
    }

    const booking = new Booking({
      userId: req.user._id,
      tourId,
      bookingDate: new Date(),
      tourDate: selectedDate,
      participants,
      status: 'pending',
    });

    await booking.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        bookings: {
          _id: booking._id,
          tourId,
          bookingDate: new Date(),
          tourDate: selectedDate,
          status: 'pending',
          participants,
        },
      },
    });

    return res.status(201).json({ message: 'Бронирование успешно создано' });
  } catch (error) {
    console.error('Error in createBooking:', error.message, error.stack);
    return res.status(500).json({ error: `Ошибка бронирования: ${error.message}` });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const bookings = await Booking.find({ userId: req.user._id })
      .populate('tourId', 'title')
      .lean();

    console.log('Fetched bookings:', bookings.map(b => ({ _id: b._id, tourId: b.tourId, status: b.status })));

    const invalidBookings = bookings.filter(b => !mongoose.Types.ObjectId.isValid(b._id));
    if (invalidBookings.length > 0) {
      console.warn('Invalid booking IDs found:', invalidBookings);
    }

    res.render('booking/list', {
      bookings,
      user: req.user,
      message: req.flash('success') || req.flash('error'),
    });
  } catch (error) {
    console.error('Error in getUserBookings:', error.message, error.stack);
    return res.status(500).json({ error: `Ошибка загрузки бронирований: ${error.message}` });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const bookingId = req.params.id;
    console.log('Attempting to cancel booking:', bookingId);

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      console.log('Invalid bookingId:', bookingId);
      return res.status(400).json({ error: 'Неверный идентификатор бронирования' });
    }

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });
    if (!booking) {
      console.log('Booking not found or not owned by user:', { bookingId, userId: req.user._id });
      return res.status(404).json({ error: 'Бронирование не найдено или не принадлежит вам' });
    }

    console.log('Found booking:', booking);

    booking.status = 'cancelled';
    await booking.save();
    console.log('Booking status updated to cancelled:', booking);

    const userUpdateResult = await User.updateOne(
      { _id: req.user._id, 'bookings._id': bookingId },
      { $set: { 'bookings.$.status': 'cancelled' } }
    );
    console.log('User bookings update result:', userUpdateResult);

    if (userUpdateResult.matchedCount === 0) {
      console.warn('No matching booking found in user.bookings for:', { bookingId, userId: req.user._id });
    }

    return res.status(200).json({ message: 'Бронирование успешно отменено' });
  } catch (error) {
    console.error('Error in cancelBooking:', error.message, error.stack);
    return res.status(500).json({ error: `Ошибка отмены бронирования: ${error.message}` });
  }
};

exports.cleanExpiredBookings = async (req, res) => {
  try {
    const currentDate = new Date();
    const expiredBookings = await Booking.aggregate([
      {
        $lookup: {
          from: 'tours',
          localField: 'tourId',
          foreignField: '_id',
          as: 'tour',
        },
      },
      { $unwind: '$tour' },
      {
        $match: {
          status: { $in: ['pending', 'confirmed'] },
        },
      },
      {
        $project: {
          tourId: 1,
          tourDate: 1,
          durationDays: '$tour.durationDays',
          endDate: {
            $dateAdd: {
              startDate: '$tourDate',
              unit: 'day',
              amount: '$tour.durationDays',
            },
          },
        },
      },
      {
        $match: {
          endDate: { $lte: currentDate },
        },
      },
    ]);

    const bookingIds = expiredBookings.map(b => b._id);
    console.log('Expired bookings to delete:', bookingIds);

    if (bookingIds.length > 0) {
      await Booking.deleteMany({ _id: { $in: bookingIds } });
      await User.updateMany(
        { 'bookings._id': { $in: bookingIds } },
        { $pull: { bookings: { _id: { $in: bookingIds } } } }
      );
    }

    const message = bookingIds.length > 0 
      ? `Удалено ${bookingIds.length} истёкших бронирований`
      : 'Нет истёкших бронирований для удаления';

    if (res) {
      return res.status(200).json({ message });
    }
    console.log(message);
  } catch (error) {
    console.error('Error in cleanExpiredBookings:', error.message, error.stack);
    if (res) {
      return res.status(500).json({ error: `Ошибка очистки бронирований: ${error.message}` });
    }
  }
};