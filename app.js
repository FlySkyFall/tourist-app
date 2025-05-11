const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const flash = require('connect-flash');
const csrf = require('csurf');

// Загрузка переменных окружения
dotenv.config();

// Инициализация приложения
const app = express();

// Подключение к MongoDB
const connectDB = require('./config/db');
connectDB();

// Настройка Handlebars
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.hbs',
  partialsDir: [
    path.join(__dirname, 'views/partials'),
    path.join(__dirname, 'views/booking'),
  ],
});

// Регистрация помощников для Handlebars
hbs.handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});
hbs.handlebars.registerHelper('gt', function (a, b) {
  return a > b;
});
hbs.handlebars.registerHelper('lt', function (a, b) {
  return a < b;
});
hbs.handlebars.registerHelper('add', function (a, b) {
  return a + b;
});
hbs.handlebars.registerHelper('subtract', function (a, b) {
  return a - b;
});
hbs.handlebars.registerHelper('range', function (start, end) {
  const range = [];
  for (let i = start; i <= end; i++) {
    range.push(i);
  }
  return range;
});
hbs.handlebars.registerHelper('formatDate', function (date) {
  return new Date(date).toLocaleDateString('ru-RU');
});
hbs.handlebars.registerHelper('join', function (array, separator) {
  console.log('Join helper called with:', array, separator);
  return array ? array.join(separator) : '';
});
hbs.handlebars.registerHelper('includes', function (array, value, options) {
  const values = array ? array.split(',') : [];
  return values.includes(value) ? options.fn(this) : '';
});
hbs.handlebars.registerHelper('contains', function (array, value) {
  if (typeof array === 'string') {
    return array.split(',').includes(value);
  }
  return Array.isArray(array) && array.includes(value);
});
hbs.handlebars.registerHelper('truncate', function(str, len) {
  if (str.length > len) return str.substring(0, len) + '...';
  return str;
});
hbs.handlebars.registerHelper('and', function (a, b) {
  return a && b;
});
hbs.handlebars.registerHelper('or', function (...args) {
  return args.slice(0, -1).some(arg => !!arg);
});
hbs.handlebars.registerHelper('not', function(value) {
  return !value;
});

console.log('Handlebars helpers registered: eq, gt, lt, add, subtract, range, formatDate, join, includes, contains, truncate, and, or, not');

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24*60*60*1000,
  },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Инициализация CSRF-защиты
const csrfProtection = csrf({
  coockie: true,
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
});
app.use((req, res, next) => {
  if (['/auth/login', '/auth/register', '/bookings/clean-expired'].includes(req.path) && req.method === 'POST') {
    console.log(`Bypassing CSRF protection for ${req.path}`);
    return next();
  }
  csrfProtection(req, res, next);
});

// Передача flash-сообщений и CSRF-токена в шаблоны
app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.user = req.user || null;
  console.log(`User for ${req.path}:`, req.user ? { id: req.user._id, username: req.user.username, role: req.user.role } : 'No user');
  try {
    res.locals.csrfToken = req.csrfToken ? req.csrfToken() : null;
    console.log(`CSRF token generated for ${req.path}: ${res.locals.csrfToken}`);
  } catch (err) {
    console.error(`Failed to generate CSRF token for ${req.path}:`, err);
    res.locals.csrfToken = null;
  }
  next();
});

// Подключение Passport
require('./config/passport');

// Маршруты
app.use('/', require('./routes/mainRoutes'));
app.use('/tours', require('./routes/tourRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/regions', require('./routes/regionRoutes'));
app.use('/bookings', require('./routes/bookingRoutes'));
app.use('/profile', require('./routes/profileRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.use('/news', require('./routes/newsRoutes'));
app.use('/travel', require('./routes/travelRoutes'));

// Обработка ошибок
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.error('CSRF token validation failed:', { path: req.path, method: req.method });
    return res.status(403).json({ error: 'Недействительный CSRF-токен' });
  }
  console.error(err.stack);
  res.status(500).render('error', { message: 'Что-то пошло не так!' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});