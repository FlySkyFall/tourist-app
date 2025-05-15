const mongoose = require('mongoose');
const Achievement = require('./models/Achievement');
const Attraction = require('./models/Attraction');
const Availability = require('./models/Availability');
const Booking = require('./models/Booking');
const Category = require('./models/Category');
const Hotel = require('./models/Hotel');
const Post = require('./models/Post');
const Region = require('./models/Region');
const Restaurant = require('./models/Restaurant');
const Review = require('./models/Review');
const Tour = require('./models/Tour');
const User = require('./models/User');
const UserAchievement = require('./models/UserAchievement');

// Подключение к MongoDB
const mongoURI = 'mongodb://localhost:27017/tourism-krasnodar';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Подключено к MongoDB'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

// Данные для пользователей
const usersData = [
  {
    username: 'ivan_petrov',
    email: 'ivan.petrov@example.com',
    passwordHash: 'hashed_password_1',
    role: 'user',
    profile: { firstName: 'Иван', lastName: 'Петров', phone: '+79991234567', preferences: ['excursion', 'beach'] },
  },
  {
    username: 'anna_smirnova',
    email: 'anna.smirnova@example.com',
    passwordHash: 'hashed_password_2',
    role: 'user',
    profile: { firstName: 'Анна', lastName: 'Смирнова', phone: '+79997654321', preferences: ['health', 'cultural'] },
  },
  {
    username: 'admin',
    email: 'admin@example.com',
    passwordHash: 'hashed_password_admin',
    role: 'admin',
    profile: { firstName: 'Админ', lastName: 'Крым', phone: '+79990000000', preferences: [] },
  },
  {
    username: 'maria_ivanova',
    email: 'maria.ivanova@example.com',
    passwordHash: 'hashed_password_3',
    role: 'user',
    profile: { firstName: 'Мария', lastName: 'Иванова', phone: '+79991112233', preferences: ['active', 'camping'] },
  },
  {
    username: 'dmitry_kuznetsov',
    email: 'dmitry.kuznetsov@example.com',
    passwordHash: 'hashed_password_4',
    role: 'user',
    profile: { firstName: 'Дмитрий', lastName: 'Кузнецов', phone: '+79993334455', preferences: ['excursion', 'historical'] },
  },
  {
    username: 'elena_sokolova',
    email: 'elena.sokolova@example.com',
    passwordHash: 'hashed_password_5',
    role: 'user',
    profile: { firstName: 'Елена', lastName: 'Соколова', phone: '+79995556677', preferences: ['passive', 'beach'] },
  },
  {
    username: 'alexey_morozov',
    email: 'alexey.morozov@example.com',
    passwordHash: 'hashed_password_6',
    role: 'user',
    profile: { firstName: 'Алексей', lastName: 'Морозов', phone: '+79997778899', preferences: ['active', 'health'] },
  },
  {
    username: 'olga_popova',
    email: 'olga.popova@example.com',
    passwordHash: 'hashed_password_7',
    role: 'user',
    profile: { firstName: 'Ольга', lastName: 'Попова', phone: '+79998889900', preferences: ['cultural', 'excursion'] },
  },
  {
    username: 'sergey_volkov',
    email: 'sergey.volkov@example.com',
    passwordHash: 'hashed_password_8',
    role: 'user',
    profile: { firstName: 'Сергей', lastName: 'Волков', phone: '+79990001122', preferences: ['camping', 'active'] },
  },
  {
    username: 'natalia_kovaleva',
    email: 'natalia.kovaleva@example.com',
    passwordHash: 'hashed_password_9',
    role: 'user',
    profile: { firstName: 'Наталья', lastName: 'Ковалёва', phone: '+79992223344', preferences: ['health', 'passive'] },
  },
  {
    username: 'pavel_zaitsev',
    email: 'pavel.zaitsev@example.com',
    passwordHash: 'hashed_password_10',
    role: 'user',
    profile: { firstName: 'Павел', lastName: 'Зайцев', phone: '+79994445566', preferences: ['excursion', 'beach'] },
  },
  {
    username: 'svetlana_fedorova',
    email: 'svetlana.fedorova@example.com',
    passwordHash: 'hashed_password_11',
    role: 'user',
    profile: { firstName: 'Светлана', lastName: 'Фёдорова', phone: '+79996667788', preferences: ['cultural', 'health'] },
  },
  {
    username: 'victor_egorov',
    email: 'victor.egorov@example.com',
    passwordHash: 'hashed_password_12',
    role: 'user',
    profile: { firstName: 'Виктор', lastName: 'Егоров', phone: '+79997778800', preferences: ['active', 'camping'] },
  },
  {
    username: 'yulia_mikhailova',
    email: 'yulia.mikhailova@example.com',
    passwordHash: 'hashed_password_13',
    role: 'user',
    profile: { firstName: 'Юлия', lastName: 'Михайлова', phone: '+79998889911', preferences: ['passive', 'beach'] },
  },
  {
    username: 'roman_antonov',
    email: 'roman.antonov@example.com',
    passwordHash: 'hashed_password_14',
    role: 'user',
    profile: { firstName: 'Роман', lastName: 'Антонов', phone: '+79990001133', preferences: ['excursion', 'historical'] },
  },
];

// Данные для достижений
const achievementsData = [
  { name: 'Новичок', description: 'Опубликовать первый пост', condition: 'create_post_1', icon: 'https://example.com/images/achievements/newbie.png' },
  { name: 'Исследователь', description: 'Забронировать первый тур', condition: 'book_tour_1', icon: 'https://example.com/images/achievements/explorer.png' },
  { name: 'Критик', description: 'Оставить первый отзыв', condition: 'write_review_1', icon: 'https://example.com/images/achievements/critic.png' },
  { name: 'Путешественник', description: 'Забронировать 3 тура', condition: 'book_tour_3', icon: 'https://example.com/images/achievements/traveler.png' },
  { name: 'Блогер', description: 'Опубликовать 5 постов', condition: 'create_post_5', icon: 'https://example.com/images/achievements/blogger.png' },
  { name: 'Эксперт', description: 'Оставить 3 отзыва', condition: 'write_review_3', icon: 'https://example.com/images/achievements/expert.png' },
  { name: 'Активный турист', description: 'Участвовать в активном туре', condition: 'join_active_tour', icon: 'https://example.com/images/achievements/active.png' },
];

// Данные для регионов
const regionsData = [
  {
    name: 'Ялта',
    description: 'Жемчужина Южного берега Крыма с мягким климатом и живописными горами. Известна Ливадийским дворцом и горой Ай-Петри.',
    attractions: ['Ливадийский дворец', 'Гора Ай-Петри', 'Массандровский винзавод'],
    climate: 'Средиземноморский, тёплое лето (+30°C), мягкая зима (+5°C).',
    bestSeason: 'Май–Сентябрь',
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    coordinates: { lat: 44.4952, lng: 34.1663 },
  },
  {
    name: 'Севастополь',
    description: 'Город-герой с богатой историей. Известен Херсонесом Таврическим и музеем-панорамой.',
    attractions: ['Херсонес Таврический', 'Панорама Обороны', 'Мыс Фиолент'],
    climate: 'Умеренный, жаркое лето (+28°C), прохладная зима (+3°C).',
    bestSeason: 'Апрель–Октябрь',
    images: ['https://commons.wikimedia.org/wiki/File:Chersonesos_Sevastopol.jpg'],
    coordinates: { lat: 44.6167, lng: 33.5254 },
  },
  {
    name: 'Феодосия',
    description: 'Древний город с золотыми пляжами и галереей Айвазовского. Идеален для семейного отдыха.',
    attractions: ['Галерея Айвазовского', 'Кара-Даг', 'Генуэзская крепость'],
    climate: 'Тёплое лето (+29°C), мягкая зима (+4°C).',
    bestSeason: 'Июнь–Сентябрь',
    images: ['https://commons.wikimedia.org/wiki/File:Feodosia_Aivazovsky_Gallery.jpg'],
    coordinates: { lat: 45.0319, lng: 35.3824 },
  },
  {
    name: 'Алушта',
    description: 'Курортный город между горами и морем. Популярен для активного отдыха и пляжного туризма.',
    attractions: ['Гора Демерджи', 'Долина Привидений', 'Алуштинский аквариум'],
    climate: 'Тёплое лето (+28°C), мягкая зима (+5°C).',
    bestSeason: 'Май–Октябрь',
    images: ['https://commons.wikimedia.org/wiki/File:Alushta_Beach.jpg'],
    coordinates: { lat: 44.6764, lng: 34.4108 },
  },
  {
    name: 'Симферополь',
    description: 'Столица Крыма, центр культурной и деловой жизни. Известен историческими музеями.',
    attractions: ['Неаполь Скифский', 'Музей Тавриды', 'Парк Гагарина'],
    climate: 'Континентальный, жаркое лето (+30°C), холодная зима (0°C).',
    bestSeason: 'Апрель–Октябрь',
    images: ['https://commons.wikimedia.org/wiki/File:Simferopol_Center.jpg'],
    coordinates: { lat: 44.9471, lng: 34.1042 },
  },
  {
    name: 'Керчь',
    description: 'Город с античной историей на востоке Крыма. Известен Аджимушкайскими каменоломнями.',
    attractions: ['Гора Митридат', 'Царский курган', 'Аджимушкайские каменоломни'],
    climate: 'Тёплое лето (+29°C), мягкая зима (+3°C).',
    bestSeason: 'Май–Сентябрь',
    images: ['https://commons.wikimedia.org/wiki/File:Kerch_Mithridates.jpg'],
    coordinates: { lat: 45.3505, lng: 36.4684 },
  },
];

