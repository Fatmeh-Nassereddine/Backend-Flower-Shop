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
router.get('/:id',  viewSeasonById);  // Customer can view a specific season
// Admin Routes
router.post('/', authenticate,authorizeAdmin, createSeason);  // Admin can create a season
router.put('/:id', authenticate,authorizeAdmin, updateSeason);  // Admin can update a season
router.delete('/:id', authenticate,authorizeAdmin, deleteSeason);  // Admin can delete a season



module.exports = router;
