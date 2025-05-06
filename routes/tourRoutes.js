const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');

router.get('/', tourController.getTours);
router.get('/filter', tourController.filterTours);
router.get('/:id', tourController.getTourById);

module.exports = router;