// Данные для отелей
const hotelsData = [
  {
    name: 'Villa Elena Hotel & Residences',
    description: 'Роскошный 5-звёздочный отель в Ялте с видом на море и спа-центром.',
    location: { region: 'Ялта', coordinates: { lat: 44.4935, lng: 34.1598 } },
    rating: 4.8,
    amenities: ['Wi-Fi', 'Спа', 'Бассейн', 'Ресторан', 'Фитнес-центр', 'Парковка'],
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    website: 'https://www.villaelena.ru',
    capacity: 100,
    reviews: [{ userId: null, rating: 5, comment: 'Великолепный отель!', createdAt: new Date('2025-04-01') }],
  },
  {
    name: 'Mriya Resort & Spa',
    description: 'Курортный комплекс в Ялте с аквапарком и медицинским центром.',
    location: { region: 'Ялта', coordinates: { lat: 44.3987, lng: 33.9524 } },
    rating: 4.9,
    amenities: ['Wi-Fi', 'Аквапарк', 'Спа', 'Бассейн', 'Ресторан', 'Пляж'],
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    website: 'https://mriyaresort.com',
    capacity: 400,
    reviews: [{ userId: null, rating: 5, comment: 'Идеально для семей!', createdAt: new Date('2025-03-15') }],
  },
  {
    name: 'Bristol Hotel',
    description: 'Уютный отель в центре Ялты с рестораном местной кухни.',
    location: { region: 'Ялта', coordinates: { lat: 44.4942, lng: 34.1668 } },
    rating: 4.5,
    amenities: ['Wi-Fi', 'Ресторан', 'Спа', 'Парковка', 'Кондиционер'],
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    website: 'https://bristol-yalta.ru',
    capacity: 150,
    reviews: [{ userId: null, rating: 4, comment: 'Хороший отель, но шумно.', createdAt: new Date('2025-02-20') }],
  },
  {
    name: 'Riviera Sunrise Resort & Spa',
    description: 'Современный отель в Алуште с собственным пляжем и спа.',
    location: { region: 'Алушта', coordinates: { lat: 44.6712, lng: 34.4087 } },
    rating: 4.7,
    amenities: ['Wi-Fi', 'Спа', 'Бассейн', 'Ресторан', 'Пляж', 'Фитнес-центр'],
    images: ['https://commons.wikimedia.org/wiki/File:Alushta_Beach.jpg'],
    website: 'https://rivierasunrise.ru',
    capacity: 200,
    reviews: [{ userId: null, rating: 5, comment: 'Отличный пляж!', createdAt: new Date('2025-04-10') }],
  },
  {
    name: 'Palmira Palace',
    description: 'Элегантный курорт в Ялте с оздоровительными программами.',
    location: { region: 'Ялта', coordinates: { lat: 44.4365, lng: 34.1352 } },
    rating: 4.8,
    amenities: ['Wi-Fi', 'Спа', 'Бассейн', 'Ресторан', 'Фитнес-центр', 'Пляж'],
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    website: 'https://palmira-palace.ru',
    capacity: 250,
    reviews: [{ userId: null, rating: 5, comment: 'Спа на высоте!', createdAt: new Date('2025-03-20') }],
  },
  {
    name: 'Aquamarine Resort & Spa',
    description: 'Современный отель в Севастополе с аквапарком и спа.',
    location: { region: 'Севастополь', coordinates: { lat: 44.6023, lng: 33.4967 } },
    rating: 4.6,
    amenities: ['Wi-Fi', 'Аквапарк', 'Спа', 'Бассейн', 'Ресторан', 'Пляж'],
    images: ['https://commons.wikimedia.org/wiki/File:Chersonesos_Sevastopol.jpg'],
    website: 'https://aquamarine-resort.ru',
    capacity: 300,
    reviews: [{ userId: null, rating: 4, comment: 'Хороший сервис.', createdAt: new Date('2025-03-05') }],
  },
  {
    name: 'Oreanda Premier Hotel',
    description: 'Исторический отель в Ялте с видом на набережную.',
    location: { region: 'Ялта', coordinates: { lat: 44.4968, lng: 34.1689 } },
    rating: 4.7,
    amenities: ['Wi-Fi', 'Ресторан', 'Спа', 'Бассейн', 'Парковка'],
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    website: 'https://oreanda-hotel.ru',
    capacity: 120,
    reviews: [{ userId: null, rating: 5, comment: 'Классика и комфорт.', createdAt: new Date('2025-04-15') }],
  },
  {
    name: 'Fiolent Hotel',
    description: 'Уютный отель на мысе Фиолент в Севастополе.',
    location: { region: 'Севастополь', coordinates: { lat: 44.5132, lng: 33.4756 } },
    rating: 4.4,
    amenities: ['Wi-Fi', 'Ресторан', 'Парковка', 'Пляж'],
    images: ['https://commons.wikimedia.org/wiki/File:Fiolent_Sevastopol.jpg'],
    website: 'https://fiolent-hotel.ru',
    capacity: 80,
    reviews: [{ userId: null, rating: 4, comment: 'Тихое место.', createdAt: new Date('2025-02-25') }],
  },
  {
    name: 'Krym Hotel',
    description: 'Бюджетный отель в Симферополе для деловых поездок.',
    location: { region: 'Симферополь', coordinates: { lat: 44.9492, lng: 34.1035 } },
    rating: 4.2,
    amenities: ['Wi-Fi', 'Ресторан', 'Парковка', 'Кондиционер'],
    images: ['https://commons.wikimedia.org/wiki/File:Simferopol_Center.jpg'],
    website: 'https://krym-hotel.ru',
    capacity: 100,
    reviews: [{ userId: null, rating: 4, comment: 'Удобно для командировок.', createdAt: new Date('2025-03-10') }],
  },
  {
    name: 'Kerch Panorama',
    description: 'Современный отель в Керчи с видом на море.',
    location: { region: 'Керчь', coordinates: { lat: 45.3521, lng: 36.4702 } },
    rating: 4.5,
    amenities: ['Wi-Fi', 'Ресторан', 'Парковка', 'Пляж'],
    images: ['https://commons.wikimedia.org/wiki/File:Kerch_Mithridates.jpg'],
    website: 'https://kerch-panorama.ru',
    capacity: 90,
    reviews: [{ userId: null, rating: 4, comment: 'Красивый вид.', createdAt: new Date('2025-04-05') }],
  },
  {
    name: 'Golden Resort',
    description: 'Семейный отель в Алуште с анимацией для детей.',
    location: { region: 'Алушта', coordinates: { lat: 44.6789, lng: 34.4123 } },
    rating: 4.6,
    amenities: ['Wi-Fi', 'Бассейн', 'Ресторан', 'Детский клуб', 'Пляж'],
    images: ['https://commons.wikimedia.org/wiki/File:Alushta_Beach.jpg'],
    website: 'https://golden-resort.ru',
    capacity: 150,
    reviews: [{ userId: null, rating: 5, comment: 'Дети в восторге!', createdAt: new Date('2025-04-20') }],
  },
  {
    name: 'Feodosia Grand',
    description: 'Комфортабельный отель в Феодосии рядом с пляжем.',
    location: { region: 'Феодосия', coordinates: { lat: 45.0332, lng: 35.3845 } },
    rating: 4.5,
    amenities: ['Wi-Fi', 'Ресторан', 'Бассейн', 'Пляж'],
    images: ['https://commons.wikimedia.org/wiki/File:Feodosia_Aivazovsky_Gallery.jpg'],
    website: 'https://feodosia-grand.ru',
    capacity: 130,
    reviews: [{ userId: null, rating: 4, comment: 'Удобное расположение.', createdAt: new Date('2025-03-25') }],
  },
];

