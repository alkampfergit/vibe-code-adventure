import { CommandResult, GameState } from '../../../shared/types/index.js'
import { DatabaseService } from './DatabaseService.js'

export class CommandParser {
  static async parseAndExecute(gameStateId: string, command: string): Promise<CommandResult> {
    const normalizedCommand = command.toLowerCase().trim()
    const parts = normalizedCommand.split(' ')
    const action = parts[0]
    const target = parts.slice(1).join(' ')

    try {
      switch (action) {
        case 'look':
          return await this.handleLook(gameStateId)
        case 'inventory':
        case 'inv':
          return await this.handleInventory(gameStateId)
        case 'go':
          return await this.handleGo(gameStateId, target)
        case 'take':
        case 'get':
          return await this.handleTake(gameStateId, target)
        case 'help':
          return this.handleHelp()
        case 'score':
          return await this.handleScore(gameStateId)
        case 'save':
          return await this.handleSave(gameStateId)
        default:
          return {
            success: false,
            message: `I don't understand "${command}". Type "help" for available commands.`
          }
      }
    } catch (error) {
      console.error('Command execution error:', error)
      return {
        success: false,
        message: 'An error occurred while processing your command.'
      }
    }
  }

  private static async handleLook(gameStateId: string): Promise<CommandResult> {
    const db = DatabaseService.getDb()
    const gameState = db.prepare('SELECT * FROM game_states WHERE id = ?').get(gameStateId) as any
    
    if (!gameState) {
      return { success: false, message: 'Game state not found.' }
    }

    const currentRoom = gameState.current_room_id
    let description = `You are in the ${currentRoom}.`
    
    if (currentRoom === 'start_room') {
      description = `You find yourself in a dimly lit starting chamber. The walls are made of ancient stone, and there's a faint glow emanating from crystals embedded in the ceiling. You can see passages leading north and east.`
    }

    return {
      success: true,
      message: description
    }
  }

  private static async handleInventory(gameStateId: string): Promise<CommandResult> {
    const db = DatabaseService.getDb()
    const inventory = db.prepare(`
      SELECT ii.quantity, i.name, i.description
      FROM inventory_items ii
      JOIN items i ON ii.item_id = i.id
      WHERE ii.game_state_id = ?
    `).all(gameStateId)

    if (inventory.length === 0) {
      return {
        success: true,
        message: 'Your inventory is empty.'
      }
    }

    const itemList = inventory.map((item: any) => 
      `${item.name} (${item.quantity})`
    ).join(', ')

    return {
      success: true,
      message: `You are carrying: ${itemList}`
    }
  }

  private static async handleGo(gameStateId: string, direction: string): Promise<CommandResult> {
    if (!direction) {
      return { success: false, message: 'Go where? Specify a direction (north, south, east, west).' }
    }

    const db = DatabaseService.getDb()
    const gameState = db.prepare('SELECT * FROM game_states WHERE id = ?').get(gameStateId) as any

    if (!gameState) {
      return { success: false, message: 'Game state not found.' }
    }

    const currentRoom = gameState.current_room_id
    let newRoom: string | null = null
    let message = ''

    if (currentRoom === 'start_room') {
      switch (direction) {
        case 'north':
          newRoom = 'crystal_cavern'
          message = 'You walk north into a beautiful crystal cavern. The walls sparkle with embedded gems.'
          break
        case 'east':
          newRoom = 'dark_corridor'
          message = 'You head east down a dark, narrow corridor. The air feels cooler here.'
          break
        default:
          return { success: false, message: `You can't go ${direction} from here. Try north or east.` }
      }
    } else {
      return { success: false, message: `You can't go ${direction} from here.` }
    }

    if (newRoom) {
      const visitedRooms = JSON.parse(gameState.visited_rooms || '[]')
      if (!visitedRooms.includes(newRoom)) {
        visitedRooms.push(newRoom)
      }

      db.prepare(`
        UPDATE game_states 
        SET current_room_id = ?, visited_rooms = ?
        WHERE id = ?
      `).run(newRoom, JSON.stringify(visitedRooms), gameStateId)

      return {
        success: true,
        message,
        gameState: {
          currentRoomId: newRoom,
          visitedRooms
        }
      }
    }

    return { success: false, message: 'Something went wrong with your movement.' }
  }

  private static async handleTake(gameStateId: string, itemName: string): Promise<CommandResult> {
    if (!itemName) {
      return { success: false, message: 'Take what? Specify an item name.' }
    }

    return {
      success: false,
      message: `You don't see a "${itemName}" here.`
    }
  }

  private static handleHelp(): CommandResult {
    const helpText = `
Available commands:
- look: Examine your surroundings
- go [direction]: Move in a direction (north, south, east, west)
- take [item]: Pick up an item
- inventory (or inv): Check your items
- score: View your current score
- save: Save your progress
- help: Show this help message

Example: "go north" or "take sword"
    `.trim()

    return {
      success: true,
      message: helpText
    }
  }

  private static async handleScore(gameStateId: string): Promise<CommandResult> {
    const db = DatabaseService.getDb()
    const gameState = db.prepare('SELECT score FROM game_states WHERE id = ?').get(gameStateId) as any

    if (!gameState) {
      return { success: false, message: 'Game state not found.' }
    }

    return {
      success: true,
      message: `Your current score is: ${gameState.score} points.`
    }
  }

  private static async handleSave(gameStateId: string): Promise<CommandResult> {
    const db = DatabaseService.getDb()
    
    db.prepare(`
      UPDATE game_states 
      SET last_saved = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(gameStateId)

    return {
      success: true,
      message: 'Game saved successfully!'
    }
  }
}