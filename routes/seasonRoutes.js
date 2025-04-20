// routes/seasonRoutes.js
const express = require('express');
const router = express.Router();
const { protect ,authorizeCustomer,authorizeAdmin, } = require('../middlewares/authMiddleware'); // Import middleware
const {
  createSeason,
  getAllSeasons,
  getSeasonById,
  updateSeason,
  deleteSeason,
  viewAllSeasons,
  viewSeasonById,
} = require('../controllers/seasonController'); // Import controller functions


// Customer Routes
router.get('/seasons', protect, authorizeCustomer, viewAllSeasons);  // Customer can view all seasons
router.get('/seasons/:id', protect, authorizeCustomer, viewSeasonById);  // Customer can view a specific season
// Admin Routes
router.post('/', authorizeAdmin, createSeason);  // Admin can create a season
router.get('/', authorizeAdmin, getAllSeasons);  // Admin can get all seasons
router.get('/:id', authorizeAdmin, getSeasonById);  // Admin can get season by ID
router.put('/:id', authorizeAdmin, updateSeason);  // Admin can update a season
router.delete('/:id', authorizeAdmin, deleteSeason);  // Admin can delete a season



module.exports = router;
