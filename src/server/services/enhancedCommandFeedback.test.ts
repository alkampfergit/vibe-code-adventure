import { GameEngine } from './gameEngine';
import { CommandParser } from './commandParser';

describe('Enhanced Command Feedback Integration (User Story gh17)', () => {
  let gameEngine: GameEngine;
  let commandParser: CommandParser;
  const testSessionId = 'feedback-test-session';

  beforeEach(() => {
    gameEngine = new GameEngine();
    commandParser = new CommandParser();
  });

  describe('End-to-end feedback for invalid commands', () => {
    test('should provide helpful feedback for completely invalid commands', () => {
      const parsed = commandParser.parse('blargify');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain("I don't understand");
      expect(result.message).toContain('blargify');
      expect(result.message).toContain('Try commands like');
    });

    test('should suggest corrections for common misspellings', () => {
      const parsed = commandParser.parse('tak sword');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Did you mean');
      expect(result.message).toContain('take sword');
    });

    test('should provide contextual help for movement-related typos', () => {
      const parsed = commandParser.parse('travel');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('movement');
      expect(result.message).toContain('go north');
    });
  });

  describe('Enhanced feedback for valid commands with issues', () => {
    test('should provide better feedback for movement without direction', () => {
      const parsed = commandParser.parse('go');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Where do you want to go?');
      expect(result.message).toContain('go north');
      expect(result.message).toContain('go south');
      expect(result.message).toContain('go east');
      expect(result.message).toContain('go west');
    });

    test('should handle direction shortcuts and variations', () => {
      const shortcuts = ['n', 's', 'e', 'w', 'u', 'd'];
      
      shortcuts.forEach(shortcut => {
        const parsed = commandParser.parse(`go ${shortcut}`);
        const result = gameEngine.executeCommand(testSessionId, parsed);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('You move');
      });
    });

    test('should provide feedback for invalid directions with suggestions', () => {
      const parsed = commandParser.parse('go diagonal');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain("You can't go \"diagonal\"");
      expect(result.message).toContain('Valid directions are');
      expect(result.message).toContain('short forms');
    });

    test('should provide better feedback for take without item', () => {
      const parsed = commandParser.parse('take');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('What do you want to take?');
      expect(result.message).toContain('take key');
      expect(result.message).toContain('look');
    });

    test('should provide better feedback for drop without item', () => {
      const parsed = commandParser.parse('drop');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('What do you want to drop?');
      expect(result.message).toContain('inventory');
    });
  });

  describe('Acceptance criteria validation', () => {
    test('should detect when commands are not understood', () => {
      const invalidCommands = ['xyz', 'flibber', 'nonexistentcommand', '123'];
      
      invalidCommands.forEach(cmd => {
        const parsed = commandParser.parse(cmd);
        const result = gameEngine.executeCommand(testSessionId, parsed);
        
        expect(result.success).toBe(false);
        expect(result.message).toContain("I don't understand");
      });
    });

    test('should always provide clear messages for unrecognized input', () => {
      const testInputs = ['random', 'gibberish123', 'totally invalid input'];
      
      testInputs.forEach(input => {
        const parsed = commandParser.parse(input);
        const result = gameEngine.executeCommand(testSessionId, parsed);
        
        expect(result.success).toBe(false);
        expect(result.message.length).toBeGreaterThan(10);
        expect(result.message).toMatch(/don't understand|not recognized|invalid/i);
      });
    });

    test('should include suggestions or examples in all error messages', () => {
      const testInputs = ['badcommand', 'xyz', 'flibbergibbet'];
      
      testInputs.forEach(input => {
        const parsed = commandParser.parse(input);
        const result = gameEngine.executeCommand(testSessionId, parsed);
        
        expect(result.success).toBe(false);
        
        // Should contain at least one of these suggestion patterns
        const hasSuggestion = result.message.includes('Try') ||
                            result.message.includes('Did you mean') ||
                            result.message.includes('help') ||
                            result.message.includes('commands like');
        
        expect(hasSuggestion).toBe(true);
      });
    });
  });

  describe('User experience improvements', () => {
    test('should maintain helpful tone in error messages', () => {
      const parsed = commandParser.parse('invalidstuff');
      const result = gameEngine.executeCommand(testSessionId, parsed);
      
      expect(result.success).toBe(false);
      
      // Should not contain harsh or confusing language
      expect(result.message).not.toMatch(/error|fail|wrong|bad|stupid/i);
      
      // Should contain helpful language
      expect(result.message).toMatch(/try|help|command|suggest/i);
    });

    test('should provide contextually relevant suggestions', () => {
      // Test movement context
      const movementParsed = commandParser.parse('travel somewhere');
      const movementResult = gameEngine.executeCommand(testSessionId, movementParsed);
      expect(movementResult.message).toContain('movement');
      
      // Test item context
      const itemParsed = commandParser.parse('grab something');
      const itemResult = gameEngine.executeCommand(testSessionId, itemParsed);
      expect(itemResult.message).toContain('items');
    });

    test('should handle case insensitive feedback', () => {
      const upperCase = commandParser.parse('INVALID');
      const lowerCase = commandParser.parse('invalid');
      const mixedCase = commandParser.parse('InVaLiD');
      
      const upperResult = gameEngine.executeCommand(testSessionId, upperCase);
      const lowerResult = gameEngine.executeCommand(testSessionId, lowerCase);
      const mixedResult = gameEngine.executeCommand(testSessionId, mixedCase);
      
      // All should get similar helpful feedback
      expect(upperResult.success).toBe(false);
      expect(lowerResult.success).toBe(false);
      expect(mixedResult.success).toBe(false);
      
      expect(upperResult.message).toContain("I don't understand");
      expect(lowerResult.message).toContain("I don't understand");
      expect(mixedResult.message).toContain("I don't understand");
    });
  });
});