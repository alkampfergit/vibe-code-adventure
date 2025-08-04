import { CommandParser } from './commandParser';
import { GameEngine } from './gameEngine';

describe('Synonym System (User Story gh20)', () => {
  let commandParser: CommandParser;
  let gameEngine: GameEngine;
  const testSessionId = 'synonym-test-session';

  beforeEach(() => {
    commandParser = new CommandParser();
    gameEngine = new GameEngine(commandParser);
  });

  describe('Acceptance Criteria: Parser recognizes common synonyms', () => {
    test('should recognize "grab" as synonym for "take"', () => {
      const parsed = commandParser.parse('grab sword');
      
      expect(parsed.isValid).toBe(true);
      expect(parsed.verb).toBe('take'); // Mapped to canonical
      expect(parsed.noun).toBe('sword');
    });

    test('should recognize "examine" as synonym for "look"', () => {
      const parsed = commandParser.parse('examine book');
      
      expect(parsed.isValid).toBe(true);
      expect(parsed.verb).toBe('look'); // Mapped to canonical
      expect(parsed.noun).toBe('book');
    });

    test('should recognize multiple movement synonyms', () => {
      const movementSynonyms = ['move', 'walk', 'travel', 'head', 'venture'];
      
      movementSynonyms.forEach(synonym => {
        const parsed = commandParser.parse(`${synonym} north`);
        
        expect(parsed.isValid).toBe(true);
        expect(parsed.verb).toBe('go'); // All map to 'go'
        expect(parsed.noun).toBe('north');
      });
    });

    test('should recognize multiple take synonyms', () => {
      const takeSynonyms = ['get', 'pick', 'grab', 'collect', 'acquire', 'obtain', 'pickup', 'snatch'];
      
      takeSynonyms.forEach(synonym => {
        const parsed = commandParser.parse(`${synonym} key`);
        
        expect(parsed.isValid).toBe(true);
        expect(parsed.verb).toBe('take'); // All map to 'take'
        expect(parsed.noun).toBe('key');
      });
    });

    test('should recognize multiple drop synonyms', () => {
      const dropSynonyms = ['put', 'place', 'release', 'discard', 'throw'];
      
      dropSynonyms.forEach(synonym => {
        const parsed = commandParser.parse(`${synonym} item`);
        
        expect(parsed.isValid).toBe(true);
        expect(parsed.verb).toBe('drop'); // All map to 'drop'
        expect(parsed.noun).toBe('item');
      });
    });

    test('should recognize multiple look synonyms', () => {
      const lookSynonyms = ['examine', 'inspect', 'view', 'observe', 'check', 'see', 'watch', 'study'];
      
      lookSynonyms.forEach(synonym => {
        const parsed = commandParser.parse(`${synonym} painting`);
        
        expect(parsed.isValid).toBe(true);
        expect(parsed.verb).toBe('look'); // All map to 'look'
        expect(parsed.noun).toBe('painting');
      });
    });

    test('should recognize multiple inventory synonyms', () => {
      const inventorySynonyms = ['inv', 'i', 'items', 'possessions', 'belongings', 'stuff', 'gear'];
      
      inventorySynonyms.forEach(synonym => {
        const parsed = commandParser.parse(synonym);
        
        expect(parsed.isValid).toBe(true);
        expect(parsed.verb).toBe('inventory'); // All map to 'inventory'
      });
    });

    test('should recognize multiple help synonyms', () => {
      const helpSynonyms = ['commands', 'assist', 'info', 'instructions', '?'];
      
      helpSynonyms.forEach(synonym => {
        const parsed = commandParser.parse(synonym);
        
        expect(parsed.isValid).toBe(true);
        expect(parsed.verb).toBe('help'); // All map to 'help'
      });
    });

    test('should recognize multiple quit synonyms', () => {
      const quitSynonyms = ['exit', 'bye', 'goodbye', 'stop', 'end'];
      
      quitSynonyms.forEach(synonym => {
        const parsed = commandParser.parse(synonym);
        
        expect(parsed.isValid).toBe(true);
        expect(parsed.verb).toBe('quit'); // All map to 'quit'
      });
    });
  });

  describe('Acceptance Criteria: Synonyms produce same result as canonical commands', () => {
    test('should produce same result for "take" and "grab"', () => {
      const takeResult = gameEngine.executeCommand(testSessionId, commandParser.parse('take sword'));
      const grabResult = gameEngine.executeCommand(testSessionId, commandParser.parse('grab shield'));
      
      // Both should succeed and add items to inventory
      expect(takeResult.success).toBe(true);
      expect(grabResult.success).toBe(true);
      expect(takeResult.message).toContain('You take the sword');
      expect(grabResult.message).toContain('You take the shield');
      
      // Check inventory has both items
      const gameState = gameEngine.getGameState(testSessionId);
      expect(gameState.inventory).toContain('sword');
      expect(gameState.inventory).toContain('shield');
    });

    test('should produce same result for "look" and "examine"', () => {
      const lookResult = gameEngine.executeCommand(testSessionId, commandParser.parse('look'));
      const examineResult = gameEngine.executeCommand(testSessionId, commandParser.parse('examine room'));
      
      expect(lookResult.success).toBe(true);
      expect(examineResult.success).toBe(true);
      expect(lookResult.message).toContain('You are in');
      expect(examineResult.message).toContain('You examine the room');
    });

    test('should produce same result for "inventory" and "items"', () => {
      const invResult = gameEngine.executeCommand(testSessionId, commandParser.parse('inventory'));
      const itemsResult = gameEngine.executeCommand(testSessionId, commandParser.parse('items'));
      
      expect(invResult.success).toBe(true);
      expect(itemsResult.success).toBe(true);
      // Both should show inventory (empty in this case)
      expect(invResult.message).toContain('inventory');
      expect(itemsResult.message).toContain('inventory');
    });

    test('should produce same result for "help" and "commands"', () => {
      const helpResult = gameEngine.executeCommand(testSessionId, commandParser.parse('help'));
      const commandsResult = gameEngine.executeCommand(testSessionId, commandParser.parse('commands'));
      
      expect(helpResult.success).toBe(true);
      expect(commandsResult.success).toBe(true);
      expect(helpResult.message).toEqual(commandsResult.message);
      expect(helpResult.message).toContain('Available commands');
    });

    test('should produce same result for "quit" and "exit"', () => {
      const quitResult = gameEngine.executeCommand(testSessionId, commandParser.parse('quit'));
      const exitResult = gameEngine.executeCommand(testSessionId, commandParser.parse('exit'));
      
      expect(quitResult.success).toBe(true);
      expect(exitResult.success).toBe(true);
      expect(quitResult.message).toEqual(exitResult.message);
      expect(quitResult.message).toContain('Thanks for playing');
    });

    test('should handle movement synonyms identically', () => {
      const goResult = gameEngine.executeCommand(testSessionId, commandParser.parse('go north'));
      const walkResult = gameEngine.executeCommand(testSessionId, commandParser.parse('walk south'));
      const travelResult = gameEngine.executeCommand(testSessionId, commandParser.parse('travel east'));
      
      expect(goResult.success).toBe(true);
      expect(walkResult.success).toBe(true);
      expect(travelResult.success).toBe(true);
      
      expect(goResult.message).toContain('You move north');
      expect(walkResult.message).toContain('You move south');
      expect(travelResult.message).toContain('You move east');
    });
  });

  describe('Acceptance Criteria: Synonym documentation and reference', () => {
    test('should provide list of synonyms for each command', () => {
      const synonyms = commandParser.getSynonyms();
      
      expect(synonyms).toBeDefined();
      expect(Object.keys(synonyms)).toContain('take');
      expect(Object.keys(synonyms)).toContain('look');
      expect(Object.keys(synonyms)).toContain('go');
      expect(Object.keys(synonyms)).toContain('inventory');
      
      // Check that take has expected synonyms
      expect(synonyms.take).toContain('grab');
      expect(synonyms.take).toContain('get');
      expect(synonyms.take).toContain('pick');
      
      // Check that look has expected synonyms
      expect(synonyms.look).toContain('examine');
      expect(synonyms.look).toContain('inspect');
    });

    test('should get synonyms for specific commands', () => {
      const takeSynonyms = commandParser.getAllSynonymsForCommand('take');
      const lookSynonyms = commandParser.getAllSynonymsForCommand('look');
      
      expect(takeSynonyms).toContain('grab');
      expect(takeSynonyms).toContain('get');
      expect(lookSynonyms).toContain('examine');
      expect(lookSynonyms).toContain('inspect');
    });

    test('should get canonical command for any synonym', () => {
      expect(commandParser.getCanonicalCommand('grab')).toBe('take');
      expect(commandParser.getCanonicalCommand('examine')).toBe('look');
      expect(commandParser.getCanonicalCommand('walk')).toBe('go');
      expect(commandParser.getCanonicalCommand('items')).toBe('inventory');
      expect(commandParser.getCanonicalCommand('exit')).toBe('quit');
    });

    test('should return undefined for non-existent synonyms', () => {
      expect(commandParser.getCanonicalCommand('nonexistent')).toBeUndefined();
      expect(commandParser.getCanonicalCommand('invalidword')).toBeUndefined();
    });

    test('should include synonyms in help text', () => {
      const helpResult = gameEngine.executeCommand(testSessionId, commandParser.parse('help'));
      
      expect(helpResult.success).toBe(true);
      expect(helpResult.message).toContain('grab');
      expect(helpResult.message).toContain('examine');
      expect(helpResult.message).toContain('synonyms');
      expect(helpResult.message).toContain('interchangeably');
    });
  });

  describe('Case sensitivity and robustness', () => {
    test('should handle case insensitive synonyms', () => {
      const testCases = ['GRAB', 'Examine', 'wAlK', 'InVeNtOrY'];
      
      testCases.forEach(testCase => {
        const parsed = commandParser.parse(testCase);
        expect(parsed.isValid).toBe(true);
      });
    });

    test('should preserve original input while mapping verb', () => {
      const parsed = commandParser.parse('GRAB magical sword');
      
      expect(parsed.originalInput).toBe('GRAB magical sword');
      expect(parsed.verb).toBe('take'); // Mapped to canonical
      expect(parsed.noun).toBe('magical sword');
      expect(parsed.isValid).toBe(true);
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle synonyms with complex nouns', () => {
      const parsed = commandParser.parse('grab the golden ancient artifact');
      
      expect(parsed.isValid).toBe(true);
      expect(parsed.verb).toBe('take');
      expect(parsed.noun).toBe('the golden ancient artifact');
    });

    test('should maintain synonym behavior with whitespace', () => {
      const parsed = commandParser.parse('  grab   sword  ');
      
      expect(parsed.isValid).toBe(true);
      expect(parsed.verb).toBe('take');
      expect(parsed.noun).toBe('sword');
    });

    test('should not break existing canonical commands', () => {
      const canonicalCommands = ['take', 'look', 'go', 'inventory', 'help', 'quit'];
      
      canonicalCommands.forEach(command => {
        const parsed = commandParser.parse(command);
        expect(parsed.isValid).toBe(true);
        expect(parsed.verb).toBe(command); // Should map to itself
      });
    });
  });
});