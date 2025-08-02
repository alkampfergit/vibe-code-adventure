import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { DatabaseService } from '../services/DatabaseService.js'
import { User } from '../../../shared/types/index.js'

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.body

      if (!username || typeof username !== 'string') {
        res.status(400).json({ error: 'Username is required' })
        return
      }

      const db = DatabaseService.getDb()
      
      let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined

      if (!user) {
        const userId = uuidv4()
        db.prepare('INSERT INTO users (id, username) VALUES (?, ?)').run(userId, username)
        user = { id: userId, username, createdAt: new Date() }
      }

      res.json(user)
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.json({ message: 'Logged out successfully' })
  }
}