const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Tour = require('./models/Tour');
const Hotel = require('./models/Hotel');
const Attraction = require('./models/Attraction');
const Restaurant = require('./models/Restaurant');
const Booking = require('./models/Booking');
const Review = require('./models/Review');
const Category = require('./models/Category');
const Region = require('./models/Region');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tourism-krasnodar';
const SALT_ROUNDS = 10;

async function seedDatabase() {
  try {
    // Подключение к MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Очистка всех коллекций
    await Promise.all([
      User.deleteMany({}),
      Tour.deleteMany({}),
      Hotel.deleteMany({}),
      Attraction.deleteMany({}),
      Restaurant.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Category.deleteMany({}),
      Region.deleteMany({}),
    ]);
    console.log('All collections cleared');

    // Создание пользователей (15)
    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash('admin123', SALT_ROUNDS),
        role: 'admin',
        profile: { firstName: 'Админ', lastName: 'Иванов', phone: '+79991234567', preferences: ['active', 'excursion'] },
        createdAt: new Date(),
      },
      ...Array.from({ length: 14 }, (_, i) => ({
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        passwordHash: bcrypt.hashSync('user123', SALT_ROUNDS),
        role: 'user',
        profile: {
          firstName: `Имя${i + 1}`,
          lastName: `Фамилия${i + 1}`,
          phone: `+799912345${i + 68}`,
          preferences: [ ['active', 'passive', 'camping', 'excursion', 'health'][Math.floor(Math.random() * 5)], 'cultural' ],
        },
        createdAt: new Date(),
      })),
    ]);
    console.log('Users created:', users.length);

    // Создание регионов (15)
    const regionsData = [
      { name: 'Ялта', lat: 44.4952, lng: 34.1663, attractions: ['Ливадийский дворец', 'Массандровский дворец'] },
      { name: 'Севастополь', lat: 44.6167, lng: 33.5254, attractions: ['Херсонес Таврический', 'Малахов курган'] },
      { name: 'Балаклава', lat: 44.5111, lng: 33.5992, attractions: ['Генуэзская крепость', 'Подземный музей'] },
      { name: 'Симферополь', lat: 44.9572, lng: 34.1108, attractions: ['Неаполь Скифский', 'Собор Александра Невского'] },
      { name: 'Алушта', lat: 44.6764, lng: 34.4100, attractions: ['Гора Демерджи', 'Долина Привидений'] },
      { name: 'Феодосия', lat: 45.0319, lng: 35.3824, attractions: ['Галерея Айвазовского', 'Генуэзская крепость Кафа'] },
      { name: 'Керчь', lat: 45.3531, lng: 36.4754, attractions: ['Аджимушкайские каменоломни', 'Царский курган'] },
      { name: 'Евпатория', lat: 45.2009, lng: 33.3668, attractions: ['Караимские кенассы', 'Мечеть Джума-Джами'] },
      { name: 'Бахчисарай', lat: 44.7552, lng: 33.8598, attractions: ['Ханский дворец', 'Чуфут-Кале'] },
      { name: 'Судак', lat: 44.8506, lng: 34.9747, attractions: ['Генуэзская крепость', 'Новый Свет'] },
      { name: 'Гурзуф', lat: 44.5506, lng: 34.2878, attractions: ['Гора Аю-Даг', 'Музей Чехова'] },
      { name: 'Коктебель', lat: 44.9601, lng: 35.2423, attractions: ['Кара-Даг', 'Дом-музей Волошина'] },
      { name: 'Саки', lat: 45.1342, lng: 33.5779, attractions: ['Сакское озеро', 'Музей грязелечения'] },
      { name: 'Белогорск', lat: 45.0543, lng: 34.6019, attractions: ['Белая скала', 'Сафари-парк Тайган'] },
      { name: 'Джанкой', lat: 45.7092, lng: 34.3937, attractions: ['Мемориал Победы', 'Краеведческий музей'] },
    ];
    const regions = await Region.insertMany(
      regionsData.map((region, i) => ({
        name: region.name,
        description: `Регион Крыма, известный своими ${region.attractions.join(' и ')}.`,
        attractions: region.attractions,
        climate: ['Субтропический', 'Умеренный'][Math.floor(i / 8)],
        bestSeason: ['Май-Сентябрь', 'Апрель-Октябрь'][Math.floor(i / 8)],
        images: [`https://example.com/images/region${i + 1}.jpg`],
        coordinates: { lat: region.lat, lng: region.lng },
        createdAt: new Date(),
      }))
    );
    console.log('Regions created:', regions.length);

    // Создание отелей (15)
    const hotels = await Hotel.insertMany(
      Array.from({ length: 15 }, (_, i) => ({
        name: `Отель ${['Морской', 'Крымский', 'Солнечный', 'Лазурный', 'Звездный', 'Приморский', 'Южный', 'Волна', 'Парус', 'Оазис', 'Бриз', 'Ривьера', 'Горизонт', 'Маяк', 'Алые Паруса'][i]}`,
        description: `Комфортабельный отель в ${regions[i].name}, идеально подходит для отдыха.`,
        location: { region: regions[i].name, coordinates: { lat: regions[i].coordinates.lat, lng: regions[i].coordinates.lng } },
        rating: (3 + Math.random() * 2).toFixed(1),
        amenities: ['Wi-Fi', 'Ресторан', 'Парковка', i % 2 === 0 ? 'Бассейн' : 'Фитнес-центр'],
        images: [`https://example.com/images/hotel${i + 1}.jpg`],
        website: `https://hotel${i + 1}.com`,
        capacity: 100 + i * 10,
        reviews: [
          {
            userId: users[i % users.length]._id,
            rating: Math.floor(3 + Math.random() * 3),
            comment: `Хороший отель в ${regions[i].name}!`,
            createdAt: new Date('2025-05-01'),
          },
        ],
      }))
    );
    console.log('Hotels created:', hotels.length);

    // Создание достопримечательностей (15)
    const attractionsData = [
      { name: 'Ливадийский дворец', category: 'historical', region: 'Ялта' },
      { name: 'Херсонес Таврический', category: 'historical', region: 'Севастополь' },
      { name: 'Гора Ай-Петри', category: 'natural', region: 'Ялта' },
      { name: 'Генуэзская крепость', category: 'historical', region: 'Судак' },
      { name: 'Ханский дворец', category: 'historical', region: 'Бахчисарай' },
      { name: 'Кара-Даг', category: 'natural', region: 'Коктебель' },
      { name: 'Массандровский дворец', category: 'historical', region: 'Ялта' },
      { name: 'Неаполь Скифский', category: 'historical', region: 'Симферополь' },
      { name: 'Гора Демерджи', category: 'natural', region: 'Алушта' },
      { name: 'Галерея Айвазовского', category: 'cultural', region: 'Феодосия' },
      { name: 'Аджимушкайские каменоломни', category: 'historical', region: 'Керчь' },
      { name: 'Караимские кенассы', category: 'cultural', region: 'Евпатория' },
      { name: 'Гора Аю-Даг', category: 'natural', region: 'Гурзуф' },
      { name: 'Белая скала', category: 'natural', region: 'Белогорск' },
      { name: 'Сакское озеро', category: 'natural', region: 'Саки' },
    ];
    const attractions = await Attraction.insertMany(
      attractionsData.map((attr, i) => ({
        name: attr.name,
        description: `Знаменитая достопримечательность в ${attr.region}.`,
        location: {
          region: attr.region,
          coordinates: regions.find(r => r.name === attr.region).coordinates,
        },
        category: attr.category,
        images: [`https://example.com/images/attraction${i + 1}.jpg`],
        website: i % 2 === 0 ? `https://attraction${i + 1}.com` : undefined,
      }))
    );
    console.log('Attractions created:', attractions.length);

    // Создание ресторанов (15)
    const restaurants = await Restaurant.insertMany(
      Array.from({ length: 15 }, (_, i) => ({
        name: `Ресторан ${['Морской', 'Крымский', 'Таврида', 'Чайка', 'Виноград', 'Шторм', 'Лагуна', 'Золотой берег', 'Сакура', 'Олива', 'Бахчисарай', 'Казантип', 'Якорь', 'Фрегат', 'Панорама'][i]}`,
        description: `Ресторан с уникальной кухней в ${regions[i].name}.`,
        location: { region: regions[i].name, coordinates: regions[i].coordinates },
        cuisine: ['Морепродукты', 'Крымская', 'Европейская', 'Азиатская'][i % 4],
        images: [`https://example.com/images/restaurant${i + 1}.jpg`],
        website: i % 2 === 0 ? `https://restaurant${i + 1}.com` : undefined,
        reviews: [
          {
            userId: users[i % users.length]._id,
            rating: Math.floor(3 + Math.random() * 3),
            comment: `Отличная еда в ${regions[i].name}!`,
            createdAt: new Date('2025-05-02'),
          },
        ],
      }))
    );
    console.log('Restaurants created:', restaurants.length);

    // Создание категорий (5)
    const categories = await Category.insertMany([
      {
        name: 'Активный',
        description: 'Туры с физической активностью, такие как походы и велотуры.',
        icon: 'fa-hiking',
        subcategories: ['Походы', 'Велотуры', 'Каякинг'],
        createdAt: new Date(),
      },
      {
        name: 'Экскурсионный',
        description: 'Туры с посещением исторических и культурных мест.',
        icon: 'fa-landmark',
        subcategories: ['Исторические экскурсии', 'Культурные туры'],
        createdAt: new Date(),
      },
      {
        name: 'Кемпинг',
        description: 'Туры с проживанием в палатках на природе.',
        icon: 'fa-campground',
        subcategories: ['Горный кемпинг', 'Пляжный кемпинг'],
        createdAt: new Date(),
      },
      {
        name: 'Пассивный',
        description: 'Туры для спокойного отдыха и релакса.',
        icon: 'fa-umbrella-beach',
        subcategories: ['Пляжный отдых', 'Курортный отдых'],
        createdAt: new Date(),
      },
      {
        name: 'Оздоровительный',
        description: 'Туры для восстановления здоровья и релакса.',
        icon: 'fa-spa',
        subcategories: ['Санатории', 'СПА', 'Йога-ретриты'],
        createdAt: new Date(),
      },
    ]);
    console.log('Categories created:', categories.length);

    // Создание туров (15)
    const tourTypes = ['active', 'excursion', 'camping', 'passive', 'health'];
    const tours = await Tour.insertMany(
      Array.from({ length: 15 }, (_, i) => {
        const type = tourTypes[i % 5];
        const region = regions[i % regions.length];
        return {
          title: `${['Поход на Ай-Петри', 'Экскурсия по Ялте', 'Кемпинг в Балаклаве', 'Пляжный отдых в Алуште', 'Санаторий в Саки', 'Велотур по Крыму', 'Херсонес и Севастополь', 'Кемпинг на Кара-Даге', 'Отдых в Феодосии', 'СПА-тур в Евпатории', 'Поход в Бахчисарай', 'Экскурсия в Керчь', 'Кемпинг в Гурзуфе', 'Курорт в Судаке', 'Йога-ретрит в Коктебеле'][i]}`,
          description: `Тур ${type} в ${region.name}.`,
          type,
          durationDays: Math.floor(1 + Math.random() * 7),
          price: 10000 + i * 2000,
          location: { region: region.name, coordinates: region.coordinates },
          accommodation: {
            hotel: ['passive', 'health'].includes(type) ? hotels[i % hotels.length]._id : undefined,
            type: ['passive', 'health'].includes(type) ? ['hotel', 'sanatorium'][i % 2] : type === 'camping' ? 'camping' : 'none',
          },
          activities: [
            {
              name: `${type === 'active' ? 'Поход' : type === 'excursion' ? 'Экскурсия' : type === 'camping' ? 'Установка лагеря' : type === 'passive' ? 'Пляжный отдых' : 'Массаж'}`,
              description: `Основная активность тура.`,
              durationHours: Math.floor(1 + Math.random() * 5),
              equipmentRequired: type === 'active' || type === 'camping',
            },
          ],
          excursions: type === 'excursion' ? [
            {
              name: `Экскурсия в ${attractions[i % attractions.length].name}`,
              description: `Посещение достопримечательности.`,
              durationHours: 3,
              price: 1500,
            },
          ] : [],
          includedServices: ['Транспорт', type === 'health' ? 'Медицинские процедуры' : 'Гид'],
          season: {
            start: new Date('2025-05-01'),
            end: new Date('2025-10-31'),
          },
          minGroupSize: type === 'active' || type === 'camping' ? 5 : 1,
          maxGroupSize: type === 'active' || type === 'camping' ? 15 : 50,
          hotelCapacity: ['passive', 'health'].includes(type) ? hotels[i % hotels.length].capacity : undefined,
          images: [`https://example.com/images/tour${i + 1}.jpg`],
          isFeatured: i < 5,
          reviews: [
            {
              userId: users[i % users.length]._id,
              rating: Math.floor(3 + Math.random() * 3),
              comment: `Отличный тур в ${region.name}!`,
              createdAt: new Date('2025-05-03'),
            },
          ],
        };
      })
    );
    console.log('Tours created:', tours.length);

    // Обновление категорий с featuredTours
    await Promise.all(
      categories.map((category, i) =>
        Category.updateOne(
          { name: category.name },
          { $set: { featuredTours: tours.filter(t => t.type === tourTypes[i]).map(t => t._id).slice(0, 3) } }
        )
      )
    );
    console.log('Categories updated with featured tours');

    // Создание бронирований (15)
    const bookings = await Booking.insertMany(
      Array.from({ length: 15 }, (_, i) => ({
        userId: users[i % users.length]._id,
        tourId: tours[i]._id,
        bookingDate: new Date('2025-05-01'),
        tourDate: new Date(`2025-06-${10 + i}`),
        status: ['confirmed', 'pending', 'cancelled'][i % 3],
        participants: Math.floor(1 + Math.random() * 5),
        createdAt: new Date('2025-05-01'),
      }))
    );
    console.log('Bookings created:', bookings.length);

    // Обновление пользователей с бронированиями
    await Promise.all(
      users.map((user, i) =>
        User.updateOne(
          { _id: user._id },
          {
            $set: {
              bookings: [
                {
                  _id: new mongoose.Types.ObjectId(),
                  tourId: tours[i % tours.length]._id,
                  bookingDate: new Date('2025-05-01'),
                  status: bookings[i % bookings.length].status,
                  participants: bookings[i % bookings.length].participants,
                },
              ],
            },
          }
        )
      )
    );
    console.log('Users updated with bookings');

    // Создание отдельных отзывов (Review) (15)
    const reviews = await Review.insertMany(
      Array.from({ length: 15 }, (_, i) => ({
        tourId: tours[i]._id,
        userId: users[i % users.length]._id,
        rating: Math.floor(3 + Math.random() * 3),
        title: `Отзыв о туре ${tours[i].title}`,
        comment: `Тур в ${tours[i].location.region} был ${['замечательным', 'интересным', 'незабываемым'][i % 3]}.`,
        pros: 'Хорошая организация',
        cons: i % 3 === 0 ? 'Дороговато' : '',
        visitDate: new Date(`2025-06-${10 + i}`),
        images: i % 2 === 0 ? [`https://example.com/images/review${i + 1}.jpg`] : [],
        createdAt: new Date(`2025-06-${15 + i}`),
      }))
    );
    console.log('Reviews created:', reviews.length);

    // Обновление toursCount в регионах
    await Promise.all(
      regions.map(region =>
        Region.updateOne(
          { name: region.name },
          { $set: { toursCount: tours.filter(t => t.location.region === region.name).length } }
        )
      )
    );
    console.log('Regions updated with toursCount');

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

seedDatabase();