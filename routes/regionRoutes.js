const express = require('express');
const router = express.Router();
const regionController = require('../controllers/regionController');
const Attraction = require('../models/Attraction');

router.get('/', regionController.getRegions);
router.get('/:id', async (req, res, next) => {
  try {
    const region = await regionController.getRegionById(req);
    const attractions = await Attraction.find({ 'location.region': region.name }).lean();
    res.render('regions/region', {
      region,
      tours: region.tours,
      attractions,
      currentPage: region.currentPage,
      totalPages: region.totalPages,
      totalTours: region.totalTours,
      toursOnPage: region.toursOnPage,
      currentType: region.currentType,
      error: region.error,
      user: req.user || null,
      csrfToken: req.csrfToken ? req.csrfToken() : ''
    });
  } catch (error) {
    next(error);
  }
});
router.get('/:id/filter', regionController.filterRegionTours);

module.exports = router;