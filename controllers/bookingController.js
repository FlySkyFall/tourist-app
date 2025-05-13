const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const User = require('../models/User');
const Availability = require('../models/Availability');
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

    // Проверка доступных мест для всех дней тура
    const tourDates = [];
    for (let i = 0; i < tour.durationDays; i++) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() + i);
      tourDates.push(date);
    }

    const availabilities = await Availability.find({
      tourId,
      date: { $in: tourDates.map(d => new Date(d.setHours(0, 0, 0, 0))) },
    });

    // Инициализация доступности, если записи отсутствуют
    const missingDates = tourDates.filter(d => !availabilities.find(a => a.date.getTime() === new Date(d.setHours(0, 0, 0, 0)).getTime()));
    for (const date of missingDates) {
      const newAvailability = new Availability({
        tourId,
        date: new Date(date.setHours(0, 0, 0, 0)),
        availableSlots: maxCapacity,
      });
      await newAvailability.save();
      availabilities.push(newAvailability);
    }

    // Проверка, что на все даты достаточно мест
    for (const availability of availabilities) {
      if (availability.availableSlots < participants) {
        return res.status(400).json({ 
          error: `Недостаточно мест на ${new Date(availability.date).toLocaleDateString('ru-RU')}: доступно ${availability.availableSlots}` 
        });
      }
    }

    const activeBooking = await Booking.findOne({
      userId: req.user._id,
      status: { $in: ['pending', 'confirmed'] }
    });
    if (activeBooking) {
      return res.status(400).json({ error: 'У вас уже есть активное бронирование' });
    }

    const booking = new Booking({
      userId: req.user._id,
      tourId,
      bookingDate: new Date(),
      tourDate: selectedDate,
      participants,
      status: 'pending',
      paymentStatus: 'pending',
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
          paymentStatus: 'pending',
        },
      },
    });

    return res.status(201).json({ 
      message: 'Бронирование успешно создано. Пожалуйста, оплатите, чтобы подтвердить.',
      bookingId: booking._id
    });
  } catch (error) {
    console.error('Error in createBooking:', error.message, error.stack);
    return res.status(500).json({ error: `Ошибка бронирования: ${error.message}` });
  }
};

