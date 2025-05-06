const express = require('express');
const router = express.Router();
const regionController = require('../controllers/regionController');

router.get('/:id', regionController.getRegionById);
router.get('/:id/filter', regionController.filterRegionTours);

module.exports = router;