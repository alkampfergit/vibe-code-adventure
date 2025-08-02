import sqlite3 from 'sqlite3';

export interface UserSession {
  id: string;
  username: string;
  createdAt: string;
  lastActive: string;
  status: 'active' | 'inactive';
}

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database('./game.db');
    this.initializeTables();
  }

  private initializeTables() {
    const createUserSessionsTable = `
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createUserSessionsTable, (err) => {
      if (err) {
        console.error('Error creating user_sessions table:', err);
      } else {
        console.log('Database initialized successfully');
      }
    });
  }

  async findExistingUser(username: string): Promise<UserSession | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT id, username, status, created_at, last_active FROM user_sessions WHERE username = ? AND status = "active" ORDER BY last_active DESC LIMIT 1',
        [username],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve({
              id: row.id,
              username: row.username,
              createdAt: row.created_at,
              lastActive: row.last_active,
              status: row.status
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async createSession(username: string): Promise<UserSession> {
    const sessionId = this.generateSessionId();
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO user_sessions (id, username, status) VALUES (?, ?, "active")',
        [sessionId, username],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: sessionId,
              username,
              createdAt: new Date().toISOString(),
              lastActive: new Date().toISOString(),
              status: 'active'
            });
          }
        }
      );
    });
  }

  async getSession(sessionId: string): Promise<UserSession | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT id, username, status, created_at, last_active FROM user_sessions WHERE id = ? AND status = "active"',
        [sessionId],
        (err, row: any) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve({
              id: row.id,
              username: row.username,
              createdAt: row.created_at,
              lastActive: row.last_active,
              status: row.status
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async updateLastActive(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE user_sessions SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
        [sessionId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async deactivateSession(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE user_sessions SET status = "inactive" WHERE id = ?',
        [sessionId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  // Keep deleteSession for backward compatibility and testing
  async deleteSession(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM user_sessions WHERE id = ?',
        [sessionId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async getAllUsers(): Promise<UserSession[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT id, username, status, created_at, last_active FROM user_sessions ORDER BY created_at DESC',
        [],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const users = rows.map(row => ({
              id: row.id,
              username: row.username,
              createdAt: row.created_at,
              lastActive: row.last_active,
              status: row.status
            }));
            resolve(users);
          }
        }
      );
    });
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export const database = new Database();