// Данные для достопримечательностей
const attractionsData = [
  {
    name: 'Ливадийский дворец',
    description: 'Бывшая резиденция российских императоров в Ялте.',
    location: { region: 'Ялта', coordinates: { type: 'Point', coordinates: [34.1431, 44.4679] } },
    category: 'historical',
    images: ['https://commons.wikimedia.org/wiki/File:Livadia_Palace_Yalta.jpg'],
    website: 'http://livadia-palace.ru',
  },
  {
    name: 'Гора Ай-Петри',
    description: 'Живописная гора с потрясающим видом на Ялту.',
    location: { region: 'Ялта', coordinates: { type: 'Point', coordinates: [34.0517, 44.4509] } },
    category: 'natural',
    images: ['https://commons.wikimedia.org/wiki/File:Ay-Petri_Peak.jpg'],
  },
  {
    name: 'Херсонес Таврический',
    description: 'Античный город в Севастополе, объект ЮНЕСКО.',
    location: { region: 'Севастополь', coordinates: { type: 'Point', coordinates: [33.4933, 44.6112] } },
    category: 'historical',
    images: ['https://commons.wikimedia.org/wiki/File:Chersonesos_Taurica.jpg'],
    website: 'http://chersonesos-sev.ru',
  },
  {
    name: 'Никитский ботанический сад',
    description: 'Один из старейших ботанических садов мира в Ялте.',
    location: { region: 'Ялта', coordinates: { type: 'Point', coordinates: [34.2315, 44.5112] } },
    category: 'natural',
    images: ['https://commons.wikimedia.org/wiki/File:Nikitsky_Botanical_Garden.jpg'],
    website: 'http://nikitasad.ru',
  },
  {
    name: 'Генуэзская крепость',
    description: 'Средневековая крепость в Феодосии.',
    location: { region: 'Феодосия', coordinates: { type: 'Point', coordinates: [35.3956, 45.0234] } },
    category: 'historical',
    images: ['https://commons.wikimedia.org/wiki/File:Genuezskaya_Fortress.jpg'],
  },
  {
    name: 'Кара-Даг',
    description: 'Вулканический массив и заповедник в Феодосии.',
    location: { region: 'Феодосия', coordinates: { type: 'Point', coordinates: [35.2301, 44.9335] } },
    category: 'natural',
    images: ['https://commons.wikimedia.org/wiki/File:Kara-Dag_Feodosia.jpg'],
  },
  {
    name: 'Воронцовский дворец',
    description: 'Архитектурный шедевр в Алуште.',
    location: { region: 'Алушта', coordinates: { type: 'Point', coordinates: [34.3412, 44.4198] } },
    category: 'historical',
    images: ['https://commons.wikimedia.org/wiki/File:Vorontsov_Palace.jpg'],
  },
  {
    name: 'Мыс Фиолент',
    description: 'Живописный мыс с кристально чистым морем.',
    location: { region: 'Севастополь', coordinates: { type: 'Point', coordinates: [33.4756, 44.5132] } },
    category: 'natural',
    images: ['https://commons.wikimedia.org/wiki/File:Fiolent_Sevastopol.jpg'],
  },
  {
    name: 'Аджимушкайские каменоломни',
    description: 'Подземный музей в Керчи, посвящённый Великой Отечественной войне.',
    location: { region: 'Керчь', coordinates: { type: 'Point', coordinates: [36.4556, 45.3467] } },
    category: 'historical',
    images: ['https://commons.wikimedia.org/wiki/File:Adzhimushkay_Kerch.jpg'],
  },
  {
    name: 'Гора Демерджи',
    description: 'Гора в Алуште с уникальной Долиной Привидений.',
    location: { region: 'Алушта', coordinates: { type: 'Point', coordinates: [34.4012, 44.7512] } },
    category: 'natural',
    images: ['https://commons.wikimedia.org/wiki/File:Demerdzhi_Alushta.jpg'],
  },
  {
    name: 'Массандровский дворец',
    description: 'Дворец Александра III в Ялте.',
    location: { region: 'Ялта', coordinates: { type: 'Point', coordinates: [34.2034, 44.5167] } },
    category: 'historical',
    images: ['https://commons.wikimedia.org/wiki/File:Massandra_Palace.jpg'],
  },
  {
    name: 'Царский курган',
    description: 'Античный памятник в Керчи.',
    location: { region: 'Керчь', coordinates: { type: 'Point', coordinates: [36.4689, 45.3534] } },
    category: 'historical',
    images: ['https://commons.wikimedia.org/wiki/File:Tsarsky_Kurgan_Kerch.jpg'],
  },
  {
    name: 'Неаполь Скифский',
    description: 'Археологический заповедник в Симферополе.',
    location: { region: 'Симферополь', coordinates: { type: 'Point', coordinates: [34.1023, 44.9456] } },
    category: 'historical',
    images: ['https://commons.wikimedia.org/wiki/File:Neapolis_Scythian.jpg'],
  },
  {
    name: 'Галерея Айвазовского',
    description: 'Музей знаменитого художника в Феодосии.',
    location: { region: 'Феодосия', coordinates: { type: 'Point', coordinates: [35.3821, 45.0312] } },
    category: 'cultural',
    images: ['https://commons.wikimedia.org/wiki/File:Aivazovsky_Gallery.jpg'],
  },
  {
    name: 'Панорама Обороны Севастополя',
    description: 'Музей, посвящённый обороне Севастополя 1854–1855 гг.',
    location: { region: 'Севастополь', coordinates: { type: 'Point', coordinates: [33.5245, 44.6156] } },
    category: 'historical',
    images: ['https://commons.wikimedia.org/wiki/File:Panorama_Sevastopol.jpg'],
  },
];

// Данные для ресторанов
const restaurantsData = [
  {
    name: 'Винный парк',
    description: 'Ресторан в Ялте с крымской и европейской кухней.',
    location: { region: 'Ялта', coordinates: { lat: 44.5067, lng: 34.1645 } },
    cuisine: 'Европейская, Крымская',
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    website: 'https://winepark.ru',
    reviews: [{ userId: null, rating: 5, comment: 'Потрясающий выбор вин!', createdAt: new Date('2025-04-10') }],
  },
  {
    name: 'Парус',
    description: 'Ресторан в Севастополе с морепродуктами.',
    location: { region: 'Севастополь', coordinates: { lat: 44.6158, lng: 33.5247 } },
    cuisine: 'Морская, Крымско-татарская',
    images: ['https://commons.wikimedia.org/wiki/File:Chersonesos_Sevastopol.jpg'],
    website: 'https://parus-sevastopol.ru',
    reviews: [{ userId: null, rating: 4, comment: 'Вкусные морепродукты.', createdAt: new Date('2025-03-20') }],
  },
  {
    name: 'Чайка',
    description: 'Ресторан на набережной Ялты с живой музыкой.',
    location: { region: 'Ялта', coordinates: { lat: 44.4978, lng: 34.1692 } },
    cuisine: 'Европейская',
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    website: 'https://chaika-yalta.ru',
    reviews: [{ userId: null, rating: 4, comment: 'Атмосферное место.', createdAt: new Date('2025-04-05') }],
  },
  {
    name: 'Дюльбер',
    description: 'Ресторан в Ялте с крымско-татарской кухней.',
    location: { region: 'Ялта', coordinates: { lat: 44.4356, lng: 34.1345 } },
    cuisine: 'Крымско-татарская',
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    website: 'https://dyulber.ru',
    reviews: [{ userId: null, rating: 5, comment: 'Вкуснейший плов!', createdAt: new Date('2025-03-15') }],
  },
  {
    name: 'Океан',
    description: 'Ресторан морепродуктов в Феодосии.',
    location: { region: 'Феодосия', coordinates: { lat: 45.0321, lng: 35.3834 } },
    cuisine: 'Морская',
    images: ['https://commons.wikimedia.org/wiki/File:Feodosia_Aivazovsky_Gallery.jpg'],
    website: 'https://okean-feodosia.ru',
    reviews: [{ userId: null, rating: 4, comment: 'Свежие устрицы.', createdAt: new Date('2025-04-01') }],
  },
  {
    name: 'Казбек',
    description: 'Ресторан в Алуште с кавказской кухней.',
    location: { region: 'Алушта', coordinates: { lat: 44.6778, lng: 34.4112 } },
    cuisine: 'Кавказская',
    images: ['https://commons.wikimedia.org/wiki/File:Alushta_Beach.jpg'],
    website: 'https://kazbek-alushta.ru',
    reviews: [{ userId: null, rating: 5, comment: 'Шашлык отменный!', createdAt: new Date('2025-03-25') }],
  },
  {
    name: 'Таврида',
    description: 'Ресторан в Симферополе с местной кухней.',
    location: { region: 'Симферополь', coordinates: { lat: 44.9489, lng: 34.1056 } },
    cuisine: 'Крымская',
    images: ['https://commons.wikimedia.org/wiki/File:Simferopol_Center.jpg'],
    website: 'https://tavrida-simferopol.ru',
    reviews: [{ userId: null, rating: 4, comment: 'Хорошая кухня.', createdAt: new Date('2025-03-10') }],
  },
  {
    name: 'Митридат',
    description: 'Ресторан в Керчи с видом на море.',
    location: { region: 'Керчь', coordinates: { lat: 45.3512, lng: 36.4698 } },
    cuisine: 'Европейская, Морская',
    images: ['https://commons.wikimedia.org/wiki/File:Kerch_Mithridates.jpg'],
    website: 'https://mithridat-kerch.ru',
    reviews: [{ userId: null, rating: 5, comment: 'Вид потрясающий!', createdAt: new Date('2025-04-15') }],
  },
  {
    name: 'Лагуна',
    description: 'Ресторан в Севастополе с морской кухней.',
    location: { region: 'Севастополь', coordinates: { lat: 44.6145, lng: 33.5267 } },
    cuisine: 'Морская',
    images: ['https://commons.wikimedia.org/wiki/File:Chersonesos_Sevastopol.jpg'],
    website: 'https://laguna-sevastopol.ru',
    reviews: [{ userId: null, rating: 4, comment: 'Хороший выбор блюд.', createdAt: new Date('2025-03-05') }],
  },
  {
    name: 'Золотой берег',
    description: 'Ресторан в Феодосии с европейской кухней.',
    location: { region: 'Феодосия', coordinates: { lat: 45.0345, lng: 35.3856 } },
    cuisine: 'Европейская',
    images: ['https://commons.wikimedia.org/wiki/File:Feodosia_Aivazovsky_Gallery.jpg'],
    website: 'https://zolotoy-bereg.ru',
    reviews: [{ userId: null, rating: 4, comment: 'Уютная атмосфера.', createdAt: new Date('2025-04-20') }],
  },
];

