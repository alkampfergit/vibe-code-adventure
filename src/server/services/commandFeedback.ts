import { ParsedCommand } from '../types/command';

export class CommandFeedback {
  private readonly validVerbs = [
    'go', 'move', 'walk', 'travel', 'head', 'venture',
    'take', 'get', 'pick', 'grab', 'collect', 'acquire', 'obtain', 'pickup', 'snatch',
    'drop', 'put', 'place', 'release', 'discard', 'throw',
    'look', 'examine', 'inspect', 'view', 'observe', 'check', 'see', 'watch', 'study',
    'inventory', 'inv', 'i', 'items', 'possessions', 'belongings', 'stuff', 'gear',
    'help', 'commands', 'assist', 'info', 'instructions', '?',
    'quit', 'exit', 'leave', 'bye', 'goodbye', 'stop', 'end',
    'score', 'points', 'rating', 'status',
    'save', 'store', 'preserve',
    'load', 'restore', 'retrieve'
  ];

  private readonly commonMisspellings: Record<string, string> = {
    'goo': 'go',
    'tak': 'take',
    'lok': 'look',
    'loook': 'look',
    'inventtory': 'inventory',
    'inventry': 'inventory',
    'halp': 'help',
    'hlep': 'help',
    'exut': 'exit',
    'qiut': 'quit'
  };

  private readonly contextualSuggestions: Record<string, string[]> = {
    movement: ['go north', 'go south', 'go east', 'go west', 'go up', 'go down'],
    items: ['take key', 'drop sword', 'examine item', 'look at object'],
    information: ['inventory', 'look', 'score', 'help'],
    game: ['save', 'load', 'quit', 'exit']
  };

  generateFeedback(command: ParsedCommand): string {
    if (!command.verb) {
      return "Please enter a command. Type 'help' to see available commands.";
    }

    // Check for common misspellings
    const correctedVerb = this.commonMisspellings[command.verb.toLowerCase()];
    if (correctedVerb) {
      const suggestion = command.noun ? `${correctedVerb} ${command.noun}` : correctedVerb;
      return `I don't understand "${command.originalInput}". Did you mean "${suggestion}"? Type 'help' for all commands.`;
    }

    // Check for partial matches
    const partialMatches = this.findPartialMatches(command.verb);
    if (partialMatches.length > 0) {
      const suggestions = partialMatches.slice(0, 3).join('", "');
      return `I don't understand "${command.originalInput}". Did you mean "${suggestions}"? Type 'help' for all commands.`;
    }

    // Provide contextual suggestions based on common patterns
    return this.getContextualFeedback(command);
  }

  private findPartialMatches(verb: string): string[] {
    const normalizedVerb = verb.toLowerCase();
    return this.validVerbs.filter(validVerb => {
      // Check if the verb starts with the input or the input starts with the verb
      return validVerb.startsWith(normalizedVerb) || 
             normalizedVerb.startsWith(validVerb) ||
             this.calculateLevenshteinDistance(normalizedVerb, validVerb) <= 2;
    });
  }

  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private getContextualFeedback(command: ParsedCommand): string {
    const verb = command.verb.toLowerCase();
    
    // Analyze the verb to guess intent
    if (this.isMovementRelated(verb)) {
      return `I don't understand "${command.originalInput}". For movement, try: ${this.contextualSuggestions.movement.join(', ')}`;
    }
    
    if (this.isItemRelated(verb)) {
      return `I don't understand "${command.originalInput}". For items, try: ${this.contextualSuggestions.items.join(', ')}`;
    }
    
    if (this.isInformationRelated(verb)) {
      return `I don't understand "${command.originalInput}". For information, try: ${this.contextualSuggestions.information.join(', ')}`;
    }
    
    // Default fallback with examples
    return `I don't understand "${command.originalInput}". Try commands like: go north, take key, look, inventory, help`;
  }

  private isMovementRelated(verb: string): boolean {
    const movementKeywords = ['move', 'walk', 'run', 'travel', 'navigate', 'step'];
    return movementKeywords.some(keyword => verb.includes(keyword));
  }

  private isItemRelated(verb: string): boolean {
    const itemKeywords = ['grab', 'pickup', 'collect', 'use', 'hold', 'throw', 'discard'];
    return itemKeywords.some(keyword => verb.includes(keyword) || keyword.includes(verb));
  }

  private isInformationRelated(verb: string): boolean {
    const infoKeywords = ['check', 'view', 'show', 'display', 'list', 'status'];
    return infoKeywords.some(keyword => verb.includes(keyword) || keyword.includes(verb));
  }

  getRandomEncouragement(): string {
    const encouragements = [
      "Keep exploring!",
      "You're doing great!",
      "Try different commands!",
      "The adventure continues!",
      "Don't give up!",
      "Every mistake is a learning opportunity!"
    ];
    
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }
}