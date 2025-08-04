import { ParsedCommand, CommandResult, GameState } from '../types/command';

export class GameEngine {
  private gameStates: Map<string, GameState> = new Map();

  constructor() {
    // Initialize with default state
  }

  getGameState(sessionId: string): GameState {
    if (!this.gameStates.has(sessionId)) {
      this.gameStates.set(sessionId, {
        currentRoom: 'starting_room',
        inventory: [],
        score: 0,
        playerName: ''
      });
    }
    return this.gameStates.get(sessionId)!;
  }

  updateGameState(sessionId: string, state: Partial<GameState>): void {
    const currentState = this.getGameState(sessionId);
    this.gameStates.set(sessionId, { ...currentState, ...state });
  }

  executeCommand(sessionId: string, command: ParsedCommand): CommandResult {
    if (!command.isValid) {
      return {
        success: false,
        message: `I don't understand "${command.originalInput}". Try typing "help" for available commands.`
      };
    }

    const gameState = this.getGameState(sessionId);

    switch (command.verb) {
      case 'go':
      case 'move':
      case 'walk':
        return this.handleMovement(sessionId, command, gameState);

      case 'take':
      case 'get':
      case 'pick':
        return this.handleTake(sessionId, command, gameState);

      case 'drop':
      case 'put':
        return this.handleDrop(sessionId, command, gameState);

      case 'look':
      case 'examine':
      case 'inspect':
        return this.handleLook(sessionId, command, gameState);

      case 'inventory':
      case 'inv':
        return this.handleInventory(sessionId, gameState);

      case 'help':
      case 'commands':
        return this.handleHelp();

      default:
        return {
          success: false,
          message: `I don't know how to "${command.verb}".`
        };
    }
  }

  private handleMovement(sessionId: string, command: ParsedCommand, gameState: GameState): CommandResult {
    if (!command.noun) {
      return {
        success: false,
        message: "Where do you want to go? Try 'go north' or 'go south'."
      };
    }

    // Basic movement logic - this will be expanded with actual room system
    const direction = command.noun;
    const validDirections = ['north', 'south', 'east', 'west', 'up', 'down'];
    
    if (!validDirections.includes(direction)) {
      return {
        success: false,
        message: `You can't go ${direction}. Valid directions are: ${validDirections.join(', ')}.`
      };
    }

    // For now, just acknowledge the movement without actually changing rooms
    return {
      success: true,
      message: `You move ${direction}.`,
      data: { direction }
    };
  }

  private handleTake(sessionId: string, command: ParsedCommand, gameState: GameState): CommandResult {
    if (!command.noun) {
      return {
        success: false,
        message: "What do you want to take?"
      };
    }

    const item = command.noun;
    
    // For now, simulate taking an item
    if (gameState.inventory.includes(item)) {
      return {
        success: false,
        message: `You already have the ${item}.`
      };
    }

    // Add to inventory
    gameState.inventory.push(item);
    this.updateGameState(sessionId, { inventory: gameState.inventory });

    return {
      success: true,
      message: `You take the ${item}.`,
      data: { item }
    };
  }

  private handleDrop(sessionId: string, command: ParsedCommand, gameState: GameState): CommandResult {
    if (!command.noun) {
      return {
        success: false,
        message: "What do you want to drop?"
      };
    }

    const item = command.noun;
    const itemIndex = gameState.inventory.indexOf(item);
    
    if (itemIndex === -1) {
      return {
        success: false,
        message: `You don't have a ${item}.`
      };
    }

    // Remove from inventory
    gameState.inventory.splice(itemIndex, 1);
    this.updateGameState(sessionId, { inventory: gameState.inventory });

    return {
      success: true,
      message: `You drop the ${item}.`,
      data: { item }
    };
  }

  private handleLook(sessionId: string, command: ParsedCommand, gameState: GameState): CommandResult {
    if (command.noun) {
      return {
        success: true,
        message: `You examine the ${command.noun}. It looks ordinary.`
      };
    }

    // Look around the current room
    return {
      success: true,
      message: `You are in the ${gameState.currentRoom.replace('_', ' ')}. This is a simple room with exits to the north, south, east, and west.`
    };
  }

  private handleInventory(sessionId: string, gameState: GameState): CommandResult {
    if (gameState.inventory.length === 0) {
      return {
        success: true,
        message: "Your inventory is empty."
      };
    }

    return {
      success: true,
      message: `You are carrying: ${gameState.inventory.join(', ')}.`,
      data: { inventory: gameState.inventory }
    };
  }

  private handleHelp(): CommandResult {
    const helpText = `
Available commands:
- go <direction>: Move in a direction (north, south, east, west, up, down)
- take <item>: Pick up an item
- drop <item>: Drop an item from your inventory
- look [item]: Look around or examine something
- inventory: Check what you're carrying
- help: Show this help message

Example: "go north", "take key", "look sword"
    `.trim();

    return {
      success: true,
      message: helpText
    };
  }
}