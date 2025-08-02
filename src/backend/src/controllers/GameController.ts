import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { DatabaseService } from '../services/DatabaseService.js'
import { CommandParser } from '../services/CommandParser.js'
import { GameState, Character, CommandResult } from '../../../shared/types/index.js'

export class GameController {
  static async createCharacter(req: Request, res: Response): Promise<void> {
    try {
      const { userId, name, strength, dexterity, intelligence } = req.body

      if (!userId || !name) {
        res.status(400).json({ error: 'User ID and character name are required' })
        return
      }

      const db = DatabaseService.getDb()
      const characterId = uuidv4()
      const gameStateId = uuidv4()

      const health = strength * 10
      
      db.prepare(`
        INSERT INTO characters (id, user_id, name, strength, dexterity, intelligence, health, max_health)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(characterId, userId, name, strength, dexterity, intelligence, health, health)

      const gameState: GameState = {
        id: gameStateId,
        userId,
        characterId,
        currentRoomId: 'start_room',
        inventory: [],
        score: 0,
        visitedRooms: ['start_room'],
        gameData: {},
        lastSaved: new Date()
      }

      db.prepare(`
        INSERT INTO game_states (id, user_id, character_id, current_room_id, score, visited_rooms, game_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        gameStateId,
        userId,
        characterId,
        gameState.currentRoomId,
        gameState.score,
        JSON.stringify(gameState.visitedRooms),
        JSON.stringify(gameState.gameData)
      )

      res.json(gameState)
    } catch (error) {
      console.error('Create character error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async getGameState(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params
      const db = DatabaseService.getDb()

      const gameState = db.prepare(`
        SELECT gs.*, c.name as character_name
        FROM game_states gs
        JOIN characters c ON gs.character_id = c.id
        WHERE gs.user_id = ?
        ORDER BY gs.last_saved DESC
        LIMIT 1
      `).get(userId) as any

      if (!gameState) {
        res.status(404).json({ error: 'No game state found' })
        return
      }

      const inventory = db.prepare(`
        SELECT ii.*, i.name, i.description, i.type, i.properties
        FROM inventory_items ii
        JOIN items i ON ii.item_id = i.id
        WHERE ii.game_state_id = ?
      `).all(gameState.id)

      const result: GameState = {
        id: gameState.id,
        userId: gameState.user_id,
        characterId: gameState.character_id,
        currentRoomId: gameState.current_room_id,
        inventory: inventory.map((item: any) => ({
          itemId: item.item_id,
          quantity: item.quantity,
          item: {
            id: item.item_id,
            name: item.name,
            description: item.description,
            type: item.type,
            properties: JSON.parse(item.properties || '{}')
          }
        })),
        score: gameState.score,
        visitedRooms: JSON.parse(gameState.visited_rooms || '[]'),
        gameData: JSON.parse(gameState.game_data || '{}'),
        lastSaved: new Date(gameState.last_saved)
      }

      res.json(result)
    } catch (error) {
      console.error('Get game state error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async saveGame(req: Request, res: Response): Promise<void> {
    try {
      const gameState: GameState = req.body
      const db = DatabaseService.getDb()

      db.prepare(`
        UPDATE game_states 
        SET current_room_id = ?, score = ?, visited_rooms = ?, game_data = ?, last_saved = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        gameState.currentRoomId,
        gameState.score,
        JSON.stringify(gameState.visitedRooms),
        JSON.stringify(gameState.gameData),
        gameState.id
      )

      res.json({ message: 'Game saved successfully' })
    } catch (error) {
      console.error('Save game error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  static async executeCommand(req: Request, res: Response): Promise<void> {
    try {
      const { gameStateId, command } = req.body
      
      if (!gameStateId || !command) {
        res.status(400).json({ error: 'Game state ID and command are required' })
        return
      }

      const result = await CommandParser.parseAndExecute(gameStateId, command)
      res.json(result)
    } catch (error) {
      console.error('Execute command error:', error)
      res.status(500).json({ 
        error: 'Command execution failed',
        success: false,
        message: 'An error occurred while processing your command.'
      } as CommandResult)
    }
  }
}