exports.processPayment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const bookingId = req.params.id;
    console.log('Processing payment for bookingId:', bookingId, 'req.body:', req.body);

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: 'Неверный идентификатор бронирования' });
    }

    if (!req.body || !req.body.cardNumber || !req.body.cardHolder || !req.body.expiry || !req.body.cvv) {
      console.error('Missing payment data:', req.body);
      return res.status(400).json({ error: 'Все поля формы оплаты обязательны' });
    }

    const { cardNumber, cardHolder, expiry, cvv } = req.body;

    // Валидация данных карты
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
      return res.status(400).json({ error: 'Некорректный номер карты' });
    }
    if (!cardHolder || cardHolder.trim().length < 2) {
      return res.status(400).json({ error: 'Укажите имя держателя карты' });
    }
    if (!expiry || !/^(0[1-9]|1[0-2])\/[0-9]{2}$/.test(expiry)) {
      return res.status(400).json({ error: 'Некорректный срок действия' });
    }
    if (!cvv || cvv.length !== 3 || !/^\d+$/.test(cvv)) {
      return res.status(400).json({ error: 'Некорректный CVV' });
    }

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено или не принадлежит вам' });
    }

    const tour = await Tour.findById(booking.tourId);
    if (!tour) {
      return res.status(404).json({ error: 'Тур не найден' });
    }

    // Имитация обработки платежа (10% шанс отклонения)
    const isPaymentSuccessful = Math.random() > 0.1;

    if (isPaymentSuccessful) {
      booking.paymentStatus = 'completed';
      booking.status = 'confirmed';
      await booking.save();

      // Уменьшение доступных мест для всех дней тура
      const tourDates = [];
      for (let i = 0; i < tour.durationDays; i++) {
        const date = new Date(booking.tourDate);
        date.setDate(booking.tourDate.getDate() + i);
        tourDates.push(new Date(date.setHours(0, 0, 0, 0)));
      }

      await Availability.updateMany(
        { tourId: tour._id, date: { $in: tourDates } },
        { $inc: { availableSlots: -booking.participants } }
      );

      await User.updateOne(
        { _id: req.user._id, 'bookings._id': bookingId },
        { $set: { 'bookings.$.status': 'confirmed', 'bookings.$.paymentStatus': 'completed' } }
      );

      return res.status(200).json({ 
        message: 'Оплата прошла успешно! Бронь подтверждена.',
        bookingId
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();

      await User.updateOne(
        { _id: req.user._id, 'bookings._id': bookingId },
        { $set: { 'bookings.$.paymentStatus': 'failed' } }
      );

      return res.status(400).json({ 
        error: 'Оплата отклонена. Попробуйте снова.',
        bookingId
      });
    }
  } catch (error) {
    console.error('Error in processPayment:', error.message, error.stack);
    return res.status(500).json({ error: `Ошибка обработки оплаты: ${error.message}` });
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

    if (booking.status === 'confirmed') {
      return res.status(400).json({ error: 'Нельзя отменить подтверждённое бронирование' });
    }

    console.log('Found booking:', booking);

    // Восстановление доступных мест, если бронирование было оплачено
    if (booking.paymentStatus === 'completed') {
      const tour = await Tour.findById(booking.tourId);
      const tourDates = [];
      for (let i = 0; i < tour.durationDays; i++) {
        const date = new Date(booking.tourDate);
        date.setDate(booking.tourDate.getDate() + i);
        tourDates.push(new Date(date.setHours(0, 0, 0, 0)));
      }

      await Availability.updateMany(
        { tourId: tour._id, date: { $in: tourDates } },
        { $inc: { availableSlots: booking.participants } }
      );
    }

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

exports.getTourAvailability = async (req, res) => {
  try {
    const tourId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({ error: 'Неверный идентификатор тура' });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ error: 'Тур не найден' });
    }

    const maxCapacity = ['passive', 'health'].includes(tour.type) ? tour.hotelCapacity : tour.maxGroupSize;
    const seasonStart = new Date(tour.season.start);
    const seasonEnd = new Date(tour.season.end);

    // Получение всех записей доступности в сезоне
    const availabilities = await Availability.find({
      tourId,
      date: { $gte: seasonStart, $lte: seasonEnd },
    });

    // Генерация событий для календаря
    const events = [];
    const currentDate = new Date(seasonStart);
    while (currentDate <= seasonEnd) {
      const date = new Date(currentDate.setHours(0, 0, 0, 0));
      let availableSlots = maxCapacity;

      const availability = availabilities.find(a => a.date.getTime() === date.getTime());
      if (availability) {
        availableSlots = availability.availableSlots;
      } else {
        // Если запись отсутствует, создаём её
        const newAvailability = new Availability({
          tourId,
          date,
          availableSlots: maxCapacity,
        });
        await newAvailability.save();
      }

      events.push({
        start: date.toISOString().split('T')[0],
        availableSlots,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return res.status(200).json(events);
  } catch (error) {
    console.error('Error in getTourAvailability:', error.message, error.stack);
    return res.status(500).json({ error: `Ошибка получения доступности: ${error.message}` });
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

    console.log('Fetched bookings:', bookings.map(b => ({ _id: b._id, tourId: b.tourId, status: b.status, paymentStatus: b.paymentStatus })));

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
      // Восстановление доступных мест для подтверждённых бронирований
      for (const booking of expiredBookings) {
        const bookingRecord = await Booking.findById(booking._id);
        if (bookingRecord.paymentStatus === 'completed') {
          const tour = await Tour.findById(booking.tourId);
          const tourDates = [];
          for (let i = 0; i < tour.durationDays; i++) {
            const date = new Date(booking.tourDate);
            date.setDate(booking.tourDate.getDate() + i);
            tourDates.push(new Date(date.setHours(0, 0, 0, 0)));
          }

          await Availability.updateMany(
            { tourId: tour._id, date: { $in: tourDates } },
            { $inc: { availableSlots: bookingRecord.participants } }
          );
        }
      }

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