// Данные для категорий
const categoriesData = [
  { name: 'Пляжный отдых', description: 'Туры для любителей моря.', icon: 'https://example.com/icons/beach.png', subcategories: ['Ялта', 'Феодосия'] },
  { name: 'Горные походы', description: 'Активные туры по горам.', icon: 'https://example.com/icons/mountain.png', subcategories: ['Ялта', 'Алушта'] },
  { name: 'Исторические экскурсии', description: 'Экскурсии по историческим местам.', icon: 'https://example.com/icons/history.png', subcategories: ['Севастополь', 'Ялта'] },
  { name: 'Винные туры', description: 'Дегустации крымских вин.', icon: 'https://example.com/icons/wine.png', subcategories: ['Ялта', 'Феодосия'] },
  { name: 'Оздоровительный отдых', description: 'Спа и детокс-программы.', icon: 'https://example.com/icons/spa.png', subcategories: ['Ялта', 'Алушта'] },
  { name: 'Кемпинг', description: 'Туры с ночёвкой в палатках.', icon: 'https://example.com/icons/camping.png', subcategories: ['Алушта', 'Феодосия'] },
  { name: 'Культурные туры', description: 'Посещение музеев и галерей.', icon: 'https://example.com/icons/culture.png', subcategories: ['Феодосия', 'Севастополь'] },
  { name: 'Морские прогулки', description: 'Яхты и катера.', icon: 'https://example.com/icons/boat.png', subcategories: ['Ялта', 'Севастополь'] },
  { name: 'Гастрономические туры', description: 'Кулинарные мастер-классы.', icon: 'https://example.com/icons/food.png', subcategories: ['Ялта', 'Симферополь'] },
  { name: 'Приключенческие туры', description: 'Экстремальный отдых.', icon: 'https://example.com/icons/adventure.png', subcategories: ['Алушта', 'Керчь'] },
];

