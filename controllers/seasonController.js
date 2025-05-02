



const Season = require('../models/season'); // Uses raw SQL via model
// No need to import pool here unless you're doing raw queries (we're not anymore)

// Admin: Create a new season
exports.createSeason = async (req, res) => {
  try {
    const { season_id, name, start_date, end_date } = req.body;

    const existingSeason = await Season.findById(season_id);
    if (existingSeason) {
      return res.status(400).json({ message: 'Season already exists' });
    }

    await Season.create({ season_id, name, start_date, end_date });
    res.status(201).json({ season_id, name, start_date, end_date });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Update a season
exports.updateSeason = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, start_date, end_date } = req.body;

    const existingSeason = await Season.findById(id);
    if (!existingSeason) {
      return res.status(404).json({ message: 'Season not found' });
    }

    await Season.update(id, { name, start_date, end_date });

    res.status(200).json({
      season_id: id,
      name: name || existingSeason.name,
      start_date: start_date || existingSeason.start_date,
      end_date: end_date || existingSeason.end_date
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Delete a season
exports.deleteSeason = async (req, res) => {
  try {
    const { id } = req.params;

    const existingSeason = await Season.findById(id);
    if (!existingSeason) {
      return res.status(404).json({ message: 'Season not found' });
    }

    await Season.delete(id);
    res.status(200).json({ message: 'Season deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Customer: Get all seasons
exports.viewAllSeasons = async (req, res) => {
  try {
    const seasons = await Season.findAll();  // Use model, not raw query
    res.status(200).json(seasons.map(s => ({
      id: s.season_id,
      name: s.name
    })));
  } catch (error) {
    console.error('Error fetching seasons:', error);
    res.status(500).json({ message: 'Failed to fetch seasons', error: error.message });
  }
};

// Customer: Get a season by ID
exports.viewSeasonById = async (req, res) => {
  try {
    const { id } = req.params;
    const season = await Season.findById(id);

    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    res.status(200).json(season);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
