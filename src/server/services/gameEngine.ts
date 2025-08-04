import { ParsedCommand, CommandResult, GameState } from '../types/command';
import { CommandFeedback } from './commandFeedback';
import { CommandParser } from './commandParser';

export class GameEngine {
  private gameStates: Map<string, GameState> = new Map();
  private commandFeedback: CommandFeedback;
  private commandParser: CommandParser;

  constructor(commandParser?: CommandParser) {
    this.commandFeedback = new CommandFeedback();
    this.commandParser = commandParser || new CommandParser();
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
        message: this.commandFeedback.generateFeedback(command)
      };
    }

    const gameState = this.getGameState(sessionId);

    switch (command.verb) {
      case 'go':
        return this.handleMovement(sessionId, command, gameState);

      case 'take':
        return this.handleTake(sessionId, command, gameState);

      case 'drop':
        return this.handleDrop(sessionId, command, gameState);

      case 'look':
        return this.handleLook(sessionId, command, gameState);

      case 'inventory':
        return this.handleInventory(sessionId, gameState);

      case 'help':
        return this.handleHelp();

      case 'quit':
        return this.handleQuit();

      case 'score':
        return this.handleScore(sessionId, gameState);

      case 'save':
        return this.handleSave(sessionId, gameState);

      case 'load':
        return this.handleLoad(sessionId, command);

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
        message: "Where do you want to go? Try 'go north', 'go south', 'go east', 'go west', 'go up', or 'go down'."
      };
    }

    // Basic movement logic - this will be expanded with actual room system
    const direction = command.noun.toLowerCase();
    const validDirections = ['north', 'south', 'east', 'west', 'up', 'down'];
    
    if (!validDirections.includes(direction)) {
      // Check for common direction variations and typos
      const directionMappings: Record<string, string> = {
        'n': 'north', 'no': 'north', 'nor': 'north',
        's': 'south', 'so': 'south', 'sou': 'south',
        'e': 'east', 'ea': 'east', 'eas': 'east',
        'w': 'west', 'we': 'west', 'wes': 'west',
        'u': 'up', 'upward': 'up', 'upwards': 'up',
        'd': 'down', 'downward': 'down', 'downwards': 'down'
      };

      if (directionMappings[direction]) {
        const correctedDirection = directionMappings[direction];
        return {
          success: true,
          message: `You move ${correctedDirection}.`,
          data: { direction: correctedDirection }
        };
      }

      return {
        success: false,
        message: `You can't go "${direction}". Valid directions are: ${validDirections.join(', ')}. You can also use short forms like 'n', 's', 'e', 'w'.`
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
        message: "What do you want to take? Try 'take key', 'take sword', or 'take coin'. Use 'look' to see what's available."
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
        message: "What do you want to drop? Try 'drop sword' or 'drop key'. Use 'inventory' to see what you're carrying."
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
    const synonyms = this.commandParser.getSynonyms();
    
    const buildCommandWithSynonyms = (command: string, description: string, syntax?: string) => {
      const commandSynonyms = synonyms[command] || [];
      const synonymsList = commandSynonyms.length > 0 ? ` (${commandSynonyms.join(', ')})` : '';
      const fullSyntax = syntax ? `${command} ${syntax}` : command;
      return `- ${fullSyntax}${synonymsList}: ${description}`;
    };

    const helpText = `
Available commands:
${buildCommandWithSynonyms('go', 'Move in a direction (north, south, east, west, up, down)', '<direction>')}
${buildCommandWithSynonyms('take', 'Pick up an item', '<item>')}
${buildCommandWithSynonyms('drop', 'Drop an item from your inventory', '<item>')}
${buildCommandWithSynonyms('look', 'Look around or examine something', '[item]')}
${buildCommandWithSynonyms('inventory', 'Check what you are carrying')}
${buildCommandWithSynonyms('score', 'View your current score')}
${buildCommandWithSynonyms('help', 'Show this help message')}
${buildCommandWithSynonyms('quit', 'Exit the game')}
${buildCommandWithSynonyms('save', 'Save your progress')}
${buildCommandWithSynonyms('load', 'Load saved progress')}

Examples: "go north", "grab key", "examine sword", "items"
You can use any of the synonyms shown in parentheses interchangeably.
    `.trim();

    return {
      success: true,
      message: helpText
    };
  }

  private handleQuit(): CommandResult {
    return {
      success: true,
      message: "Thanks for playing! Your progress has been automatically saved."
    };
  }

  private handleScore(sessionId: string, gameState: GameState): CommandResult {
    return {
      success: true,
      message: `Your current score is ${gameState.score} points.`,
      data: { score: gameState.score }
    };
  }

  private handleSave(sessionId: string, gameState: GameState): CommandResult {
    // For now, just simulate saving since state is already persistent per session
    return {
      success: true,
      message: "Game saved successfully!"
    };
  }

  private handleLoad(sessionId: string, command: ParsedCommand): CommandResult {
    // For now, just acknowledge the load command
    return {
      success: true,
      message: "Game loaded successfully! (Your progress is automatically maintained per session)"
    };
  }
}