// Данные для туров
const toursData = [
  {
    title: 'Экскурсия по дворцам Южного берега',
    description: 'Посещение Ливадийского, Воронцовского и Массандровского дворцов.',
    type: 'excursion',
    durationDays: 1,
    price: 5000,
    location: { region: 'Ялта', coordinates: { lat: 44.4952, lng: 34.1663 } },
    accommodation: { hotel: null, type: 'none', amenities: [] },
    activities: [
      { name: 'Ливадийский дворец', description: 'Экскурсия по залам.', durationHours: 2, equipmentRequired: false },
      { name: 'Воронцовский дворец', description: 'Осмотр архитектуры.', durationHours: 2, equipmentRequired: false },
    ],
    excursions: [{ name: 'Массандровский дворец', description: 'Дегустация вин.', durationHours: 1.5, price: 1000 }],
    includedServices: ['Трансфер', 'Гид', 'Обед', 'Входные билеты'],
    season: { start: new Date('2025-05-01'), end: new Date('2025-09-30') },
    minGroupSize: 5,
    maxGroupSize: 20,
    images: ['https://commons.wikimedia.org/wiki/File:Livadia_Palace_Yalta.jpg'],
    isFeatured: true,
    reviews: [{ userId: null, rating: 5, comment: 'Насыщенная экскурсия!', createdAt: new Date('2025-04-15') }],
  },
  {
    title: 'Поход на Ай-Петри',
    description: 'Однодневный поход на вершину Ай-Петри.',
    type: 'active',
    durationDays: 1,
    price: 3500,
    location: { region: 'Ялта', coordinates: { lat: 44.4509, lng: 34.0517 } },
    accommodation: { hotel: null, type: 'none', amenities: [] },
    activities: [
      { name: 'Подъём на канатной дороге', description: 'Вид на побережье.', durationHours: 1, equipmentRequired: false },
      { name: 'Поход по тропам', description: 'Пеший маршрут.', durationHours: 3, equipmentRequired: true },
    ],
    excursions: [],
    includedServices: ['Гид', 'Перекус', 'Билет на канатную дорогу'],
    season: { start: new Date('2025-04-01'), end: new Date('2025-10-31') },
    minGroupSize: 4,
    maxGroupSize: 15,
    images: ['https://commons.wikimedia.org/wiki/File:Ay-Petri_Peak.jpg'],
    isFeatured: false,
    reviews: [],
  },
  {
    title: 'Оздоровительный тур в Mriya Resort',
    description: 'Недельный тур с детоксом и спа в Mriya Resort.',
    type: 'health',
    durationDays: 7,
    price: 70000,
    location: { region: 'Ялта', coordinates: { lat: 44.3987, lng: 33.9524 } },
    accommodation: { hotel: null, type: 'hotel', amenities: ['Спа', 'Бассейн', 'Фитнес-центр'] },
    activities: [
      { name: 'Спа-процедуры', description: 'Массажи и гидротерапия.', durationHours: 2, equipmentRequired: false },
      { name: 'Йога', description: 'Утренние занятия.', durationHours: 1, equipmentRequired: true },
    ],
    excursions: [{ name: 'Никитский сад', description: 'Прогулка по саду.', durationHours: 2, price: 1500 }],
    includedServices: ['Проживание', 'Питание', 'Трансфер', 'Спа'],
    season: { start: new Date('2025-01-01'), end: new Date('2025-12-31') },
    minGroupSize: 2,
    maxGroupSize: 10,
    hotelCapacity: 20,
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    isFeatured: true,
    reviews: [{ userId: null, rating: 5, comment: 'Спа на высоте!', createdAt: new Date('2025-03-10') }],
  },
  {
    title: 'Пляжный отдых в Феодосии',
    description: 'Недельный отдых на золотых пляжах Феодосии.',
    type: 'passive',
    durationDays: 7,
    price: 45000,
    location: { region: 'Феодосия', coordinates: { lat: 45.0319, lng: 35.3824 } },
    accommodation: { hotel: null, type: 'hotel', amenities: ['Бассейн', 'Пляж', 'Ресторан'] },
    activities: [
      { name: 'Пляжный отдых', description: 'Релакс на море.', durationHours: 24, equipmentRequired: false },
    ],
    excursions: [{ name: 'Галерея Айвазовского', description: 'Экскурсия в музей.', durationHours: 1.5, price: 800 }],
    includedServices: ['Проживание', 'Завтраки', 'Трансфер'],
    season: { start: new Date('2025-06-01'), end: new Date('2025-09-30') },
    minGroupSize: 1,
    maxGroupSize: 10,
    hotelCapacity: 30,
    images: ['https://commons.wikimedia.org/wiki/File:Feodosia_Aivazovsky_Gallery.jpg'],
    isFeatured: true,
    reviews: [{ userId: null, rating: 4, comment: 'Отличный пляж!', createdAt: new Date('2025-04-20') }],
  },
  {
    title: 'Кемпинг в Кара-Даге',
    description: 'Трёхдневный кемпинг в заповеднике Кара-Даг.',
    type: 'camping',
    durationDays: 3,
    price: 15000,
    location: { region: 'Феодосия', coordinates: { lat: 44.9335, lng: 35.2301 } },
    accommodation: { hotel: null, type: 'camping', amenities: ['Палатки', 'Костёр'] },
    activities: [
      { name: 'Поход по заповеднику', description: 'Тrekking.', durationHours: 5, equipmentRequired: true },
      { name: 'Ночёвка в палатках', description: 'Кемпинг.', durationHours: 12, equipmentRequired: true },
    ],
    excursions: [],
    includedServices: ['Гид', 'Питание', 'Снаряжение'],
    season: { start: new Date('2025-05-01'), end: new Date('2025-09-30') },
    minGroupSize: 4,
    maxGroupSize: 12,
    hotelCapacity: 12,
    images: ['https://commons.wikimedia.org/wiki/File:Kara-Dag_Feodosia.jpg'],
    isFeatured: false,
    reviews: [{ userId: null, rating: 5, comment: 'Природа супер!', createdAt: new Date('2025-04-10') }],
  },
  {
    title: 'Винный тур по Массандре',
    description: 'Однодневный тур с дегустацией вин в Массандре.',
    type: 'excursion',
    durationDays: 1,
    price: 6000,
    location: { region: 'Ялта', coordinates: { lat: 44.5167, lng: 34.2034 } },
    accommodation: { hotel: null, type: 'none', amenities: [] },
    activities: [
      { name: 'Дегустация вин', description: 'Проба крымских вин.', durationHours: 2, equipmentRequired: false },
    ],
    excursions: [{ name: 'Массандровский дворец', description: 'Экскурсия.', durationHours: 1, price: 500 }],
    includedServices: ['Трансфер', 'Гид', 'Дегустация'],
    season: { start: new Date('2025-04-01'), end: new Date('2025-10-31') },
    minGroupSize: 5,
    maxGroupSize: 20,
    images: ['https://commons.wikimedia.org/wiki/File:Massandra_Palace.jpg'],
    isFeatured: true,
    reviews: [{ userId: null, rating: 5, comment: 'Вина отличные!', createdAt: new Date('2025-03-25') }],
  },
  {
    title: 'Исторический тур по Севастополю',
    description: 'Экскурсия по Херсонесу и Панораме.',
    type: 'excursion',
    durationDays: 1,
    price: 4500,
    location: { region: 'Севастополь', coordinates: { lat: 44.6112, lng: 33.4933 } },
    accommodation: { hotel: null, type: 'none', amenities: [] },
    activities: [
      { name: 'Херсонес', description: 'Античные руины.', durationHours: 2, equipmentRequired: false },
      { name: 'Панорама', description: 'Музей.', durationHours: 1.5, equipmentRequired: false },
    ],
    excursions: [],
    includedServices: ['Трансфер', 'Гид', 'Входные билеты'],
    season: { start: new Date('2025-04-01'), end: new Date('2025-10-31') },
    minGroupSize: 5,
    maxGroupSize: 20,
    images: ['https://commons.wikimedia.org/wiki/File:Chersonesos_Taurica.jpg'],
    isFeatured: true,
    reviews: [{ userId: null, rating: 5, comment: 'Очень познавательно!', createdAt: new Date('2025-04-05') }],
  },
  {
    title: 'Поход на Демерджи',
    description: 'Однодневный поход на гору Демерджи.',
    type: 'active',
    durationDays: 1,
    price: 4000,
    location: { region: 'Алушта', coordinates: { lat: 44.7512, lng: 34.4012 } },
    accommodation: { hotel: null, type: 'none', amenities: [] },
    activities: [
      { name: 'Поход по Долине Привидений', description: 'Тrekking.', durationHours: 4, equipmentRequired: true },
    ],
    excursions: [],
    includedServices: ['Гид', 'Перекус'],
    season: { start: new Date('2025-04-01'), end: new Date('2025-10-31') },
    minGroupSize: 4,
    maxGroupSize: 15,
    images: ['https://commons.wikimedia.org/wiki/File:Demerdzhi_Alushta.jpg'],
    isFeatured: false,
    reviews: [],
  },
  {
    title: 'Морская прогулка в Ялте',
    description: 'Прогулка на яхте вдоль побережья Ялты.',
    type: 'passive',
    durationDays: 1,
    price: 8000,
    location: { region: 'Ялта', coordinates: { lat: 44.4952, lng: 34.1663 } },
    accommodation: { hotel: null, type: 'none', amenities: [] },
    activities: [
      { name: 'Яхтенная прогулка', description: 'Осмотр побережья.', durationHours: 3, equipmentRequired: false },
    ],
    excursions: [],
    includedServices: ['Яхта', 'Капитан', 'Напитки'],
    season: { start: new Date('2025-05-01'), end: new Date('2025-09-30') },
    minGroupSize: 2,
    maxGroupSize: 10,
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    isFeatured: true,
    reviews: [{ userId: null, rating: 5, comment: 'Незабываемо!', createdAt: new Date('2025-04-15') }],
  },
  {
    title: 'Кемпинг на мысе Фиолент',
    description: 'Двухдневный кемпинг с видом на море.',
    type: 'camping',
    durationDays: 2,
    price: 12000,
    location: { region: 'Севастополь', coordinates: { lat: 44.5132, lng: 33.4756 } },
    accommodation: { hotel: null, type: 'camping', amenities: ['Палатки', 'Костёр'] },
    activities: [
      { name: 'Кемпинг', description: 'Ночёвка у моря.', durationHours: 12, equipmentRequired: true },
      { name: 'Поход к пляжу', description: 'Пеший маршрут.', durationHours: 2, equipmentRequired: true },
    ],
    excursions: [],
    includedServices: ['Гид', 'Питание', 'Снаряжение'],
    season: { start: new Date('2025-05-01'), end: new Date('2025-09-30') },
    minGroupSize: 4,
    maxGroupSize: 12,
    hotelCapacity: 12,
    images: ['https://commons.wikimedia.org/wiki/File:Fiolent_Sevastopol.jpg'],
    isFeatured: false,
    reviews: [{ userId: null, rating: 4, comment: 'Красивый вид!', createdAt: new Date('2025-04-10') }],
  },
  {
    title: 'Оздоровительный тур в Palmira Palace',
    description: 'Недельный тур с оздоровительными процедурами.',
    type: 'health',
    durationDays: 7,
    price: 65000,
    location: { region: 'Ялта', coordinates: { lat: 44.4365, lng: 34.1352 } },
    accommodation: { hotel: null, type: 'hotel', amenities: ['Спа', 'Бассейн', 'Фитнес-центр'] },
    activities: [
      { name: 'Спа-процедуры', description: 'Массажи.', durationHours: 2, equipmentRequired: false },
      { name: 'Фитнес', description: 'Занятия в зале.', durationHours: 1, equipmentRequired: true },
    ],
    excursions: [{ name: 'Ливадийский дворец', description: 'Экскурсия.', durationHours: 2, price: 1000 }],
    includedServices: ['Проживание', 'Питание', 'Трансфер', 'Спа'],
    season: { start: new Date('2025-01-01'), end: new Date('2025-12-31') },
    minGroupSize: 2,
    maxGroupSize: 10,
    hotelCapacity: 20,
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    isFeatured: true,
    reviews: [{ userId: null, rating: 5, comment: 'Полный релакс!', createdAt: new Date('2025-03-20') }],
  },
  {
    title: 'Экскурсия по Керчи',
    description: 'Посещение Аджимушкайских каменоломен и Царского кургана.',
    type: 'excursion',
    durationDays: 1,
    price: 4000,
    location: { region: 'Керчь', coordinates: { lat: 45.3505, lng: 36.4684 } },
    accommodation: { hotel: null, type: 'none', amenities: [] },
    activities: [
      { name: 'Аджимушкай', description: 'Подземный музей.', durationHours: 2, equipmentRequired: false },
      { name: 'Царский курган', description: 'Античный памятник.', durationHours: 1, equipmentRequired: false },
    ],
    excursions: [],
    includedServices: ['Трансфер', 'Гид', 'Входные билеты'],
    season: { start: new Date('2025-04-01'), end: new Date('2025-10-31') },
    minGroupSize: 5,
    maxGroupSize: 20,
    images: ['https://commons.wikimedia.org/wiki/File:Adzhimushkay_Kerch.jpg'],
    isFeatured: false,
    reviews: [{ userId: null, rating: 5, comment: 'История живая!', createdAt: new Date('2025-04-05') }],
  },
  {
    title: 'Винный тур по Феодосии',
    description: 'Дегустация вин и посещение Кара-Дага.',
    type: 'excursion',
    durationDays: 1,
    price: 5500,
    location: { region: 'Феодосия', coordinates: { lat: 44.9335, lng: 35.2301 } },
    accommodation: { hotel: null, type: 'none', amenities: [] },
    activities: [
      { name: 'Дегустация вин', description: 'Проба местных вин.', durationHours: 2, equipmentRequired: false },
    ],
    excursions: [{ name: 'Кара-Даг', description: 'Прогулка.', durationHours: 2, price: 700 }],
    includedServices: ['Трансфер', 'Гид', 'Дегустация'],
    season: { start: new Date('2025-04-01'), end: new Date('2025-10-31') },
    minGroupSize: 5,
    maxGroupSize: 20,
    images: ['https://commons.wikimedia.org/wiki/File:Kara-Dag_Feodosia.jpg'],
    isFeatured: true,
    reviews: [{ userId: null, rating: 4, comment: 'Интересно!', createdAt: new Date('2025-03-30') }],
  },
  {
    title: 'Пляжный отдых в Алуште',
    description: 'Недельный отдых на пляжах Алушты.',
    type: 'passive',
    durationDays: 7,
    price: 40000,
    location: { region: 'Алушта', coordinates: { lat: 44.6764, lng: 34.4108 } },
    accommodation: { hotel: null, type: 'hotel', amenities: ['Бассейн', 'Пляж', 'Ресторан'] },
    activities: [
      { name: 'Пляжный отдых', description: 'Релакс на море.', durationHours: 24, equipmentRequired: false },
    ],
    excursions: [{ name: 'Воронцовский дворец', description: 'Экскурсия.', durationHours: 2, price: 1000 }],
    includedServices: ['Проживание', 'Завтраки', 'Трансфер'],
    season: { start: new Date('2025-06-01'), end: new Date('2025-09-30') },
    minGroupSize: 1,
    maxGroupSize: 10,
    hotelCapacity: 30,
    images: ['https://commons.wikimedia.org/wiki/File:Alushta_Beach.jpg'],
    isFeatured: true,
    reviews: [{ userId: null, rating: 4, comment: 'Уютный пляж.', createdAt: new Date('2025-04-25') }],
  },
  {
    title: 'Гастрономический тур в Ялте',
    description: 'Мастер-классы крымской кухни.',
    type: 'excursion',
    durationDays: 2,
    price: 10000,
    location: { region: 'Ялта', coordinates: { lat: 44.4952, lng: 34.1663 } },
    accommodation: { hotel: null, type: 'hotel', amenities: ['Ресторан', 'Wi-Fi'] },
    activities: [
      { name: 'Мастер-класс', description: 'Приготовление плова.', durationHours: 3, equipmentRequired: false },
    ],
    excursions: [],
    includedServices: ['Проживание', 'Питание', 'Мастер-классы'],
    season: { start: new Date('2025-04-01'), end: new Date('2025-10-31') },
    minGroupSize: 4,
    maxGroupSize: 12,
    hotelCapacity: 12,
    images: ['https://commons.wikimedia.org/wiki/File:Yalta_Embankment.jpg'],
    isFeatured: false,
    reviews: [{ userId: null, rating: 5, comment: 'Вкусно и весело!', createdAt: new Date('2025-04-10') }],
  },
  {
    title: 'Приключение в Керчи',
    description: 'Экстремальный тур с посещением каменоломен.',
    type: 'active',
    durationDays: 2,
    price: 15000,
    location: { region: 'Керчь', coordinates: { lat: 45.3467, lng: 36.4556 } },
    accommodation: { hotel: null, type: 'hotel', amenities: ['Ресторан', 'Wi-Fi'] },
    activities: [
      { name: 'Спелеология', description: 'Исследование каменоломен.', durationHours: 4, equipmentRequired: true },
    ],
    excursions: [{ name: 'Гора Митридат', description: 'Прогулка.', durationHours: 1, price: 500 }],
    includedServices: ['Проживание', 'Гид', 'Снаряжение'],
    season: { start: new Date('2025-04-01'), end: new Date('2025-10-31') },
    minGroupSize: 4,
    maxGroupSize: 10,
    hotelCapacity: 10,
    images: ['https://commons.wikimedia.org/wiki/File:Adzhimushkay_Kerch.jpg'],
    isFeatured: false,
    reviews: [{ userId: null, rating: 5, comment: 'Адреналин!', createdAt: new Date('2025-04-15') }],
  },
  {
    title: 'Культурный тур по Феодосии',
    description: 'Посещение галереи Айвазовского и Генуэзской крепости.',
    type: 'excursion',
    durationDays: 1,
    price: 4000,
    location: { region: 'Феодосия', coordinates: { lat: 45.0312, lng: 35.3821 } },
    accommodation: { hotel: null, type: 'none', amenities: [] },
    activities: [
      { name: 'Галерея Айвазовского', description: 'Музей.', durationHours: 1.5, equipmentRequired: false },
      { name: 'Генуэзская крепость', description: 'Экскурсия.', durationHours: 1, equipmentRequired: false },
    ],
    excursions: [],
    includedServices: ['Трансфер', 'Гид', 'Входные билеты'],
    season: { start: new Date('2025-04-01'), end: new Date('2025-10-31') },
    minGroupSize: 5,
    maxGroupSize: 20,
    images: ['https://commons.wikimedia.org/wiki/File:Aivazovsky_Gallery.jpg'],
    isFeatured: true,
    reviews: [{ userId: null, rating: 4, comment: 'Культурно!', createdAt: new Date('2025-04-05') }],
  },
  {
    title: 'Морская прогулка в Севастополе',
    description: 'Прогулка на катере по бухтам Севастополя.',
    type: 'passive',
    durationDays: 1,
    price: 7000,
    location: { region: 'Севастополь', coordinates: { lat: 44.6156, lng: 33.5245 } },
    accommodation: { hotel: null, type: 'none', amenities: [] },
    activities: [
      { name: 'Катерная прогулка', description: 'Осмотр бухт.', durationHours: 2, equipmentRequired: false },
    ],
    excursions: [],
    includedServices: ['Катер', 'Капитан', 'Напитки'],
    season: { start: new Date('2025-05-01'), end: new Date('2025-09-30') },
    minGroupSize: 2,
    maxGroupSize: 10,
    images: ['https://commons.wikimedia.org/wiki/File:Chersonesos_Sevastopol.jpg'],
    isFeatured: true,
    reviews: [{ userId: null, rating: 5, comment: 'Красиво!', createdAt: new Date('2025-04-20') }],
  },
  {
    title: 'Оздоровительный тур в Алуште',
    description: 'Недельный тур с оздоровлением в Riviera Sunrise.',
    type: 'health',
    durationDays: 7,
    price: 60000,
    location: { region: 'Алушта', coordinates: { lat: 44.6712, lng: 34.4087 } },
    accommodation: { hotel: null, type: 'hotel', amenities: ['Спа', 'Бассейн', 'Фитнес-центр'] },
    activities: [
      { name: 'Спа-процедуры', description: 'Гидротерапия.', durationHours: 2, equipmentRequired: false },
      { name: 'Йога', description: 'Занятия.', durationHours: 1, equipmentRequired: true },
    ],
    excursions: [{ name: 'Воронцовский дворец', description: 'Экскурсия.', durationHours: 2, price: 1000 }],
    includedServices: ['Проживание', 'Питание', 'Трансфер', 'Спа'],
    season: { start: new Date('2025-01-01'), end: new Date('2025-12-31') },
    minGroupSize: 2,
    maxGroupSize: 10,
    hotelCapacity: 20,
    images: ['https://commons.wikimedia.org/wiki/File:Alushta_Beach.jpg'],
    isFeatured: true,
    reviews: [{ userId: null, rating: 5, comment: 'Расслабление!', createdAt: new Date('2025-03-15') }],
  },
  {
    title: 'Исторический тур по Симферополю',
    description: 'Экскурсия по Неаполю Скифскому и музею Тавриды.',
    type: 'excursion',
    durationDays: 1,
    price: 3500,
    location: { region: 'Симферополь', coordinates: { lat: 44.9456, lng: 34.1023 } },
    accommodation: { hotel: null, type: 'none', amenities: [] },
    activities: [
      { name: 'Неаполь Скифский', description: 'Археология.', durationHours: 2, equipmentRequired: false },
      { name: 'Музей Тавриды', description: 'Экспозиция.', durationHours: 1.5, equipmentRequired: false },
    ],
    excursions: [],
    includedServices: ['Трансфер', 'Гид', 'Входные билеты'],
    season: { start: new Date('2025-04-01'), end: new Date('2025-10-31') },
    minGroupSize: 5,
    maxGroupSize: 20,
    images: ['https://commons.wikimedia.org/wiki/File:Neapolis_Scythian.jpg'],
    isFeatured: false,
    reviews: [{ userId: null, rating: 4, comment: 'Интересно!', createdAt: new Date('2025-04-10') }],
  },
];

