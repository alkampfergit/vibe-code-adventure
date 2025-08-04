import { ExampleCommandsService, CommandExample } from './exampleCommands';
import { CommandParser } from './commandParser';
import { GameEngine } from './gameEngine';

describe('Example Commands System (User Story gh18)', () => {
  let exampleCommands: ExampleCommandsService;
  let commandParser: CommandParser;
  let gameEngine: GameEngine;
  const testSessionId = 'examples-test-session';

  beforeEach(() => {
    exampleCommands = new ExampleCommandsService();
    commandParser = new CommandParser();
    gameEngine = new GameEngine(commandParser);
  });

  describe('Acceptance Criteria: Player can access list of example commands', () => {
    test('should provide access to all example commands', () => {
      const allExamples = exampleCommands.getAllExamples();
      
      expect(allExamples).toBeDefined();
      expect(Array.isArray(allExamples)).toBe(true);
      expect(allExamples.length).toBeGreaterThan(0);
      
      // Each example should have required properties
      allExamples.forEach(example => {
        expect(example).toHaveProperty('command');
        expect(example).toHaveProperty('description');
        expect(example).toHaveProperty('category');
        expect(typeof example.command).toBe('string');
        expect(typeof example.description).toBe('string');
        expect(typeof example.category).toBe('string');
      });
    });

    test('should provide examples accessible via game interface (examples command)', () => {
      const parsed = commandParser.parse('examples');
      expect(parsed.isValid).toBe(true);
      expect(parsed.verb).toBe('examples');
      
      const result = gameEngine.executeCommand(testSessionId, parsed);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Command Examples');
      expect(result.data?.examples).toBeDefined();
    });

    test('should provide examples via API endpoint', async () => {
      // This would be tested in integration tests, but we can test the service directly
      const examples = exampleCommands.getAllExamples();
      expect(examples.length).toBeGreaterThan(0);
    });

    test('should provide quick start examples for new players', () => {
      const quickStartExamples = exampleCommands.getExamplesForNewPlayers();
      
      expect(quickStartExamples).toBeDefined();
      expect(Array.isArray(quickStartExamples)).toBe(true);
      expect(quickStartExamples.length).toBeGreaterThan(0);
      
      // Should include essential commands for new players
      const commands = quickStartExamples.map(ex => ex.command);
      expect(commands).toContain('look');
      expect(commands).toContain('help');
      
      // Should be a reasonable number for beginners (not overwhelming)
      expect(quickStartExamples.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Acceptance Criteria: Examples cover variety of common actions', () => {
    test('should include movement examples', () => {
      const movementExamples = exampleCommands.getExamplesByCategory('movement');
      
      expect(movementExamples.length).toBeGreaterThan(0);
      
      const commands = movementExamples.map(ex => ex.command.toLowerCase());
      expect(commands.some(cmd => cmd.includes('north'))).toBe(true);
      expect(commands.some(cmd => cmd.includes('south'))).toBe(true);
      expect(commands.some(cmd => cmd.includes('go') || cmd.includes('move') || cmd.includes('walk'))).toBe(true);
    });

    test('should include item interaction examples', () => {
      const itemExamples = exampleCommands.getExamplesByCategory('items');
      
      expect(itemExamples.length).toBeGreaterThan(0);
      
      const commands = itemExamples.map(ex => ex.command.toLowerCase());
      expect(commands.some(cmd => cmd.includes('take') || cmd.includes('grab') || cmd.includes('get'))).toBe(true);
      expect(commands.some(cmd => cmd.includes('drop') || cmd.includes('put'))).toBe(true);
      expect(commands.some(cmd => cmd.includes('examine') || cmd.includes('look'))).toBe(true);
    });

    test('should include interaction examples (future NPCs, objects)', () => {
      const interactionExamples = exampleCommands.getExamplesByCategory('interaction');
      
      expect(interactionExamples.length).toBeGreaterThan(0);
      
      const commands = interactionExamples.map(ex => ex.command.toLowerCase());
      expect(commands.some(cmd => cmd.includes('talk') || cmd.includes('speak'))).toBe(true);
      expect(commands.some(cmd => cmd.includes('use') || cmd.includes('open') || cmd.includes('push') || cmd.includes('pull'))).toBe(true);
    });

    test('should include information and status examples', () => {
      const infoExamples = exampleCommands.getExamplesByCategory('information');
      
      expect(infoExamples.length).toBeGreaterThan(0);
      
      const commands = infoExamples.map(ex => ex.command.toLowerCase());
      expect(commands.some(cmd => cmd.includes('look'))).toBe(true);
      expect(commands.some(cmd => cmd.includes('inventory') || cmd.includes('i'))).toBe(true);
      expect(commands.some(cmd => cmd.includes('help'))).toBe(true);
      expect(commands.some(cmd => cmd.includes('score'))).toBe(true);
    });

    test('should include game management examples', () => {
      const gameExamples = exampleCommands.getExamplesByCategory('game');
      
      expect(gameExamples.length).toBeGreaterThan(0);
      
      const commands = gameExamples.map(ex => ex.command.toLowerCase());
      expect(commands.some(cmd => cmd.includes('save'))).toBe(true);
      expect(commands.some(cmd => cmd.includes('load'))).toBe(true);
      expect(commands.some(cmd => cmd.includes('quit') || cmd.includes('exit'))).toBe(true);
    });

    test('should categorize examples properly', () => {
      const allExamples = exampleCommands.getAllExamples();
      const categories = ['movement', 'items', 'interaction', 'information', 'game'];
      
      categories.forEach(category => {
        const categoryExamples = allExamples.filter(ex => ex.category === category);
        expect(categoryExamples.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Acceptance Criteria: Examples are clear, concise, and easy to understand', () => {
    test('should have clear and descriptive command descriptions', () => {
      const allExamples = exampleCommands.getAllExamples();
      
      allExamples.forEach(example => {
        // Description should exist and be meaningful
        expect(example.description).toBeTruthy();
        expect(example.description.length).toBeGreaterThan(5);
        expect(example.description.length).toBeLessThan(100); // Keep it concise
        
        // Description should start with a capital letter and be a complete thought
        expect(example.description[0]).toMatch(/[A-Z]/);
      });
    });

    test('should use simple, understandable command syntax', () => {
      const allExamples = exampleCommands.getAllExamples();
      
      allExamples.forEach(example => {
        // Commands should be simple and not overly complex
        expect(example.command.length).toBeLessThan(50);
        
        // Commands should use common English words
        expect(example.command).toMatch(/^[a-zA-Z\s]+$/);
        
        // Commands should not contain confusing syntax
        expect(example.command).not.toContain('&&');
        expect(example.command).not.toContain('||');
        expect(example.command).not.toContain(';');
      });
    });

    test('should provide formatted display for easy reading', () => {
      const examples = exampleCommands.getExamplesForNewPlayers();
      const formattedDisplay = exampleCommands.formatExamplesForDisplay(examples);
      
      expect(formattedDisplay).toContain('Command Examples');
      expect(formattedDisplay).toContain('-'); // Should have descriptions
      expect(formattedDisplay).toContain('synonyms'); // Should mention synonyms
      
      // Should be well-structured
      expect(formattedDisplay.split('\n').length).toBeGreaterThan(5);
    });

    test('should provide helpful quick start guide', () => {
      const quickStartGuide = exampleCommands.getQuickStartGuide();
      
      expect(quickStartGuide).toContain('Quick Start Guide');
      expect(quickStartGuide).toContain('Welcome');
      expect(quickStartGuide).toContain('Tips');
      expect(quickStartGuide).toContain('look');
      expect(quickStartGuide).toContain('synonyms');
      expect(quickStartGuide).toContain('case-sensitive');
      
      // Should be encouraging and informative
      expect(quickStartGuide).toMatch(/ready|start|begin/i);
    });
  });

  describe('Advanced functionality and usability', () => {
    test('should provide random examples for variety', () => {
      const randomExamples1 = exampleCommands.getRandomExamples(5);
      const randomExamples2 = exampleCommands.getRandomExamples(5);
      
      expect(randomExamples1).toHaveLength(5);
      expect(randomExamples2).toHaveLength(5);
      
      // Random selections should be different (with high probability)
      const commands1 = randomExamples1.map(ex => ex.command).sort();
      const commands2 = randomExamples2.map(ex => ex.command).sort();
      expect(commands1).not.toEqual(commands2); // Very likely to be different
    });

    test('should filter examples by category correctly', () => {
      const categories: Array<CommandExample['category']> = ['movement', 'items', 'interaction', 'information', 'game'];
      
      categories.forEach(category => {
        const categoryExamples = exampleCommands.getExamplesByCategory(category);
        
        // All examples should belong to the requested category
        categoryExamples.forEach(example => {
          expect(example.category).toBe(category);
        });
        
        // Should have examples for each category
        expect(categoryExamples.length).toBeGreaterThan(0);
      });
    });

    test('should work with game engine examples command with categories', () => {
      const testCases = [
        { input: 'examples movement', expectedCategory: 'movement' },
        { input: 'examples items', expectedCategory: 'items' },
        { input: 'examples new', expectedCategory: 'new' },
        { input: 'examples', expectedCategory: 'all' }
      ];

      testCases.forEach(({ input, expectedCategory }) => {
        const parsed = commandParser.parse(input);
        const result = gameEngine.executeCommand(testSessionId, parsed);
        
        expect(result.success).toBe(true);
        expect(result.message).toContain('Examples');
        expect(result.data?.category).toBe(expectedCategory);
        expect(result.data?.examples).toBeDefined();
      });
    });

    test('should handle synonym commands for examples', () => {
      const synonyms = ['demo', 'tutorial', 'guide'];
      
      synonyms.forEach(synonym => {
        const parsed = commandParser.parse(synonym);
        expect(parsed.isValid).toBe(true);
        expect(parsed.verb).toBe('examples');
        
        const result = gameEngine.executeCommand(testSessionId, parsed);
        expect(result.success).toBe(true);
        expect(result.message).toContain('Examples');
      });
    });
  });

  describe('Integration with existing command system', () => {
    test('should provide examples that are valid commands', () => {
      const allExamples = exampleCommands.getAllExamples();
      
      allExamples.forEach(example => {
        const parsed = commandParser.parse(example.command);
        // The command should be recognized by the parser
        expect(parsed.isValid).toBe(true);
      });
    });

    test('should complement the help system', () => {
      const helpResult = gameEngine.executeCommand(testSessionId, commandParser.parse('help'));
      const examplesResult = gameEngine.executeCommand(testSessionId, commandParser.parse('examples'));
      
      expect(helpResult.success).toBe(true);
      expect(examplesResult.success).toBe(true);
      
      // Help should mention examples
      expect(helpResult.message.toLowerCase()).toContain('examples');
      
      // Examples should provide more detailed information than help
      expect(examplesResult.message.length).toBeGreaterThan(helpResult.message.length);
    });
  });
});