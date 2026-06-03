const db = require('../config/database');
const mysqldump = require('mysqldump');
const path = require('path');
const fs = require('fs');

const BACKUP_DIR = path.join(__dirname, '../../backups');

const BackupService = {
  async createBackup() {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `backup_${timestamp}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);

    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'computer_pos_db';

    try {
      await mysqldump({
        connection: { host, user, password, database },
        dumpToFile: filepath,
      });
      const stats = fs.statSync(filepath);
      return { filename, filepath, size: stats.size, created_at: new Date() };
    } catch (err) {
      // Fallback: use mysql CLI
      const { execSync } = require('child_process');
      const cmd = `mysqldump -h ${host} -u ${user} ${password ? `-p${password}` : ''} ${database} > "${filepath}"`;
      try {
        execSync(cmd, { stdio: 'pipe' });
        const stats = fs.statSync(filepath);
        return { filename, filepath, size: stats.size, created_at: new Date() };
      } catch (err2) {
        throw new Error('Backup thất bại: ' + err2.message);
      }
    }
  },

  async listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.sql')).sort().reverse();
    return files.map(f => {
      const stats = fs.statSync(path.join(BACKUP_DIR, f));
      return { filename: f, size: stats.size, created_at: stats.mtime };
    });
  },

  async deleteBackup(filename) {
    const filepath = path.join(BACKUP_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  },

  getBackupPath(filename) {
    return path.join(BACKUP_DIR, filename);
  }
};

module.exports = BackupService;