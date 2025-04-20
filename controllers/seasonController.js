



const Season = require('../models/season'); // Import the Season model

// Admin: Create a new season
exports.createSeason = async (req, res) => {
  try {
    const { season_id, name, start_date, end_date } = req.body;

    // Check if the season already exists
    const existingSeason = await Season.findById(season_id);
    if (existingSeason) {
      return res.status(400).json({ message: 'Season already exists' });
    }

    // Create the new season
    await Season.create({ season_id, name, start_date, end_date });

    res.status(201).json({ season_id, name, start_date, end_date });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Admin: Get all seasons
exports.getAllSeasons = async (req, res) => {
  try {
    const seasons = await Season.findAll();
    res.status(200).json(seasons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Admin: Get a season by ID
exports.getSeasonById = async (req, res) => {
  try {
    const { id } = req.params;
    const season = await Season.findById(id);

    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    res.status(200).json(season);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Admin: Update a season
exports.updateSeason = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, start_date, end_date } = req.body;

    const season = await Season.findById(id);
    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    // Update the season with provided data
    await Season.update(id, { name, start_date, end_date });

    res.status(200).json({
      season_id: id,
      name: name || season.name,
      start_date: start_date || season.start_date,
      end_date: end_date || season.end_date
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Admin: Delete a season
exports.deleteSeason = async (req, res) => {
  try {
    const { id } = req.params;
    const season = await Season.findById(id);

    if (!season) {
      return res.status(404).json({ message: 'Season not found' });
    }

    await Season.delete(id);
    res.status(200).json({ message: 'Season deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Customer: Get all seasons
exports.viewAllSeasons = async (req, res) => {
  try {
    const seasons = await Season.findAll();
    res.status(200).json(seasons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
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
    res.status(500).json({ message: 'Server error', error });
  }
};
