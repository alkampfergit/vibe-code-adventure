import { DatabaseSync } from 'node:sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export class DatabaseService {
  private static db: DatabaseSync | null = null

  static async initialize(): Promise<void> {
    const dbPath = path.join(__dirname, '../../../data/game.db')
    
    try {
      this.db = new DatabaseSync(dbPath)
      await this.createTables()
      console.log('Database connected successfully')
    } catch (error) {
      console.error('Database connection failed:', error)
      throw error
    }
  }

  private static async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const tables = [
      `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        strength INTEGER NOT NULL,
        dexterity INTEGER NOT NULL,
        intelligence INTEGER NOT NULL,
        health INTEGER NOT NULL,
        max_health INTEGER NOT NULL,
        experience INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS game_states (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        character_id TEXT NOT NULL,
        current_room_id TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        visited_rooms TEXT DEFAULT '[]',
        game_data TEXT DEFAULT '{}',
        last_saved DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (character_id) REFERENCES characters (id)
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        game_state_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        FOREIGN KEY (game_state_id) REFERENCES game_states (id)
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        properties TEXT DEFAULT '{}',
        value INTEGER DEFAULT 0,
        weight INTEGER DEFAULT 0
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        exits TEXT DEFAULT '{}',
        items TEXT DEFAULT '[]',
        npcs TEXT DEFAULT '[]'
      )
      `,
      `
      CREATE TABLE IF NOT EXISTS npcs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        dialogue TEXT DEFAULT '{}',
        hostile BOOLEAN DEFAULT FALSE,
        health INTEGER DEFAULT NULL,
        max_health INTEGER DEFAULT NULL,
        level INTEGER DEFAULT NULL
      )
      `
    ]

    for (const table of tables) {
      this.db.exec(table)
    }
  }

  static getDb(): DatabaseSync {
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    return this.db
  }

  static async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}