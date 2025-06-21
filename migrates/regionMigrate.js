const mongoose = require('mongoose');
const Region = require('../models/Region');
const attractionsData = require('../tourism-krasnodar.attractions.json');

// Подключение к базе данных (замените на вашу строку подключения)
mongoose.connect('mongodb://localhost:27017/tourism-krasnodar', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Функция для группировки достопримечательностей по регионам
const groupAttractionsByRegion = () => {
  const attractionsByRegion = {};
  attractionsData.forEach(attraction => {
    const region = attraction.location.region;
    if (!attractionsByRegion[region]) {
      attractionsByRegion[region] = [];
    }
    attractionsByRegion[region].push(attraction.name);
  });
  return attractionsByRegion;
};

// Функция для определения климата и лучшего сезона по региону
const getClimateAndSeason = (regionName) => {
  const climateSeasons = {
    'Ялта': { climate: 'Субтропический, мягкий', bestSeason: 'Весна (апрель-май), осень (сентябрь-октябрь)' },
    'Севастополь': { climate: 'Субтропический, морской', bestSeason: 'Весна (апрель-июнь), осень (сентябрь)' },
    'Симферополь': { climate: 'Континентальный с мягкой зимой', bestSeason: 'Весна (апрель-июнь), осень (сентябрь)' },
    'Алушта': { climate: 'Субтропический, горный', bestSeason: 'Лето (июнь-август), осень (сентябрь)' },
    'Судак': { climate: 'Субтропический, сухой', bestSeason: 'Лето (июнь-август), весна (май)' },
    'Керчь': { climate: 'Континентальный, ветреный', bestSeason: 'Весна (апрель-июнь), осень (сентябрь)' },
    'Бахчисарай': { climate: 'Континентальный с переходом в горный', bestSeason: 'Весна (апрель-июнь), осень (сентябрь)' },
    'Армянск': { climate: 'Субтропический, степной', bestSeason: 'Лето (июнь-август), весна (май)' },
    'Феодосия': { climate: 'Субтропический, теплый', bestSeason: 'Лето (июнь-август), осень (сентябрь)' },
    'Евпатория': { climate: 'Субтропический, сухой', bestSeason: 'Лето (июнь-август), весна (май)' },
    'Джанкой': { climate: 'Субтропический, сухой', bestSeason: 'Лето (июль-август), весна (май)' },
  };

  return climateSeasons[regionName] || { climate: 'Субтропический', bestSeason: 'Весна (апрель-июнь), осень (сентябрь)' };
};

// Миграция данных
const migrateRegions = async () => {
  try {
    const attractionsByRegion = groupAttractionsByRegion();

    for (const regionName in attractionsByRegion) {
      const attractions = attractionsByRegion[regionName];
      const { climate, bestSeason } = getClimateAndSeason(regionName);

      await Region.findOneAndUpdate(
        { name: regionName },
        {
          $set: {
            attractions,
            climate,
            bestSeason,
            updatedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
      console.log(`Updated region: ${regionName} with attractions: ${attractions.join(', ')}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    mongoose.connection.close();
  }
};

migrateRegions();