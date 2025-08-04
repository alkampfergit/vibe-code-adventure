export interface CommandExample {
  command: string;
  description: string;
  category: 'movement' | 'items' | 'interaction' | 'information' | 'game';
}

export class ExampleCommandsService {
  private readonly examples: CommandExample[] = [
    // Movement examples
    { command: 'go north', description: 'Move to the north', category: 'movement' },
    { command: 'go south', description: 'Move to the south', category: 'movement' },
    { command: 'go east', description: 'Move to the east', category: 'movement' },
    { command: 'go west', description: 'Move to the west', category: 'movement' },
    { command: 'go up', description: 'Go upstairs or climb up', category: 'movement' },
    { command: 'go down', description: 'Go downstairs or climb down', category: 'movement' },
    { command: 'move north', description: 'Alternative way to move north', category: 'movement' },
    { command: 'walk south', description: 'Walk to the south', category: 'movement' },

    // Item examples
    { command: 'take key', description: 'Pick up a key from the room', category: 'items' },
    { command: 'grab sword', description: 'Pick up a sword (synonym for take)', category: 'items' },
    { command: 'get coin', description: 'Pick up a coin', category: 'items' },
    { command: 'drop torch', description: 'Drop a torch from your inventory', category: 'items' },
    { command: 'put stone', description: 'Drop a stone', category: 'items' },
    { command: 'examine book', description: 'Look closely at a book', category: 'items' },
    { command: 'look painting', description: 'Examine a painting', category: 'items' },

    // Interaction examples (these are aspirational for future implementation)
    { command: 'talk merchant', description: 'Start a conversation with a merchant (future feature)', category: 'interaction' },
    { command: 'speak guard', description: 'Talk to a guard (future feature)', category: 'interaction' },
    { command: 'use wand', description: 'Use a magic wand from your inventory (future feature)', category: 'interaction' },
    { command: 'open door', description: 'Try to open a door (future feature)', category: 'interaction' },
    { command: 'push button', description: 'Push a button (future feature)', category: 'interaction' },
    { command: 'pull rope', description: 'Pull a rope (future feature)', category: 'interaction' },

    // Information examples
    { command: 'look', description: 'Look around the current room', category: 'information' },
    { command: 'look around', description: 'Examine your surroundings', category: 'information' },
    { command: 'inventory', description: 'Check what items you are carrying', category: 'information' },
    { command: 'i', description: 'Quick way to check your inventory', category: 'information' },
    { command: 'score', description: 'View your current score', category: 'information' },
    { command: 'help', description: 'Show all available commands', category: 'information' },

    // Game management examples
    { command: 'save', description: 'Save your current progress', category: 'game' },
    { command: 'load', description: 'Load your saved game', category: 'game' },
    { command: 'quit', description: 'Exit the game', category: 'game' },
    { command: 'exit', description: 'Alternative way to exit the game', category: 'game' }
  ];

  getAllExamples(): CommandExample[] {
    return [...this.examples];
  }

  getExamplesByCategory(category: CommandExample['category']): CommandExample[] {
    return this.examples.filter(example => example.category === category);
  }

  getRandomExamples(count: number = 5): CommandExample[] {
    const shuffled = [...this.examples].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  getExamplesForNewPlayers(): CommandExample[] {
    // Return a curated list of examples perfect for new players
    return [
      { command: 'look', description: 'Look around to see where you are', category: 'information' },
      { command: 'go north', description: 'Try moving in different directions', category: 'movement' },
      { command: 'take key', description: 'Pick up items you find', category: 'items' },
      { command: 'inventory', description: 'Check what you are carrying', category: 'information' },
      { command: 'examine door', description: 'Look closely at objects', category: 'items' },
      { command: 'help', description: 'Get help when you are stuck', category: 'information' },
      { command: 'save', description: 'Save your progress', category: 'game' }
    ];
  }

  formatExamplesForDisplay(examples: CommandExample[]): string {
    const categories = ['movement', 'items', 'interaction', 'information', 'game'] as const;
    const categoryNames = {
      movement: 'Movement & Navigation',
      items: 'Items & Objects',
      interaction: 'Interaction & Actions',
      information: 'Information & Status',
      game: 'Game Management'
    };

    let output = 'Command Examples:\n\n';

    categories.forEach(category => {
      const categoryExamples = examples.filter(ex => ex.category === category);
      if (categoryExamples.length > 0) {
        output += `${categoryNames[category]}:\n`;
        categoryExamples.forEach(example => {
          output += `  "${example.command}" - ${example.description}\n`;
        });
        output += '\n';
      }
    });

    output += 'Try these commands to get started! Remember, you can use synonyms for most actions.';
    return output;
  }

  getQuickStartGuide(): string {
    const quickStart = this.getExamplesForNewPlayers();
    return `Quick Start Guide:

Welcome to the Text Adventure! Here are some essential commands to get you started:

${quickStart.map(ex => `"${ex.command}" - ${ex.description}`).join('\n')}

Tips:
- Commands are not case-sensitive
- You can use synonyms (e.g., "grab" instead of "take")
- Type "help" anytime for a full list of commands
- Use "examples" to see more command examples

Ready to begin your adventure? Start by typing "look" to see where you are!`;
  }
}