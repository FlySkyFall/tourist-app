const mongoose = require('mongoose');
const { Faker, ru } = require('@faker-js/faker');
const bcrypt = require('bcrypt');
const Tour = require('./models/Tour');
const Booking = require('./models/Booking');
const Category = require('./models/Category');
const Region = require('./models/Region');
const Review = require('./models/Review');
const User = require('./models/User');

// Инициализация Faker с русской локализацией
const faker = new Faker({ locale: [ru] });

// Подключение к MongoDB
const MONGO_URI = 'mongodb://localhost/tourism-krasnodar';

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Очистка коллекций
async function clearCollections() {
  const collections = [Tour, Booking, Category, Region, Review, User];
  for (const Model of collections) {
    await Model.deleteMany({});
    console.log(`${Model.modelName} collection cleared`);
  }
}

// Генерация пользователей
async function createUsers() {
  const users = [];
  const roles = ['admin', 'moderator', ...Array(8).fill('user')];

  for (let i = 0; i < 10; i++) {
    const username = faker.internet.userName();
    const email = faker.internet.email();
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = new User({
      username,
      email,
      passwordHash,
      role: roles[i],
      profile: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        preferences: [faker.helpers.arrayElement(['active', 'camping', 'health', 'excursion'])],
      },
    });
    await user.save();
    users.push(user);
    console.log(`Created user: ${username}`);
  }
  return users;
}

// Генерация регионов
async function createRegions() {
  const regions = [];
  const regionNames = ['Краснодарский край', 'Ростовская область', 'Ставропольский край', 'Республика Адыгея', 'Кабардино-Балкария'];

  for (let i = 0; i < 5; i++) {
    const region = new Region({
      name: regionNames[i],
      description: faker.lorem.paragraph(),
      attractions: [faker.lorem.words(3), faker.lorem.words(3)],
      climate: faker.helpers.arrayElement(['умеренный', 'субтропический', 'горный']),
      bestSeason: faker.helpers.arrayElement(['лето', 'весна', 'осень', 'зима']),
      images: [faker.image.url()],
      coordinates: {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
      },
    });
    await region.save();
    regions.push(region);
    console.log(`Created region: ${region.name}`);
  }
  return regions;
}

// Генерация категорий
async function createCategories(tours) {
  const categories = [];
  const categoryNames = ['Активный отдых', 'Экскурсии', 'Кемпинг', 'Оздоровление', 'Пассивный отдых'];

  for (let i = 0; i < 5; i++) {
    const category = new Category({
      name: categoryNames[i],
      description: faker.lorem.sentence(),
      icon: faker.image.url(),
      subcategories: [faker.lorem.word(), faker.lorem.word()],
      featuredTours: faker.helpers.arrayElements(tours, 3).map(tour => tour._id),
    });
    await category.save();
    categories.push(category);
    console.log(`Created category: ${category.name}`);
  }
  return categories;
}

