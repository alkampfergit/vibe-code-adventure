import { CommandParser } from './commandParser';

describe('CommandParser', () => {
  let parser: CommandParser;

  beforeEach(() => {
    parser = new CommandParser();
  });

  describe('parse', () => {
    test('should parse simple verb-only commands', () => {
      const result = parser.parse('look');
      
      expect(result.verb).toBe('look');
      expect(result.noun).toBeUndefined();
      expect(result.originalInput).toBe('look');
      expect(result.isValid).toBe(true);
    });

    test('should parse verb-noun commands', () => {
      const result = parser.parse('go north');
      
      expect(result.verb).toBe('go');
      expect(result.noun).toBe('north');
      expect(result.originalInput).toBe('go north');
      expect(result.isValid).toBe(true);
    });

    test('should parse commands with multiple words as noun', () => {
      const result = parser.parse('take golden key');
      
      expect(result.verb).toBe('take');
      expect(result.noun).toBe('golden key');
      expect(result.originalInput).toBe('take golden key');
      expect(result.isValid).toBe(true);
    });

    test('should handle case insensitive input', () => {
      const result = parser.parse('LOOK AROUND');
      
      expect(result.verb).toBe('look');
      expect(result.noun).toBe('around');
      expect(result.isValid).toBe(true);
    });

    test('should trim whitespace', () => {
      const result = parser.parse('  go   north  ');
      
      expect(result.verb).toBe('go');
      expect(result.noun).toBe('north');
      expect(result.isValid).toBe(true);
    });

    test('should mark invalid verbs as invalid', () => {
      const result = parser.parse('fly dragons');
      
      expect(result.verb).toBe('fly');
      expect(result.noun).toBe('dragons');
      expect(result.isValid).toBe(false);
    });

    test('should handle empty input', () => {
      const result = parser.parse('');
      
      expect(result.verb).toBe('');
      expect(result.noun).toBeUndefined();
      expect(result.isValid).toBe(false);
    });

    test('should handle whitespace-only input', () => {
      const result = parser.parse('   ');
      
      expect(result.verb).toBe('');
      expect(result.noun).toBeUndefined();
      expect(result.isValid).toBe(false);
    });

    test('should recognize all valid verbs', () => {
      const validVerbs = ['go', 'move', 'walk', 'take', 'get', 'pick', 'drop', 'put', 'look', 'examine', 'inspect', 'inventory', 'inv', 'help', 'commands'];
      
      validVerbs.forEach(verb => {
        const result = parser.parse(verb);
        expect(result.isValid).toBe(true);
        expect(result.verb).toBe(verb);
      });
    });
  });

  describe('getValidVerbs', () => {
    test('should return array of valid verbs', () => {
      const verbs = parser.getValidVerbs();
      
      expect(Array.isArray(verbs)).toBe(true);
      expect(verbs.length).toBeGreaterThan(0);
      expect(verbs).toContain('go');
      expect(verbs).toContain('take');
      expect(verbs).toContain('look');
      expect(verbs).toContain('inventory');
    });

    test('should return a copy of the array', () => {
      const verbs1 = parser.getValidVerbs();
      const verbs2 = parser.getValidVerbs();
      
      expect(verbs1).not.toBe(verbs2); // Different references
      expect(verbs1).toEqual(verbs2); // Same content
    });
  });
});