// Данные для доступности
const availabilityData = [
  { tourId: null, date: new Date('2025-06-01'), availableSlots: 15 },
  { tourId: null, date: new Date('2025-06-02'), availableSlots: 10 },
  { tourId: null, date: new Date('2025-07-01'), availableSlots: 8 },
  { tourId: null, date: new Date('2025-06-15'), availableSlots: 12 },
  { tourId: null, date: new Date('2025-07-15'), availableSlots: 10 },
  { tourId: null, date: new Date('2025-08-01'), availableSlots: 15 },
  { tourId: null, date: new Date('2025-08-15'), availableSlots: 10 },
  { tourId: null, date: new Date('2025-06-10'), availableSlots: 12 },
  { tourId: null, date: new Date('2025-07-10'), availableSlots: 8 },
  { tourId: null, date: new Date('2025-08-10'), availableSlots: 10 },
  { tourId: null, date: new Date('2025-06-20'), availableSlots: 15 },
  { tourId: null, date: new Date('2025-07-20'), availableSlots: 12 },
  { tourId: null, date: new Date('2025-08-20'), availableSlots: 10 },
  { tourId: null, date: new Date('2025-06-25'), availableSlots: 12 },
  { tourId: null, date: new Date('2025-07-25'), availableSlots: 8 },
  { tourId: null, date: new Date('2025-08-25'), availableSlots: 10 },
  { tourId: null, date: new Date('2025-06-05'), availableSlots: 15 },
  { tourId: null, date: new Date('2025-07-05'), availableSlots: 12 },
  { tourId: null, date: new Date('2025-08-05'), availableSlots: 10 },
  { tourId: null, date: new Date('2025-06-30'), availableSlots: 12 },
];

