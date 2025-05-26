

const pool = require('../config/db'); // Assuming the pool is in 'config/db.js'

class Season {
  // Method to create a new season
  static async create(season) {
    const { season_id, name, start_date, end_date } = season;
    console.log("Season data before insert:", { season_id, name, start_date, end_date });
  
    // Ensure start_date and end_date are correctly set
    const finalStartDate = start_date || new Date();  // Default to current date if start_date is undefined
    const finalEndDate = end_date !== undefined ? end_date : null;  // Default to null if end_date is undefined
  
    console.log("Final data to insert:", { season_id, name, finalStartDate, finalEndDate });
  
    try {
      const [result] = await pool.execute(
        'INSERT INTO Seasons (season_id, name, start_date, end_date) VALUES (?, ?, ?, ?)',
        [season_id, name, finalStartDate, finalEndDate]
      );
      return result;
    } catch (error) {
      console.error("Error while creating season:", error);
      throw new Error('Error while creating season: ' + error.message);
    }
  }
  

  // Method to get all seasons
  static async findAll() {
    try {
      const [seasons] = await pool.execute('SELECT * FROM Seasons');
      return seasons;
    } catch (error) {
      throw new Error('Error fetching seasons: ' + error.message);
    }
  }

  // Method to find a season by its ID
  static async findById(season_id) {
    try {
      const [season] = await pool.execute('SELECT * FROM Seasons WHERE season_id = ?', [season_id]);
      return season[0];  // Return the first season (or null if not found)
    } catch (error) {
      throw new Error('Error fetching season: ' + error.message);
    }
  }

  // Method to update a season by its ID
  static async update(season_id, updatedSeason) {
    const { name, start_date, end_date } = updatedSeason;
    try {
      const [season] = await pool.execute('SELECT * FROM Seasons WHERE season_id = ?', [season_id]);
      if (!season || season.length === 0) throw new Error('Season not found');

      const [result] = await pool.execute(
        'UPDATE Seasons SET name = ?, start_date = ?, end_date = ? WHERE season_id = ?',
        [
          name || season[0].name,
          start_date || season[0].start_date,
          end_date || season[0].end_date,
          season_id
        ]
      );
      return result;
    } catch (error) {
      throw new Error('Error updating season: ' + error.message);
    }
  }

  // Method to delete a season by its ID
  static async delete(season_id) {
    if (!season_id) {
      throw new Error("Season ID is undefined");
    }
  
    try {
      const [rows] = await pool.execute('SELECT * FROM Seasons WHERE season_id = ?', [season_id]);
  
      if (!rows || rows.length === 0) {
        throw new Error('Season not found');
      }
  
      const [result] = await pool.execute('DELETE FROM Seasons WHERE season_id = ?', [season_id]);
      return result;
    } catch (error) {
      throw new Error('Error deleting season: ' + error.message);
    }
  }
  
}

module.exports = Season;
