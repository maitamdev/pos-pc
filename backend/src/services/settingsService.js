const db = require('../config/database');

const SettingsService = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM system_settings ORDER BY id');
    // Convert to key-value object
    const settings = {};
    rows.forEach(r => { settings[r.setting_key] = r.setting_value; });
    return settings;
  },

  async get(key) {
    const [rows] = await db.query('SELECT setting_value FROM system_settings WHERE setting_key = ?', [key]);
    return rows[0]?.setting_value || null;
  },

  async update(settings) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (const [key, value] of Object.entries(settings)) {
        await conn.query(
          'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
          [key, value, value]
        );
      }
      await conn.commit();
      return await this.getAll();
    } catch (err) { await conn.rollback(); throw err; }
    finally { conn.release(); }
  }
};

module.exports = SettingsService;