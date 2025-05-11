// routes/seasonRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middlewares/authMiddleware'); // Import middleware
const {
  createSeason,
  updateSeason,
  deleteSeason,
  viewAllSeasons,
  viewSeasonById,
} = require('../controllers/seasonController'); // Import controller functions


// Customer Routes
router.get('/',  viewAllSeasons);  // Customer can view all seasons
router.get('/:season_id', viewSeasonById);  // Get a specific season by season_id (public access)

// Admin Routes
router.post('/', authenticate, authorizeAdmin, createSeason);  // Create a new season
router.put('/:season_id', authenticate, authorizeAdmin, updateSeason);  // Update a season by season_id
router.delete('/:season_id', authenticate, authorizeAdmin, deleteSeason);  // Delete a season by season_id

module.exports = router;



module.exports = router;
