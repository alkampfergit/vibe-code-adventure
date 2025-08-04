import { GameEngine } from './gameEngine';
import { ParsedCommand } from '../types/command';

describe('GameEngine', () => {
  let gameEngine: GameEngine;
  const testSessionId = 'test-session-123';

  beforeEach(() => {
    gameEngine = new GameEngine();
  });

  describe('getGameState', () => {
    test('should create default game state for new session', () => {
      const state = gameEngine.getGameState(testSessionId);
      
      expect(state.currentRoom).toBe('starting_room');
      expect(state.inventory).toEqual([]);
      expect(state.score).toBe(0);
      expect(state.playerName).toBe('');
    });

    test('should return same state for same session', () => {
      const state1 = gameEngine.getGameState(testSessionId);
      const state2 = gameEngine.getGameState(testSessionId);
      
      expect(state1).toBe(state2);
    });
  });

  describe('updateGameState', () => {
    test('should update specific fields', () => {
      gameEngine.updateGameState(testSessionId, { score: 10, playerName: 'Hero' });
      const state = gameEngine.getGameState(testSessionId);
      
      expect(state.score).toBe(10);
      expect(state.playerName).toBe('Hero');
      expect(state.currentRoom).toBe('starting_room'); // Unchanged
      expect(state.inventory).toEqual([]); // Unchanged
    });
  });

  describe('executeCommand', () => {
    test('should handle invalid commands', () => {
      const command: ParsedCommand = {
        verb: 'fly',
        noun: 'north',
        originalInput: 'fly north',
        isValid: false
      };

      const result = gameEngine.executeCommand(testSessionId, command);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain("I don't understand");
    });

    describe('movement commands', () => {
      test('should handle go command with direction', () => {
        const command: ParsedCommand = {
          verb: 'go',
          noun: 'north',
          originalInput: 'go north',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('You move north');
        expect(result.data?.direction).toBe('north');
      });

      test('should handle move command with direction', () => {
        const command: ParsedCommand = {
          verb: 'move',
          noun: 'south',
          originalInput: 'move south',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('You move south');
      });

      test('should reject go command without direction', () => {
        const command: ParsedCommand = {
          verb: 'go',
          originalInput: 'go',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(false);
        expect(result.message).toContain('Where do you want to go?');
      });

      test('should reject invalid directions', () => {
        const command: ParsedCommand = {
          verb: 'go',
          noun: 'diagonal',
          originalInput: 'go diagonal',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(false);
        expect(result.message).toContain("You can't go \"diagonal\"");
      });

      test('should accept all valid directions', () => {
        const validDirections = ['north', 'south', 'east', 'west', 'up', 'down'];
        
        validDirections.forEach(direction => {
          const command: ParsedCommand = {
            verb: 'go',
            noun: direction,
            originalInput: `go ${direction}`,
            isValid: true
          };

          const result = gameEngine.executeCommand(testSessionId, command);
          expect(result.success).toBe(true);
          expect(result.message).toContain(`You move ${direction}`);
        });
      });
    });

    describe('take commands', () => {
      test('should handle take command with item', () => {
        const command: ParsedCommand = {
          verb: 'take',
          noun: 'sword',
          originalInput: 'take sword',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('You take the sword');
        
        // Check item is added to inventory
        const state = gameEngine.getGameState(testSessionId);
        expect(state.inventory).toContain('sword');
      });

      test('should handle get command as synonym for take', () => {
        const command: ParsedCommand = {
          verb: 'get',
          noun: 'key',
          originalInput: 'get key',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('You take the key');
      });

      test('should reject taking item already in inventory', () => {
        // First take
        const command1: ParsedCommand = {
          verb: 'take',
          noun: 'gem',
          originalInput: 'take gem',
          isValid: true
        };
        gameEngine.executeCommand(testSessionId, command1);

        // Try to take again
        const command2: ParsedCommand = {
          verb: 'take',
          noun: 'gem',
          originalInput: 'take gem',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command2);
        
        expect(result.success).toBe(false);
        expect(result.message).toContain('You already have the gem');
      });

      test('should reject take command without item', () => {
        const command: ParsedCommand = {
          verb: 'take',
          originalInput: 'take',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(false);
        expect(result.message).toContain('What do you want to take?');
      });
    });

    describe('drop commands', () => {
      test('should handle drop command for item in inventory', () => {
        // First add item to inventory
        gameEngine.updateGameState(testSessionId, { inventory: ['book'] });

        const command: ParsedCommand = {
          verb: 'drop',
          noun: 'book',
          originalInput: 'drop book',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('You drop the book');
        
        // Check item is removed from inventory
        const state = gameEngine.getGameState(testSessionId);
        expect(state.inventory).not.toContain('book');
      });

      test('should reject dropping item not in inventory', () => {
        const command: ParsedCommand = {
          verb: 'drop',
          noun: 'nonexistent',
          originalInput: 'drop nonexistent',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(false);
        expect(result.message).toContain("You don't have a nonexistent");
      });

      test('should reject drop command without item', () => {
        const command: ParsedCommand = {
          verb: 'drop',
          originalInput: 'drop',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(false);
        expect(result.message).toContain('What do you want to drop?');
      });
    });

    describe('look commands', () => {
      test('should handle look around (no noun)', () => {
        const command: ParsedCommand = {
          verb: 'look',
          originalInput: 'look',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('You are in the starting room');
      });

      test('should handle examine item', () => {
        const command: ParsedCommand = {
          verb: 'examine',
          noun: 'table',
          originalInput: 'examine table',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('You examine the table');
      });
    });

    describe('inventory commands', () => {
      test('should show empty inventory', () => {
        const command: ParsedCommand = {
          verb: 'inventory',
          originalInput: 'inventory',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('Your inventory is empty');
      });

      test('should show inventory with items', () => {
        gameEngine.updateGameState(testSessionId, { inventory: ['sword', 'potion'] });

        const command: ParsedCommand = {
          verb: 'inv',
          originalInput: 'inv',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('You are carrying: sword, potion');
        expect(result.data?.inventory).toEqual(['sword', 'potion']);
      });

      test('should handle "i" shortcut for inventory', () => {
        gameEngine.updateGameState(testSessionId, { inventory: ['magic wand'] });

        const command: ParsedCommand = {
          verb: 'i',
          originalInput: 'i',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('You are carrying: magic wand');
      });
    });

    describe('help commands', () => {
      test('should show help text', () => {
        const command: ParsedCommand = {
          verb: 'help',
          originalInput: 'help',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('Available commands:');
        expect(result.message).toContain('go <direction>');
        expect(result.message).toContain('take <item>');
      });

      test('should show help text for commands verb', () => {
        const command: ParsedCommand = {
          verb: 'commands',
          originalInput: 'commands',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('Available commands:');
      });
    });

    describe('score commands', () => {
      test('should show current score', () => {
        const command: ParsedCommand = {
          verb: 'score',
          originalInput: 'score',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('Your current score is 0 points');
        expect(result.data?.score).toBe(0);
      });

      test('should show updated score', () => {
        gameEngine.updateGameState(testSessionId, { score: 25 });

        const command: ParsedCommand = {
          verb: 'score',
          originalInput: 'score',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('Your current score is 25 points');
        expect(result.data?.score).toBe(25);
      });
    });

    describe('quit commands', () => {
      test('should handle quit command', () => {
        const command: ParsedCommand = {
          verb: 'quit',
          originalInput: 'quit',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('Thanks for playing');
      });

      test('should handle exit command', () => {
        const command: ParsedCommand = {
          verb: 'exit',
          originalInput: 'exit',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('Thanks for playing');
      });
    });

    describe('save/load commands', () => {
      test('should handle save command', () => {
        const command: ParsedCommand = {
          verb: 'save',
          originalInput: 'save',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('saved successfully');
      });

      test('should handle load command', () => {
        const command: ParsedCommand = {
          verb: 'load',
          originalInput: 'load',
          isValid: true
        };

        const result = gameEngine.executeCommand(testSessionId, command);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('loaded successfully');
      });
    });
  });
});