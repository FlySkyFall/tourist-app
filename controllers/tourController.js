const Tour = require('../models/Tour');
const Region = require('../models/Region');
const mongoose = require('mongoose');

exports.getTours = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
    const type = req.query.type || 'all';
    const search = req.query.search ? req.query.search.trim() : '';
    const region = req.query.region ? req.query.region.trim() : '';
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : '';
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : '';
    const startDate = req.query.startDate ? new Date(req.query.startDate) : '';
    const endDate = req.query.endDate ? new Date(req.query.endDate) : '';
    const sortBy = req.query.sortBy || '';
    const minDuration = req.query.minDuration ? parseInt(req.query.minDuration) : '';
    const maxDuration = req.query.maxDuration ? parseInt(req.query.maxDuration) : '';
    const difficulties = req.query.difficulties ? req.query.difficulties.split(',') : [];
    const amenities = req.query.amenities ? req.query.amenities.split(',') : [];

    if (page < 1) {
      console.log('Invalid page number:', page);
      return res.render('tours/index', {
        tours: [],
        regions: [],
        amenitiesList: [],
        currentPage: 1,
        totalPages: 1,
        totalTours: 0,
        error: 'Неверный номер страницы',
        currentType: type,
        currentSearch: search,
        currentRegion: region,
        currentMinPrice: minPrice,
        currentMaxPrice: maxPrice,
        currentStartDate: startDate ? startDate.toISOString().split('T')[0] : '',
        currentEndDate: endDate ? endDate.toISOString().split('T')[0] : '',
        currentSortBy: sortBy,
        currentMinDuration: minDuration,
        currentMaxDuration: maxDuration,
        currentDifficulties: difficulties.join(','),
        currentAmenities: amenities.join(','),
      });
    }

    const query = {};
    if (type && type !== 'all') {
      query.type = type;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (region) {
      query['location.region'] = region;
    }
    if (minPrice) {
      query.price = { ...query.price, $gte: minPrice };
    }
    if (maxPrice) {
      query.price = { ...query.price, $lte: maxPrice };
    }
    if (startDate || endDate) {
      query.$and = query.$and || [];
      if (startDate) {
        query.$and.push({ 'season.end': { $gte: startDate } });
      }
      if (endDate) {
        query.$and.push({ 'season.start': { $lte: endDate } });
      }
    }
    if (minDuration) {
      query.durationDays = { ...query.durationDays, $gte: minDuration };
    }
    if (maxDuration) {
      query.durationDays = { ...query.durationDays, $lte: maxDuration };
    }
    if (difficulties.length > 0) {
      query.difficultyLevel = { $in: difficulties };
    }
    if (amenities.length > 0) {
      query['accommodation.amenities'] = { $all: amenities };
    }

    const sortOptions = {};
    if (sortBy) {
      const [field, direction] = sortBy.split('-');
      sortOptions[field] = direction === 'asc' ? 1 : -1;
    }

    const amenitiesList = await Tour.distinct('accommodation.amenities');

    console.log('getTours query:', JSON.stringify(query), 'sort:', JSON.stringify(sortOptions), 'amenitiesList:', amenitiesList);

    const tours = await Tour.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
    const totalTours = await Tour.countDocuments(query);
    const totalPages = Math.ceil(totalTours / limit);

    const regions = await Region.find({}).select('name').lean();

    console.log('getTours result:', { tours: tours.length, totalTours, totalPages, page, type, search, region, minPrice, maxPrice, startDate: startDate ? startDate.toISOString() : '', endDate: endDate ? endDate.toISOString() : '', sortBy, minDuration, maxDuration, difficulties, amenities });

    if (!tours.length && page > 1) {
      console.log(`No tours found for page ${page}, skip=${skip}, limit=${limit}, type=${type}, search=${search}, region=${region}, minPrice=${minPrice}, maxPrice=${maxPrice}, startDate=${startDate}, endDate=${endDate}, sortBy=${sortBy}, minDuration=${minDuration}, maxDuration=${maxDuration}, difficulties=${difficulties}, amenities=${amenities}`);
      return res.render('tours/index', {
        tours: [],
        regions,
        amenitiesList,
        currentPage: page,
        totalPages,
        totalTours,
        error: 'Такой страницы не существует',
        currentType: type,
        currentSearch: search,
        currentRegion: region,
        currentMinPrice: minPrice,
        currentMaxPrice: maxPrice,
        currentStartDate: startDate ? startDate.toISOString().split('T')[0] : '',
        currentEndDate: endDate ? endDate.toISOString().split('T')[0] : '',
        currentSortBy: sortBy,
        currentMinDuration: minDuration,
        currentMaxDuration: maxDuration,
        currentDifficulties: difficulties.join(','),
        currentAmenities: amenities.join(','),
      });
    }

    res.render('tours/index', {
      tours,
      regions,
      amenitiesList,
      currentPage: page,
      totalPages,
      totalTours,
      toursOnPage: tours.length,
      currentType: type,
      currentSearch: search,
      currentRegion: region,
      currentMinPrice: minPrice,
      currentMaxPrice: maxPrice,
      currentStartDate: startDate ? startDate.toISOString().split('T')[0] : '',
      currentEndDate: endDate ? endDate.toISOString().split('T')[0] : '',
      currentSortBy: sortBy,
      currentMinDuration: minDuration,
      currentMaxDuration: maxDuration,
      currentDifficulties: difficulties.join(','),
      currentAmenities: amenities.join(','),
      error: tours.length ? null : 'Нет туров для выбранных фильтров',
    });
  } catch (error) {
    console.error('Error in getTours:', error.message, error.stack);
    res.render('tours/index', {
      tours: [],
      regions: [],
      amenitiesList: [],
      currentPage: 1,
      totalPages: 1,
      totalTours: 0,
      error: `Ошибка загрузки туров: ${error.message}`,
      currentType: 'all',
      currentSearch: '',
      currentRegion: '',
      currentMinPrice: '',
      currentMaxPrice: '',
      currentStartDate: '',
      currentEndDate: '',
      currentSortBy: '',
      currentMinDuration: '',
      currentMaxDuration: '',
      currentDifficulties: '',
      currentAmenities: '',
    });
  }
};

