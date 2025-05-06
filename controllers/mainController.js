const Tour = require('../models/Tour');
const Region = require('../models/Region');

exports.getHomePage = async (req, res) => {
  try {
    const { type } = req.query;
    const tourQuery = type ? { isFeatured: true, type } : { isFeatured: true };
    const featuredTours = await Tour.find(tourQuery).limit(6).lean();
    const regions = await Region.find().limit(6).lean();
    res.render('index', {
      featuredTours,
      regions,
      user: req.user || null,
      currentType: type || 'all',
    });
  } catch (error) {
    console.error('Ошибка загрузки главной страницы:', error);
    res.status(500).render('error', { message: 'Ошибка загрузки главной страницы' });
  }
};

exports.filterTours = async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { isFeatured: true, type } : { isFeatured: true };
    const tours = await Tour.find(query).limit(6).lean(); // Используем .lean() для чистого JSON
    console.log(`Фильтрация туров: type=${type || 'all'}, найдено=${tours.length}`);
    res.json({ tours });
  } catch (error) {
    console.error('Ошибка фильтрации туров:', error);
    res.status(500).json({ error: `Ошибка сервера: ${error.message}` });
  }
};