// Данные для бронирований
const bookingsData = [
  { userId: null, tourId: null, bookingDate: new Date('2025-05-01'), tourDate: new Date('2025-06-01'), status: 'confirmed', paymentStatus: 'completed', participants: 2 },
  { userId: null, tourId: null, bookingDate: new Date('2025-05-05'), tourDate: new Date('2025-07-01'), status: 'pending', paymentStatus: 'pending', participants: 1 },
  { userId: null, tourId: null, bookingDate: new Date('2025-05-10'), tourDate: new Date('2025-06-15'), status: 'confirmed', paymentStatus: 'completed', participants: 3 },
  { userId: null, tourId: null, bookingDate: new Date('2025-05-15'), tourDate: new Date('2025-07-15'), status: 'confirmed', paymentStatus: 'completed', participants: 2 },
  { userId: null, tourId: null, bookingDate: new Date('2025-05-20'), tourDate: new Date('2025-08-01'), status: 'pending', paymentStatus: 'pending', participants: 1 },
  { userId: null, tourId: null, bookingDate: new Date('2025-05-25'), tourDate: new Date('2025-06-10'), status: 'confirmed', paymentStatus: 'completed', participants: 4 },
  { userId: null, tourId: null, bookingDate: new Date('2025-05-30'), tourDate: new Date('2025-07-10'), status: 'confirmed', paymentStatus: 'completed', participants: 2 },
  { userId: null, tourId: null, bookingDate: new Date('2025-06-01'), tourDate: new Date('2025-08-15'), status: 'pending', paymentStatus: 'pending', participants: 1 },
  { userId: null, tourId: null, bookingDate: new Date('2025-06-05'), tourDate: new Date('2025-06-20'), status: 'confirmed', paymentStatus: 'completed', participants: 3 },
  { userId: null, tourId: null, bookingDate: new Date('2025-06-10'), tourDate: new Date('2025-07-20'), status: 'confirmed', paymentStatus: 'completed', participants: 2 },
  { userId: null, tourId: null, bookingDate: new Date('2025-06-15'), tourDate: new Date('2025-08-20'), status: 'pending', paymentStatus: 'pending', participants: 1 },
  { userId: null, tourId: null, bookingDate: new Date('2025-06-20'), tourDate: new Date('2025-06-25'), status: 'confirmed', paymentStatus: 'completed', participants: 2 },
  { userId: null, tourId: null, bookingDate: new Date('2025-06-25'), tourDate: new Date('2025-07-25'), status: 'confirmed', paymentStatus: 'completed', participants: 3 },
  { userId: null, tourId: null, bookingDate: new Date('2025-06-30'), tourDate: new Date('2025-08-25'), status: 'pending', paymentStatus: 'pending', participants: 1 },
  { userId: null, tourId: null, bookingDate: new Date('2025-07-01'), tourDate: new Date('2025-06-05'), status: 'confirmed', paymentStatus: 'completed', participants: 2 },
  { userId: null, tourId: null, bookingDate: new Date('2025-07-05'), tourDate: new Date('2025-07-05'), status: 'confirmed', paymentStatus: 'completed', participants: 2 },
  { userId: null, tourId: null, bookingDate: new Date('2025-07-10'), tourDate: new Date('2025-08-05'), status: 'pending', paymentStatus: 'pending', participants: 1 },
  { userId: null, tourId: null, bookingDate: new Date('2025-07-15'), tourDate: new Date('2025-06-30'), status: 'confirmed', paymentStatus: 'completed', participants: 3 },
  { userId: null, tourId: null, bookingDate: new Date('2025-07-20'), tourDate: new Date('2025-07-15'), status: 'confirmed', paymentStatus: 'completed', participants: 2 },
  { userId: null, tourId: null, bookingDate: new Date('2025-07-25'), tourDate: new Date('2025-08-10'), status: 'pending', paymentStatus: 'pending', participants: 1 },
];

const postsData = [
  {
    title: 'Мой отдых в Ялте',
    content: 'Ливадийский дворец и Ай-Петри — must-see! Рекомендую ресторан «Винный парк», отличные вина и вид на море.',
    region: 'Ялта',
    author: null,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Yalta_Embankment.jpg/1200px-Yalta_Embankment.jpg',
    likes: [],
    comments: [
      { user: null, content: 'Согласна, Ай-Петри шикарна!', createdAt: new Date('2025-04-02') },
      { user: null, content: 'Какой отель посоветуете?', createdAt: new Date('2025-04-03') },
    ],
    createdAt: new Date('2025-04-01'),
  },
  {
    title: 'Севастополь: Херсонес и море',
    content: 'Херсонес Таврический поразил своей историей. Ужинали в «Парус» — морепродукты на высоте!',
    region: 'Севастополь',
    author: null,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Chersonesos_Sevastopol.jpg/1200px-Chersonesos_Sevastopol.jpg',
    likes: [],
    comments: [
      { user: null, content: 'Обожаю Херсонес!', createdAt: new Date('2025-03-16') },
    ],
    createdAt: new Date('2025-03-15'),
  },
  {
    title: 'Пляжи Феодосии',
    content: 'Золотые пляжи Феодосии — идеально для отдыха с семьёй. Галерея Айвазовского тоже впечатлила.',
    region: 'Феодосия',
    author: null,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Feodosia_Aivazovsky_Gallery.jpg/1200px-Feodosia_Aivazovsky_Gallery.jpg',
    likes: [],
    comments: [
      { user: null, content: 'Как вода в море?', createdAt: new Date('2025-04-11') },
      { user: null, content: 'Тоже планируем туда!', createdAt: new Date('2025-04-12') },
    ],
    createdAt: new Date('2025-04-10'),
  },
  {
    title: 'Поход на Демерджи',
    content: 'Долина Привидений — место с другой планеты! Рекомендую для любителей активного отдыха.',
    region: 'Алушта',
    author: null,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Demerdzhi_Alushta.jpg/1200px-Demerdzhi_Alushta.jpg',
    likes: [],
    comments: [
      { user: null, content: 'Круто, добавлю в список!', createdAt: new Date('2025-03-21') },
    ],
    createdAt: new Date('2025-03-20'),
  },
  {
    title: 'Винный тур в Массандре',
    content: 'Дегустация в Массандре — это любовь! Пробовали красные и белые вина, всё супер.',
    region: 'Ялта',
    author: null,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Massandra_Palace.jpg/1200px-Massandra_Palace.jpg',
    likes: [],
    comments: [
      { user: null, content: 'Какие вина понравились?', createdAt: new Date('2025-03-26') },
    ],
    createdAt: new Date('2025-03-25'),
  },
  {
    title: 'Керчь: история и море',
    content: 'Аджимушкайские каменоломни — сильное место. После гуляли по набережной, вид на мост шикарный.',
    region: 'Керчь',
    author: null,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Kerch_Mithridates.jpg/1200px-Kerch_Mithridates.jpg',
    likes: [],
    comments: [
      { user: null, content: 'Каменоломни впечатляют.', createdAt: new Date('2025-04-06') },
    ],
    createdAt: new Date('2025-04-05'),
  },
  {
    title: 'Спа-отдых в Mriya Resort',
    content: 'Неделя в Mriya — полный релакс. Спа, бассейн, йога — всё на высшем уровне!',
    region: 'Ялта',
    author: null,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Yalta_Embankment.jpg/1200px-Yalta_Embankment.jpg',
    likes: [],
    comments: [
      { user: null, content: 'Сколько стоит тур?', createdAt: new Date('2025-03-11') },
      { user: null, content: 'Звучит круто!', createdAt: new Date('2025-03-12') },
    ],
    createdAt: new Date('2025-03-10'),
  },
  {
    title: 'Мыс Фиолент: красота природы',
    content: 'Фиолент — это любовь с первого взгляда. Прозрачное море и скалы, идеально для фото.',
    region: 'Севастополь',
    author: null,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Fiolent_Sevastopol.jpg/1200px-Fiolent_Sevastopol.jpg',
    likes: [],
    comments: [
      { user: null, content: 'Надо посетить!', createdAt: new Date('2025-04-16') },
    ],
    createdAt: new Date('2025-04-15'),
  },
  {
    title: 'Кемпинг в Кара-Даге',
    content: 'Ночёвка в палатках у моря — незабываемо. Кара-Даг — место силы.',
    region: 'Феодосия',
    author: null,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Kara-Dag_Feodosia.jpg/1200px-Kara-Dag_Feodosia.jpg',
    likes: [],
    comments: [
      { user: null, content: 'Какой маршрут?', createdAt: new Date('2025-04-11') },
    ],
    createdAt: new Date('2025-04-10'),
  },
  {
    title: 'Ялта: прогулка по набережной',
    content: 'Набережная Ялты вечером — магия. Ужинали в «Чайке», живая музыка создала настроение.',
    region: 'Ялта',
    author: null,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Yalta_Embankment.jpg/1200px-Yalta_Embankment.jpg',
    likes: [],
    comments: [
      { user: null, content: 'Чайка классная!', createdAt: new Date('2025-04-06') },
      { user: null, content: 'Люблю Ялту!', createdAt: new Date('2025-04-07') },
    ],
    createdAt: new Date('2025-04-05'),
  },
];


