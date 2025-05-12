const Hotel = require('../models/Hotel');
const Attraction = require('../models/Attraction');
const Restaurant = require('../models/Restaurant');

exports.getTravelPage = async (req, res) => {
  try {
    const attractions = await Attraction.find({})
      .sort({ rating: -1 }) // Сортировка по убыванию рейтинга
      .limit(10)
      .lean();
    const restaurants = await Restaurant.find({})
      .sort({ rating: -1 })
      .limit(10)
      .lean();
    const hotels = await Hotel.find({})
      .sort({ rating: -1 })
      .limit(10)
      .lean();

    console.log('Travel page data:', {
      attractions: attractions.length,
      restaurants: restaurants.length,
      hotels: hotels.length,
    });

    res.render('travels/travel', {
      attractions,
      restaurants,
      hotels,
      user: req.user || null,
      error: !attractions.length && !restaurants.length && !hotels.length
        ? 'Данные не найдены. Попробуйте позже.'
        : null,
    });
  } catch (error) {
    console.error('Ошибка загрузки страницы "Куда поехать":', error.message, error.stack);
    res.status(500).render('error', { message: 'Ошибка загрузки страницы' });
  }
};

exports.getPlacePage = async (req, res) => {
  try {
    const placeId = req.params.id;
    let place = await Hotel.findById(placeId).lean();
    if (!place) {
      place = await Attraction.findById(placeId).lean();
    }
    if (!place) {
      place = await Restaurant.findById(placeId).lean();
    }
    if (!place) {
      return res.status(404).render('error', { message: 'Место не найдено' });
    }
    res.render('travels/place', {
      place,
      user: req.user || null,
    });
  } catch (error) {
    console.error('Ошибка загрузки страницы места:', error.message, error.stack);
    res.status(500).render('error', { message: 'Ошибка загрузки страницы места' });
  }
};