exports.filterTours = async (req, res) => {
  try {
    const type = req.query.type || 'all';
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search ? req.query.search.trim() : '';
    const region = req.query.region ? req.query.region.trim() : '';
    const minPrice = req.query.minPrice ? parseInt(req.query.minPrice) : '';
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice) : '';
    const startDate = req.query.startDate ? new Date(req.query.startDate) : '';
    const endDate = req.query.endDate ? new Date(req.query.endDate) : '';
    const sortBy = req.query.sortBy || '';
    const minDuration = req.query.minDuration ? parseInt(req.query.minDuration) : '';
    const maxDuration = req.query.maxDuration ? parseInt(req.query.maxDuration) : '';
    const difficulties = req.query.difficulties ? req.query.difficulties.split(',') : [];
    const amenities = req.query.amenities ? req.query.amenities.split(',') : [];
    const limit = 12;
    const skip = (page - 1) * limit;

    const query = {};
    if (type && type !== 'all') {
      query.type = type;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (region) {
      query['location.region'] = region;
    }
    if (minPrice) {
      query.price = { ...query.price, $gte: minPrice };
    }
    if (maxPrice) {
      query.price = { ...query.price, $lte: maxPrice };
    }
    if (startDate || endDate) {
      query.$and = query.$and || [];
      if (startDate) {
        query.$and.push({ 'season.end': { $gte: startDate } });
      }
      if (endDate) {
        query.$and.push({ 'season.start': { $lte: endDate } });
      }
    }
    if (minDuration) {
      query.durationDays = { ...query.durationDays, $gte: minDuration };
    }
    if (maxDuration) {
      query.durationDays = { ...query.durationDays, $lte: maxDuration };
    }
    if (difficulties.length > 0) {
      query.difficultyLevel = { $in: difficulties };
    }
    if (amenities.length > 0) {
      query['accommodation.amenities'] = { $all: amenities };
    }

    const sortOptions = {};
    if (sortBy) {
      const [field, direction] = sortBy.split('-');
      sortOptions[field] = direction === 'asc' ? 1 : -1;
    }

    console.log('filterTours query:', JSON.stringify(query), 'sort:', JSON.stringify(sortOptions));

    const tours = await Tour.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();
    const totalTours = await Tour.countDocuments(query);
    const totalPages = Math.ceil(totalTours / limit);

    console.log('filterTours result:', { tours: tours.length, totalTours, totalPages, page, type, search, region, minPrice, maxPrice, startDate: startDate ? startDate.toISOString() : '', endDate: endDate ? endDate.toISOString() : '', sortBy, minDuration, maxDuration, difficulties, amenities });

    res.json({
      tours,
      currentPage: page,
      totalPages,
      totalTours,
      toursOnPage: tours.length,
      currentType: type,
    });
  } catch (error) {
    console.error('Error in filterTours:', error.message, error.stack);
    res.status(500).json({ error: `Ошибка загрузки туров: ${error.message}` });
  }
};

exports.getTourById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).render('error', { message: 'Неверный идентификатор тура' });
    }
    const tour = await Tour.findById(req.params.id).populate('reviews.userId', 'username').lean();
    if (!tour) {
      return res.status(404).render('error', { message: 'Тур не найден' });
    }
    const hasReviewed = req.user ? tour.reviews.some(review => review.userId._id.toString() === req.user._id.toString()) : false;
    res.render('tours/tour', {
      tour,
      user: req.user || null,
      hasReviewed,
      error: null,
    });
  } catch (error) {
    console.error('Error in getTourById:', error.message, error.stack);
    res.status(500).render('error', { message: 'Ошибка загрузки тура' });
  }
};

exports.addReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).render('error', { message: 'Неверный идентификатор тура' });
    }
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).render('error', { message: 'Тур не найден' });
    }
    // Проверка, оставлял ли пользователь отзыв
    const existingReview = tour.reviews.find(review => review.userId.toString() === req.user._id.toString());
    if (existingReview) {
      return res.status(400).render('tours/tour', {
        tour: tour.toObject(),
        user: req.user || null,
        hasReviewed: true,
        error: 'Вы уже оставили отзыв для этого тура',
      });
    }
    const { rating, comment } = req.body;
    tour.reviews.push({
      userId: req.user._id,
      rating: parseInt(rating),
      comment,
    });
    await tour.save();
    res.redirect(`/tours/${req.params.id}`);
  } catch (error) {
    console.error('Error in addReview:', error.message, error.stack);
    res.status(500).render('tours/tour', {
      tour: tour ? tour.toObject() : null,
      user: req.user || null,
      hasReviewed: false,
      error: 'Ошибка добавления отзыва',
    });
  }
};