// Данные для отзывов
const reviewsData = [
  {
    userId: null,
    tourId: null,
    title: 'Роскошь в Villa Elena',
    rating: 5,
    comment: 'Villa Elena — роскошь и комфорт! Вид на море шикарный.',
    visitDate: new Date('2025-03-30'),
    createdAt: new Date('2025-04-01'),
  },
  {
    userId: null,
    tourId: null,
    title: 'Уют в Bristol Hotel',
    rating: 4,
    comment: 'Bristol Hotel уютный, но шумно из-за набережной.',
    visitDate: new Date('2025-02-18'),
    createdAt: new Date('2025-02-20'),
  },
  {
    userId: null,
    tourId: null,
    title: 'Дворцы Крыма',
    rating: 5,
    comment: 'Экскурсия по дворцам — насыщенно и интересно!',
    visitDate: new Date('2025-04-13'),
    createdAt: new Date('2025-04-15'),
  },
  {
    userId: null,
    tourId: null,
    title: 'Винный парк',
    rating: 5,
    comment: 'Винный парк — отличные вина и атмосфера!',
    visitDate: new Date('2025-04-08'),
    createdAt: new Date('2025-04-10'),
  },
  {
    userId: null,
    tourId: null,
    title: 'Mriya Resort',
    rating: 5,
    comment: 'Mriya Resort — идеально для семейного отдыха.',
    visitDate: new Date('2025-03-13'),
    createdAt: new Date('2025-03-15'),
  },
  {
    userId: null,
    tourId: null,
    title: 'Пляжи Феодосии',
    rating: 4,
    comment: 'Пляжный отдых в Феодосии — море супер, но экскурсия короткая.',
    visitDate: new Date('2025-04-18'),
    createdAt: new Date('2025-04-20'),
  },
  {
    userId: null,
    tourId: null,
    title: 'Ресторан Парус',
    rating: 4,
    comment: 'Парус — морепродукты вкусные, но долго ждали.',
    visitDate: new Date('2025-03-18'),
    createdAt: new Date('2025-03-20'),
  },
  {
    userId: null,
    tourId: null,
    title: 'Palmira Palace',
    rating: 5,
    comment: 'Palmira Palace — спа-процедуры на высоте!',
    visitDate: new Date('2025-03-18'),
    createdAt: new Date('2025-03-20'),
  },
  {
    userId: null,
    tourId: null,
    title: 'Винный тур',
    rating: 5,
    comment: 'Винный тур в Массандре — незабываемо!',
    visitDate: new Date('2025-03-23'),
    createdAt: new Date('2025-03-25'),
  },
  {
    userId: null,
    tourId: null,
    title: 'Ресторан Дюльбер',
    rating: 5,
    comment: 'Дюльбер — плов просто огонь!',
    visitDate: new Date('2025-03-13'),
    createdAt: new Date('2025-03-15'),
  },
];

// Данные для достижений пользователей
const userAchievementsData = [
  { user: null, achievement: null, earnedAt: new Date('2025-04-01') },
  { user: null, achievement: null, earnedAt: new Date('2025-03-15') },
  { user: null, achievement: null, earnedAt: new Date('2025-04-10') },
  { user: null, achievement: null, earnedAt: new Date('2025-03-20') },
  { user: null, achievement: null, earnedAt: new Date('2025-04-05') },
  { user: null, achievement: null, earnedAt: new Date('2025-04-15') },
  { user: null, achievement: null, earnedAt: new Date('2025-03-10') },
];

// Функция для очистки базы данных и заполнения новыми данными
async function seedDatabase() {
  try {
    // Очистка всех коллекций
    await Promise.all([
      User.deleteMany({}),
      Achievement.deleteMany({}),
      Region.deleteMany({}),
      Hotel.deleteMany({}),
      Attraction.deleteMany({}),
      Restaurant.deleteMany({}),
      Category.deleteMany({}),
      Tour.deleteMany({}),
      Availability.deleteMany({}),
      Booking.deleteMany({}),
      Post.deleteMany({}),
      Review.deleteMany({}),
      UserAchievement.deleteMany({}),
    ]);
    console.log('Все коллекции очищены.');

    // Вставка пользователей
    const users = await User.insertMany(usersData);
    console.log('Пользователи добавлены:', users.length);

    // Вставка достижений
    const achievements = await Achievement.insertMany(achievementsData);
    console.log('Достижения добавлены:', achievements.length);

    // Вставка регионов
    const regions = await Region.insertMany(regionsData);
    console.log('Регионы добавлены:', regions.length);

    // Вставка отелей
    const hotels = await Hotel.insertMany(hotelsData.map(hotel => ({
      ...hotel,
      reviews: hotel.reviews.map(review => ({ ...review, userId: users[Math.floor(Math.random() * users.length)]._id })),
    })));
    console.log('Отели добавлены:', hotels.length);

    // Вставка достопримечательностей
    const attractions = await Attraction.insertMany(attractionsData);
    console.log('Достопримечательности добавлены:', attractions.length);

    // Вставка ресторанов
    const restaurants = await Restaurant.insertMany(restaurantsData.map(restaurant => ({
      ...restaurant,
      reviews: restaurant.reviews.map(review => ({ ...review, userId: users[Math.floor(Math.random() * users.length)]._id })),
    })));
    console.log('Рестораны добавлены:', restaurants.length);

    // Вставка категорий
    const categories = await Category.insertMany(categoriesData);
    console.log('Категории добавлены:', categories.length);

    // Вставка туров
    const tours = await Tour.insertMany(toursData.map(tour => ({
      ...tour,
      accommodation: {
        ...tour.accommodation,
        hotel: tour.accommodation.type === 'hotel' ? hotels[Math.floor(Math.random() * hotels.length)]._id : null,
      },
      reviews: tour.reviews.map(review => ({ ...review, userId: users[Math.floor(Math.random() * users.length)]._id })),
      hotelCapacity: tour.accommodation.type === 'hotel' ? Math.min(tour.maxGroupSize, hotels.find(h => h._id.equals(tour.accommodation.hotel))?.capacity || tour.maxGroupSize) : tour.maxGroupSize,
    })));
    console.log('Туры добавлены:', tours.length);

    // Вставка доступности
    const availability = await Availability.insertMany(availabilityData.map(item => ({
      ...item,
      tourId: tours[Math.floor(Math.random() * tours.length)]._id,
    })));
    console.log('Доступность добавлена:', availability.length);

    // Вставка бронирований
    const bookings = await Booking.insertMany(bookingsData.map(booking => ({
      ...booking,
      userId: users[Math.floor(Math.random() * users.length)]._id,
      tourId: tours[Math.floor(Math.random() * tours.length)]._id,
    })));
    console.log('Бронирования добавлены:', bookings.length);

    // Вставка постов
    const posts = await Post.insertMany(postsData.map(post => ({
      ...post,
      author: users[Math.floor(Math.random() * users.length)]._id,
      region: regions.find(r => r.name === post.region)?._id,
      likes: Array.from({ length: Math.floor(Math.random() * 5) }, () => users[Math.floor(Math.random() * users.length)]._id),
      comments: post.comments.map(comment => ({
        ...comment,
        user: users[Math.floor(Math.random() * users.length)]._id, // Заменяем user: null на случайный _id пользователя
      })),
    })));
    console.log('Посты добавлены:', posts.length);

    // Вставка отзывов
    const reviews = await Review.insertMany(reviewsData.map(review => ({
      ...review,
      userId: users[Math.floor(Math.random() * users.length)]._id,
      tourId: tours[Math.floor(Math.random() * tours.length)]._id,
    })));
    console.log('Отзывы добавлены:', reviews.length);
    console.log('Отзывы добавлены:', reviews.length);

    // Вставка достижений пользователей
    const userAchievements = await UserAchievement.insertMany(userAchievementsData.map(ua => ({
      ...ua,
      user: users[Math.floor(Math.random() * users.length)]._id,
      achievement: achievements[Math.floor(Math.random() * achievements.length)]._id,
    })));
    console.log('Достижения пользователей добавлены:', userAchievements.length);

    console.log('База данных успешно заполнена!');
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Подключение к MongoDB закрыто.');
  }
}

// Запуск функции
seedDatabase();