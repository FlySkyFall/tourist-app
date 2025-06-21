const mongoose = require('mongoose');
const Achievement = require('./models/Achievement');
const Availability = require('./models/Availability');
const Booking = require('./models/Booking');
const Category = require('./models/Category');
const Hotel = require('./models/Hotel');
const HotelAvailability = require('./models/HotelAvailability');
const Post = require('./models/Post');
const Region = require('./models/Region');
const Restaurant = require('./models/Restaurant');
const Review = require('./models/Review');
const Tour = require('./models/Tour');
const User = require('./models/User');
const UserAchievement = require('./models/UserAchievement');

// Подключение к базе данных
mongoose.connect('mongodb://localhost:27017/tourism-krasnodar', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Подключение к MongoDB успешно'))
  .catch(err => console.error('Ошибка подключения:', err));

(async () => {
  try {
    // Очистка всех коллекций перед вставкой (кроме Achievement, Hotel, Attraction)
    await Region.deleteMany({});
    await Booking.deleteMany({});
    await Tour.deleteMany({});
    await User.deleteMany({});
    await Category.deleteMany({});
    await Restaurant.deleteMany({});
    await HotelAvailability.deleteMany({});
    await Availability.deleteMany({});
    await Post.deleteMany({});
    await Review.deleteMany({});
    await UserAchievement.deleteMany({});

    // Загрузка существующих достижений
    const achievements = await Achievement.find({});

    // Генерация и вставка пользователей
    const users = [];
    for (let i = 0; i < 20; i++) {
      users.push({
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        passwordHash: 'hashedpassword123',
        profile: { firstName: `Имя${i + 1}`, lastName: `Фамилия${i + 1}`, phone: `+7-999-999-99-${i + 1}` },
      });
    }
    const savedUsers = await User.insertMany(users); // Сохраняем пользователей и получаем их _id

    // Данные для генерации
    const regions = [
      { name: 'Симферополь', coordinates: { lat: 44.9521, lng: 34.1024 }, description: 'Столица Крыма с богатой историей' },
      { name: 'Севастополь', coordinates: { lat: 44.6166, lng: 33.5254 }, description: 'Город-герой с морскими достопримечательностями' },
      { name: 'Ялта', coordinates: { lat: 44.4998, lng: 34.1581 }, description: 'Курортный город на Черном море' },
      { name: 'Керчь', coordinates: { lat: 45.3562, lng: 36.4687 }, description: 'Древний город с археологическими памятниками' },
      { name: 'Феодосия', coordinates: { lat: 45.0399, lng: 35.3773 }, description: 'Город с богатой культурой и пляжами' },
      { name: 'Евпатория', coordinates: { lat: 45.1902, lng: 33.3667 }, description: 'Известный курорт с лечебными грязями' },
      { name: 'Алушта', coordinates: { lat: 44.6746, lng: 34.4106 }, description: 'Город с горными и морскими пейзажами' },
      { name: 'Судак', coordinates: { lat: 44.8500, lng: 34.9667 }, description: 'Известен Генуэзской крепостью' },
      { name: 'Бахчисарай', coordinates: { lat: 44.7545, lng: 33.8674 }, description: 'Центр крымскотатарской культуры' },
      { name: 'Джанкой', coordinates: { lat: 45.7111, lng: 34.3922 }, description: 'Сельскохозяйственный центр Крыма' },
      { name: 'Армянск', coordinates: { lat: 46.1081, lng: 33.6928 }, description: 'Промышленный город на севере Крыма' },
    ];

    const tours = [];
    const tourThemes = {
      active: { prefix: 'Активный тур', suffixes: ['по горам', 'с альпинизмом', 'с треккингом'] },
      passive: { prefix: 'Пляжный отдых', suffixes: ['в Mriya Resort', 'на Золотом пляже', 'у моря'] },
      camping: { prefix: 'Кемпинг', suffixes: ['в лесах', 'у озера', 'на природе'] },
      excursion: { prefix: 'Экскурсия', suffixes: ['по историческим местам', 'в Генуэзскую крепость', 'к Ханскому дворцу'] },
      health: { prefix: 'Оздоровительный тур', suffixes: ['с грязелечением', 'в санатории', 'на термальных источниках'] }
    };
    for (let i = 0; i < 120; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      const type = ['active', 'passive', 'camping', 'excursion', 'health'][Math.floor(Math.random() * 5)];
      const theme = tourThemes[type];
      const suffix = theme.suffixes[Math.floor(Math.random() * theme.suffixes.length)];
      const title = `${theme.prefix} в ${region.name} ${suffix}`;
      tours.push({
        title: title,
        description: `Уникальный тур ${type === 'active' ? 'с активными приключениями' : type === 'passive' ? 'для расслабленного отдыха' : type === 'camping' ? 'с ночевками на природе' : type === 'excursion' ? 'с посещением достопримечательностей' : 'для оздоровления'} в ${region.name}.`,
        type: type,
        durationDays: Math.floor(Math.random() * 7) + 1,
        price: Math.floor(Math.random() * 20000) + 5000,
        location: { region: region.name, coordinates: { lat: region.coordinates.lat, lng: region.coordinates.lng } },
        route: (Math.random() > 0.5) ? [{ lat: region.coordinates.lat + 0.1, lng: region.coordinates.lng + 0.1 }] : undefined,
        accommodation: {
          hotel: [
            '685446299e681b9d988414c1', '685446299e681b9d988414c2', '685446299e681b9d988414c3',
            '685446299e681b9d988414c4', '685446299e681b9d988414c5', '685446299e681b9d988414c6',
            '685446299e681b9d988414c7', '685446299e681b9d988414c8', '685446299e681b9d988414c9',
            '685446299e681b9d988414ca', '685446299e681b9d988414cb', '685446299e681b9d988414cc',
            '685446299e681b9d988414cd', '685446299e681b9d988414ce', '685446299e681b9d988414cf',
            '685446299e681b9d988414d0', '685446299e681b9d988414d1', '685446299e681b9d988414d2',
            '685446299e681b9d988414d3', '685446299e681b9d988414d4', '685446299e681b9d988414d5',
            '685446299e681b9d98841510', '685446299e681b9d98841511', '685446299e681b9d98841512',
            '685446299e681b9d98841513', '685446299e681b9d98841514', '685446299e681b9d98841515',
            '685446299e681b9d98841516', '685446299e681b9d98841517', '685446299e681b9d98841518',
            '685446299e681b9d98841519', '685446299e681b9d9884151a', '685446299e681b9d9884151b',
            '685446299e681b9d9884151c', '685446299e681b9d9884151d', '685446299e681b9d9884151e',
            '685446299e681b9d9884151f', '685446299e681b9d98841520', '685446299e681b9d98841521',
            '685446299e681b9d98841522', '685446299e681b9d98841523'
          ][Math.floor(Math.random() * 40)],
          type: ['hotel', 'sanatorium', 'camping', 'retreat', 'none'][Math.floor(Math.random() * 5)],
          amenities: ['Wi-Fi', 'Бассейн', 'Парковка'][Math.floor(Math.random() * 3)],
        },
        activities: [{ name: 'Прогулка', description: 'Прогулка по парку', durationHours: 2, equipmentRequired: false }],
        excursions: [{ name: 'Экскурсия', description: 'Обзорная экскурсия', durationHours: 3, price: 1000 }],
        includedServices: ['Питание', 'Транспорт'],
        season: { start: new Date(2025, 5, 1), end: new Date(2025, 8, 30) },
        minGroupSize: 2,
        maxGroupSize: 20,
        hotelCapacity: 50,
        images: ['/images/tour1.jpg'],
        isFeatured: Math.random() > 0.7,
        isHotDeal: Math.random() > 0.8,
        discounts: {
          groupDiscount: { enabled: Math.random() > 0.6, percentage: 10 },
          seasonalDiscount: { enabled: Math.random() > 0.6, startDate: new Date(2025, 6, 1), endDate: new Date(2025, 7, 31), percentage: 15 },
          hotDealDiscount: { enabled: Math.random() > 0.7, percentage: 20 },
        },
      });
    }

    const bookings = [];
    for (let i = 0; i < 15; i++) {
      bookings.push({
        userId: savedUsers[Math.floor(Math.random() * savedUsers.length)]._id,
        tourId: tours[Math.floor(Math.random() * tours.length)]._id || new mongoose.Types.ObjectId(),
        hotelId: [
          '685446299e681b9d988414c1', '685446299e681b9d988414c2', '685446299e681b9d988414c3',
          '685446299e681b9d988414c4', '685446299e681b9d988414c5', '685446299e681b9d988414c6',
          '685446299e681b9d988414c7', '685446299e681b9d988414c8', '685446299e681b9d988414c9',
          '685446299e681b9d988414ca', '685446299e681b9d988414cb', '685446299e681b9d988414cc',
          '685446299e681b9d988414cd', '685446299e681b9d988414ce', '685446299e681b9d988414cf',
          '685446299e681b9d988414d0', '685446299e681b9d988414d1', '685446299e681b9d988414d2',
          '685446299e681b9d988414d3', '685446299e681b9d988414d4', '685446299e681b9d988414d5',
          '685446299e681b9d98841510', '685446299e681b9d98841511', '685446299e681b9d98841512',
          '685446299e681b9d98841513', '685446299e681b9d98841514', '685446299e681b9d98841515',
          '685446299e681b9d98841516', '685446299e681b9d98841517', '685446299e681b9d98841518',
          '685446299e681b9d98841519', '685446299e681b9d9884151a', '685446299e681b9d9884151b',
          '685446299e681b9d9884151c', '685446299e681b9d9884151d', '685446299e681b9d9884151e',
          '685446299e681b9d9884151f', '685446299e681b9d98841520', '685446299e681b9d98841521',
          '685446299e681b9d98841522', '685446299e681b9d98841523'
        ][Math.floor(Math.random() * 40)],
        startDate: new Date(2025, 6, Math.floor(Math.random() * 30) + 1),
        endDate: new Date(2025, 6, Math.floor(Math.random() * 30) + 8),
        participants: Math.floor(Math.random() * 5) + 1,
        roomType: ['standard', 'standardWithAC', 'luxury'][Math.floor(Math.random() * 3)],
        totalPrice: Math.floor(Math.random() * 15000) + 5000,
      });
    }

    const hotelAvailabilities = [];
    const hotels = await Hotel.find(); // Дождитесь получения списка отелей
    const startDate = new Date(2025, 6, 1); // 1 июля 2025
    const endDate = new Date(2025, 11, 31); // 31 декабря 2025
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      hotels.forEach(hotel => {
        hotelAvailabilities.push({
          hotelId: hotel._id,
          date: new Date(currentDate),
          availableSlots: Math.floor(Math.random() * 200) + 300, // 300-499 мест
        });
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const tourAvailabilities = [];
    tours.forEach(tour => {
      const startDate = new Date(2025, 6, 1); // 1 июля 2025
      const endDate = new Date(2025, 11, 31); // 31 декабря 2025
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        tourAvailabilities.push({
          tourId: tour._id || new mongoose.Types.ObjectId(),
          date: new Date(currentDate),
          availableSlots: Math.floor(Math.random() * 120) + 80, // 80-199 мест
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    const categories = [
      { name: 'Пляжный отдых', description: 'Отдых на море и пляжах' },
      { name: 'Экскурсии', description: 'Познавательные туры' },
      { name: 'Активный отдых', description: 'Спорт и приключения' },
      { name: 'Оздоровление', description: 'Спа и санатории' },
    ];

    const restaurants = [];
    const restaurantNames = ['Ресторан "Крым"', 'Морская кухня', 'Таверна "Черноморье"', 'Кафе "Солнечный берег"', 'Ресторан "Горный воздух"', 
                            'Бистро "Прибой"', 'Кафе "Лазурь"', 'Ресторан "Севастопольская гавань"', 'Трактир "Крымская ночь"', 
                            'Кафе "Ялтинский закат"', 'Ресторан "Феодосийский порт"', 'Бар "Керченский маяк"', 'Кафе "Алуштинские горы"', 
                            'Таверна "Судакская крепость"', 'Ресторан "Бахчисарайский дворик"'];
    for (let i = 0; i < 15; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      restaurants.push({
        name: restaurantNames[i],
        location: { region: region.name, coordinates: { lat: region.coordinates.lat, lng: region.coordinates.lng } },
        cuisine: ['Русская', 'Морская', 'Крымскотатарская', 'Европейская'][Math.floor(Math.random() * 4)],
        rating: (Math.random() * 0.7 + 3.8).toFixed(1),
        description: `Уютное заведение в ${region.name} с блюдами ${['Русской', 'Морской', 'Крымскотатарской', 'Европейской'][Math.floor(Math.random() * 4)]} кухни и прекрасным видом.`
      });
    }

    const posts = [];
    for (let i = 0; i < 10; i++) {
      const user = savedUsers[Math.floor(Math.random() * savedUsers.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      posts.push({
        author: user._id,
        region: region.name,
        title: `Путешествие в ${region.name} - Пост ${i + 1}`,
        content: `Пост пользователя ${i + 1} о путешествии в Крым`,
        createdAt: new Date(2025, 5, Math.floor(Math.random() * 20) + 1),
        likes: [],
        comments: [{ 
          user: new mongoose.Types.ObjectId(),
          content: 'Комментарий',
          createdAt: new Date()
        }],
      });
    }

    const reviews = [];
    for (let i = 0; i < 10; i++) {
      const user = savedUsers[Math.floor(Math.random() * savedUsers.length)];
      const tour = tours[Math.floor(Math.random() * tours.length)];
      reviews.push({
        userId: user._id,
        tourId: tour._id || new mongoose.Types.ObjectId(),
        hotelId: [
          '685446299e681b9d988414c1', '685446299e681b9d988414c2', '685446299e681b9d988414c3',
          '685446299e681b9d988414c4', '685446299e681b9d988414c5', '685446299e681b9d988414c6',
          '685446299e681b9d988414c7', '685446299e681b9d988414c8', '685446299e681b9d988414c9',
          '685446299e681b9d988414ca', '685446299e681b9d988414cb', '685446299e681b9d988414cc',
          '685446299e681b9d988414cd', '685446299e681b9d988414ce', '685446299e681b9d988414cf',
          '685446299e681b9d988414d0', '685446299e681b9d988414d1', '685446299e681b9d988414d2',
          '685446299e681b9d988414d3', '685446299e681b9d988414d4', '685446299e681b9d988414d5',
          '685446299e681b9d98841510', '685446299e681b9d98841511', '685446299e681b9d98841512',
          '685446299e681b9d98841513', '685446299e681b9d98841514', '685446299e681b9d98841515',
          '685446299e681b9d98841516', '685446299e681b9d98841517', '685446299e681b9d98841518',
          '685446299e681b9d98841519', '685446299e681b9d9884151a', '685446299e681b9d9884151b',
          '685446299e681b9d9884151c', '685446299e681b9d9884151d', '685446299e681b9d9884151e',
          '685446299e681b9d9884151f', '685446299e681b9d98841520', '685446299e681b9d98841521',
          '685446299e681b9d98841522', '685446299e681b9d98841523'
        ][Math.floor(Math.random() * 40)],
        rating: Math.floor(Math.random() * 5) + 1,
        title: `Отзыв ${i + 1} о ${tour.location.region}`,
        comment: `Отзыв ${i + 1} о туре или отеле`,
        visitDate: new Date(2025, 5, Math.floor(Math.random() * 20) + 1),
        createdAt: new Date(2025, 5, Math.floor(Math.random() * 20) + 1),
      });
    }

    const userAchievements = [];
    savedUsers.forEach(user => {
      achievements.forEach(achievement => {
        if (Math.random() > 0.3) {
          userAchievements.push({
            user: user._id,
            achievement: achievement._id,
            awardedAt: new Date(2025, 5, Math.floor(Math.random() * 20) + 1),
          });
        }
      });
    });

    // Вставка данных
    await Promise.all([
      Region.insertMany(regions),
      Category.insertMany(categories),
      Restaurant.insertMany(restaurants),
      Tour.insertMany(tours),
      Booking.insertMany(bookings),
      HotelAvailability.insertMany(hotelAvailabilities),
      Availability.insertMany(tourAvailabilities),
      Post.insertMany(posts),
      Review.insertMany(reviews),
      UserAchievement.insertMany(userAchievements),
    ]);
    console.log('Данные успешно вставлены');
  } catch (err) {
    console.error('Ошибка вставки:', err);
  } finally {
    mongoose.connection.close();
  }
})();