// Генерация туров
async function createTours(regions, users) {
  const tours = [];
  const types = ['active', 'passive', 'camping', 'excursion', 'health'];
  const accommodationTypes = ['hotel', 'sanatorium', 'camping', 'retreat', 'none'];
  const difficultyLevels = ['easy', 'medium', 'hard'];

  for (let i = 0; i < 20; i++) {
    const region = faker.helpers.arrayElement(regions);
    const tour = new Tour({
      title: `Тур ${faker.lorem.words(2)}`,
      description: faker.lorem.paragraph(),
      type: faker.helpers.arrayElement(types),
      durationDays: faker.number.int({ min: 1, max: 14 }),
      price: faker.number.int({ min: 5000, max: 50000 }),
      location: {
        region: region.name,
        coordinates: {
          lat: region.coordinates.lat + faker.number.float({ min: -0.1, max: 0.1 }),
          lng: region.coordinates.lng + faker.number.float({ min: -0.1, max: 0.1 }),
        },
      },
      accommodation: {
        type: faker.helpers.arrayElement(accommodationTypes),
        name: faker.company.name(),
        rating: faker.number.int({ min: 0, max: 5 }),
        amenities: [faker.lorem.word(), faker.lorem.word()],
      },
      activities: [
        {
          name: faker.lorem.words(2),
          description: faker.lorem.sentence(),
          durationHours: faker.number.int({ min: 1, max: 8 }),
          equipmentRequired: faker.datatype.boolean(),
        },
      ],
      excursions: [
        {
          name: faker.lorem.words(2),
          description: faker.lorem.sentence(),
          durationHours: faker.number.int({ min: 1, max: 4 }),
          price: faker.number.int({ min: 1000, max: 10000 }),
        },
      ],
      includedServices: [faker.lorem.word(), faker.lorem.word()],
      season: {
        start: faker.date.soon(),
        end: faker.date.future(),
      },
      minGroupSize: faker.number.int({ min: 1, max: 5 }),
      maxGroupSize: faker.number.int({ min: 6, max: 20 }),
      difficultyLevel: faker.helpers.arrayElement(difficultyLevels),
      images: [faker.image.url()],
      isFeatured: faker.datatype.boolean(),
      reviews: faker.helpers.arrayElements(users, faker.number.int({ min: 0, max: 3 })).map(user => ({
        userId: user._id,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
      })),
    });
    await tour.save();
    tours.push(tour);
    console.log(`Created tour: ${tour.title}`);

    // Обновление toursCount в регионе
    await Region.updateOne({ _id: region._id }, { $inc: { toursCount: 1 } });
  }
  return tours;
}

// Генерация бронирований
async function createBookings(users, tours) {
  const bookings = [];
  const statuses = ['confirmed', 'pending', 'cancelled'];

  for (let i = 0; i < 15; i++) {
    const user = faker.helpers.arrayElement(users);
    const tour = faker.helpers.arrayElement(tours);
    const booking = new Booking({
      userId: user._id,
      tourId: tour._id,
      bookingDate: faker.date.recent(),
      status: faker.helpers.arrayElement(statuses),
      participants: faker.number.int({ min: 1, max: tour.maxGroupSize }),
    });
    await booking.save();
    bookings.push(booking);

    // Добавление бронирования в профиль пользователя
    await User.updateOne(
      { _id: user._id },
      {
        $push: {
          bookings: {
            _id: booking._id,
            tourId: tour._id,
            bookingDate: booking.bookingDate,
            status: booking.status,
            participants: booking.participants,
          },
        },
      }
    );
    console.log(`Created booking for user: ${user.username}, tour: ${tour.title}`);
  }
  return bookings;
}

// Генерация отдельных отзывов (модель Review)
async function createReviews(users, tours) {
  const reviews = [];

  for (let i = 0; i < 15; i++) {
    const user = faker.helpers.arrayElement(users);
    const tour = faker.helpers.arrayElement(tours);
    const review = new Review({
      tourId: tour._id,
      userId: user._id,
      rating: faker.number.int({ min: 1, max: 5 }),
      title: faker.lorem.words(3),
      comment: faker.lorem.paragraph(),
      pros: faker.lorem.sentence(),
      cons: faker.lorem.sentence(),
      visitDate: faker.date.past(),
      images: [faker.image.url()],
    });
    await review.save();
    reviews.push(review);
    console.log(`Created review for tour: ${tour.title}`);
  }
  return reviews;
}

// Основная функция заполнения
async function seedDatabase() {
  try {
    await connectDB();
    await clearCollections();

    const users = await createUsers();
    const regions = await createRegions();
    const tours = await createTours(regions, users);
    const categories = await createCategories(tours);
    const bookings = await createBookings(users, tours);
    const reviews = await createReviews(users, tours);

    console.log('Database seeded successfully');
    console.log(`Created ${users.length} users, ${regions.length} regions, ${categories.length} categories, ${tours.length} tours, ${bookings.length} bookings, ${reviews.length} reviews`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Запуск скрипта
seedDatabase();