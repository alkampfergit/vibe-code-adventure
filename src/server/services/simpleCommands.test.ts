import { CommandParser } from './commandParser';
import { GameEngine } from './gameEngine';
import { ParsedCommand } from '../types/command';

describe('Simple Commands (User Story gh19)', () => {
  let commandParser: CommandParser;
  let gameEngine: GameEngine;
  const testSessionId = 'simple-commands-test';

  beforeEach(() => {
    commandParser = new CommandParser();
    gameEngine = new GameEngine();
  });

  describe('Acceptance Criteria: Single-word commands work at any time', () => {
    test('should handle "inventory" command', () => {
      const parsed = commandParser.parse('inventory');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(parsed.isValid).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('inventory');
    });

    test('should handle "inv" command as inventory shortcut', () => {
      const parsed = commandParser.parse('inv');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(parsed.isValid).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('inventory');
    });

    test('should handle "i" command as inventory shortcut', () => {
      const parsed = commandParser.parse('i');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(parsed.isValid).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('inventory');
    });

    test('should handle "look" command', () => {
      const parsed = commandParser.parse('look');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(parsed.isValid).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('You are in');
    });

    test('should handle "help" command', () => {
      const parsed = commandParser.parse('help');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(parsed.isValid).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Available commands');
    });

    test('should handle "commands" command', () => {
      const parsed = commandParser.parse('commands');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(parsed.isValid).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Available commands');
    });

    test('should handle "score" command', () => {
      const parsed = commandParser.parse('score');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(parsed.isValid).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('score');
      expect(result.data?.score).toBeDefined();
    });

    test('should handle "quit" command', () => {
      const parsed = commandParser.parse('quit');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(parsed.isValid).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Thanks for playing');
    });

    test('should handle "exit" command', () => {
      const parsed = commandParser.parse('exit');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(parsed.isValid).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Thanks for playing');
    });

    test('should handle "save" command', () => {
      const parsed = commandParser.parse('save');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(parsed.isValid).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('saved');
    });

    test('should handle "load" command', () => {
      const parsed = commandParser.parse('load');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(parsed.isValid).toBe(true);
      expect(result.success).toBe(true);
      expect(result.message).toContain('loaded');
    });
  });

  describe('Acceptance Criteria: Case-insensitive commands', () => {
    test('should handle uppercase commands', () => {
      const testCases = ['INVENTORY', 'LOOK', 'HELP', 'SCORE', 'QUIT'];
      
      testCases.forEach(command => {
        const parsed = commandParser.parse(command);
        const result = gameEngine.executeCommand(testSessionId, parsed);
        
        expect(parsed.isValid).toBe(true);
        expect(result.success).toBe(true);
      });
    });

    test('should handle mixed case commands', () => {
      const testCases = ['InVeNtOrY', 'LoOk', 'HeLp', 'ScOrE'];
      
      testCases.forEach(command => {
        const parsed = commandParser.parse(command);
        const result = gameEngine.executeCommand(testSessionId, parsed);
        
        expect(parsed.isValid).toBe(true);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Acceptance Criteria: Appropriate responses with relevant information', () => {
    test('should provide relevant inventory information', () => {
      // Test empty inventory
      const emptyResult = gameEngine.executeCommand(testSessionId, commandParser.parse('inventory'));
      expect(emptyResult.message).toContain('empty');

      // Add items and test inventory with items
      gameEngine.updateGameState(testSessionId, { inventory: ['sword', 'shield'] });
      const fullResult = gameEngine.executeCommand(testSessionId, commandParser.parse('inventory'));
      expect(fullResult.message).toContain('sword');
      expect(fullResult.message).toContain('shield');
      expect(fullResult.data?.inventory).toEqual(['sword', 'shield']);
    });

    test('should provide relevant room description for look', () => {
      const result = gameEngine.executeCommand(testSessionId, commandParser.parse('look'));
      
      expect(result.message).toContain('You are in');
      expect(result.message).toContain('room');
    });

    test('should provide comprehensive help information', () => {
      const result = gameEngine.executeCommand(testSessionId, commandParser.parse('help'));
      
      expect(result.message).toContain('go');
      expect(result.message).toContain('take');
      expect(result.message).toContain('drop');
      expect(result.message).toContain('look');
      expect(result.message).toContain('inventory');
      expect(result.message).toContain('Example');
    });

    test('should provide current score information', () => {
      // Test default score
      const defaultResult = gameEngine.executeCommand(testSessionId, commandParser.parse('score'));
      expect(defaultResult.message).toContain('0 points');
      expect(defaultResult.data?.score).toBe(0);

      // Test updated score
      gameEngine.updateGameState(testSessionId, { score: 50 });
      const updatedResult = gameEngine.executeCommand(testSessionId, commandParser.parse('score'));
      expect(updatedResult.message).toContain('50 points');
      expect(updatedResult.data?.score).toBe(50);
    });
  });

  describe('Acceptance Criteria: Commands work at any time during gameplay', () => {
    test('should work after performing other actions', () => {
      // Perform some actions first
      gameEngine.executeCommand(testSessionId, commandParser.parse('take sword'));
      gameEngine.executeCommand(testSessionId, commandParser.parse('go north'));
      
      // Simple commands should still work
      const inventoryResult = gameEngine.executeCommand(testSessionId, commandParser.parse('inventory'));
      expect(inventoryResult.success).toBe(true);
      expect(inventoryResult.message).toContain('sword');

      const lookResult = gameEngine.executeCommand(testSessionId, commandParser.parse('look'));
      expect(lookResult.success).toBe(true);

      const scoreResult = gameEngine.executeCommand(testSessionId, commandParser.parse('score'));
      expect(scoreResult.success).toBe(true);
    });

    test('should work regardless of game state', () => {
      // Modify game state
      gameEngine.updateGameState(testSessionId, {
        score: 100,
        inventory: ['magic sword', 'health potion', 'gold coin'],
        currentRoom: 'dungeon_level_2'
      });

      // All simple commands should work
      const simpleCommands = ['inventory', 'look', 'help', 'score', 'i', 'inv'];
      
      simpleCommands.forEach(command => {
        const result = gameEngine.executeCommand(testSessionId, commandParser.parse(command));
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Easy to remember and intuitive commands', () => {
    test('should support multiple intuitive shortcuts for inventory', () => {
      const shortcuts = ['inventory', 'inv', 'i'];
      
      shortcuts.forEach(shortcut => {
        const parsed = commandParser.parse(shortcut);
        expect(parsed.isValid).toBe(true);
        expect(parsed.verb).toBe('inventory'); // All map to canonical 'inventory'
      });
    });

    test('should support both help and commands for assistance', () => {
      const helpCommands = ['help', 'commands'];
      
      helpCommands.forEach(command => {
        const parsed = commandParser.parse(command);
        expect(parsed.verb).toBe('help'); // Both map to canonical 'help'
        const result = gameEngine.executeCommand(testSessionId, parsed);
        expect(result.success).toBe(true);
        expect(result.message).toContain('Available commands');
      });
    });

    test('should support both quit and exit for leaving game', () => {
      const exitCommands = ['quit', 'exit'];
      
      exitCommands.forEach(command => {
        const parsed = commandParser.parse(command);
        expect(parsed.verb).toBe('quit'); // Both map to canonical 'quit'
        const result = gameEngine.executeCommand(testSessionId, parsed);
        expect(result.success).toBe(true);
        expect(result.message).toContain('Thanks for playing');
      });
    });
  });
});