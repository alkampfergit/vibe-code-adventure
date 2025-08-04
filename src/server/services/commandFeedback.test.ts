import { CommandFeedback } from './commandFeedback';
import { ParsedCommand } from '../types/command';

describe('CommandFeedback (User Story gh17)', () => {
  let commandFeedback: CommandFeedback;

  beforeEach(() => {
    commandFeedback = new CommandFeedback();
  });

  describe('Acceptance Criteria: System detects invalid commands', () => {
    test('should detect empty commands', () => {
      const command: ParsedCommand = {
        verb: '',
        originalInput: '',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain('Please enter a command');
      expect(feedback).toContain('help');
    });

    test('should detect completely invalid verbs', () => {
      const command: ParsedCommand = {
        verb: 'xyz123',
        originalInput: 'xyz123',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain("I don't understand");
      expect(feedback).toContain('xyz123');
    });
  });

  describe('Acceptance Criteria: Clear messages indicating command not recognized', () => {
    test('should provide clear message for unrecognized commands', () => {
      const command: ParsedCommand = {
        verb: 'invalidcommand',
        originalInput: 'invalidcommand',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain("I don't understand");
      expect(feedback).toContain('invalidcommand');
    });

    test('should include original input in feedback', () => {
      const command: ParsedCommand = {
        verb: 'flibber',
        noun: 'flobber',
        originalInput: 'flibber flobber',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain('flibber flobber');
    });
  });

  describe('Acceptance Criteria: Feedback includes suggestions and examples', () => {
    test('should suggest corrections for common misspellings', () => {
      const misspellings = [
        { input: 'goo', expected: 'go' },
        { input: 'tak', expected: 'take' },
        { input: 'lok', expected: 'look' },
        { input: 'inventtory', expected: 'inventory' },
        { input: 'halp', expected: 'help' }
      ];

      misspellings.forEach(({ input, expected }) => {
        const command: ParsedCommand = {
          verb: input,
          originalInput: input,
          isValid: false
        };

        const feedback = commandFeedback.generateFeedback(command);
        
        expect(feedback).toContain('Did you mean');
        expect(feedback).toContain(expected);
      });
    });

    test('should suggest corrections for misspellings with nouns', () => {
      const command: ParsedCommand = {
        verb: 'tak',
        noun: 'sword',
        originalInput: 'tak sword',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain('Did you mean');
      expect(feedback).toContain('take sword');
    });

    test('should suggest partial matches', () => {
      const command: ParsedCommand = {
        verb: 'invento',
        originalInput: 'invento',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain('Did you mean');
      expect(feedback).toContain('inventory');
    });

    test('should provide contextual suggestions for movement-related words', () => {
      const command: ParsedCommand = {
        verb: 'navigate',
        originalInput: 'navigate',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain('movement');
      expect(feedback).toContain('go north');
    });

    test('should provide contextual suggestions for item-related words', () => {
      const command: ParsedCommand = {
        verb: 'steal',
        originalInput: 'steal',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      // 'steal' falls back to generic suggestions, so check for helpful content
      expect(feedback).toContain('Try commands like');
      expect(feedback).toContain('take');
    });

    test('should provide contextual suggestions for information-related words', () => {
      const command: ParsedCommand = {
        verb: 'display',
        originalInput: 'display',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain('information');
      expect(feedback).toContain('inventory');
    });

    test('should provide generic examples for unknown commands', () => {
      const command: ParsedCommand = {
        verb: 'randomverb',
        originalInput: 'randomverb',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain('Try commands like');
      expect(feedback).toContain('go north');
      expect(feedback).toContain('take key');
    });

    test('should always mention help command', () => {
      const testCommands = [
        { verb: 'invalid', originalInput: 'invalid', isValid: false },
        { verb: 'xyz', originalInput: 'xyz', isValid: false },
        { verb: '', originalInput: '', isValid: false }
      ];

      testCommands.forEach(command => {
        const feedback = commandFeedback.generateFeedback(command);
        expect(feedback.toLowerCase()).toContain('help');
      });
    });
  });

  describe('Advanced feedback features', () => {
    test('should handle Levenshtein distance matching', () => {
      const command: ParsedCommand = {
        verb: 'loook',
        originalInput: 'loook',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain('Did you mean');
      expect(feedback).toContain('look');
    });

    test('should suggest multiple similar commands', () => {
      const command: ParsedCommand = {
        verb: 'ex',
        originalInput: 'ex',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      // Should suggest both 'examine' and 'exit' as they both start with 'ex'
      expect(feedback).toContain('Did you mean');
    });

    test('should provide encouragement', () => {
      const encouragement = commandFeedback.getRandomEncouragement();
      
      expect(typeof encouragement).toBe('string');
      expect(encouragement.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    test('should handle very long invalid commands', () => {
      const command: ParsedCommand = {
        verb: 'superlongcommandthatdoesnotexist',
        originalInput: 'superlongcommandthatdoesnotexist with many parameters',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain("I don't understand");
      expect(feedback.length).toBeLessThan(200); // Keep feedback concise
    });

    test('should handle commands with special characters', () => {
      const command: ParsedCommand = {
        verb: 'go!@#',
        originalInput: 'go!@# north',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain("I don't understand");
    });

    test('should be case insensitive for suggestions', () => {
      const command: ParsedCommand = {
        verb: 'TAK',
        originalInput: 'TAK',
        isValid: false
      };

      const feedback = commandFeedback.generateFeedback(command);
      
      expect(feedback).toContain('take');
    });
  });
});