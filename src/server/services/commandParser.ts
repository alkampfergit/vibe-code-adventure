import { ParsedCommand } from '../types/command';

export class CommandParser {
  private readonly validVerbs = [
    'go', 'move', 'walk',
    'take', 'get', 'pick',
    'drop', 'put',
    'look', 'examine', 'inspect',
    'inventory', 'inv', 'i',
    'help', 'commands',
    'quit', 'exit',
    'score',
    'save', 'load'
  ];

  // Synonym mappings - synonyms map to canonical commands
  private readonly synonymMappings: Record<string, string> = {
    // Movement synonyms
    'go': 'go',
    'move': 'go',
    'walk': 'go',
    'travel': 'go',
    'head': 'go',
    'venture': 'go',

    // Take synonyms
    'take': 'take',
    'get': 'take',
    'pick': 'take',
    'grab': 'take',
    'collect': 'take',
    'acquire': 'take',
    'obtain': 'take',
    'pickup': 'take',
    'snatch': 'take',

    // Drop synonyms
    'drop': 'drop',
    'put': 'drop',
    'place': 'drop',
    'release': 'drop',
    'discard': 'drop',
    'throw': 'drop',

    // Look synonyms
    'look': 'look',
    'examine': 'look',
    'inspect': 'look',
    'view': 'look',
    'observe': 'look',
    'check': 'look',
    'see': 'look',
    'watch': 'look',
    'study': 'look',

    // Inventory synonyms
    'inventory': 'inventory',
    'inv': 'inventory',
    'i': 'inventory',
    'items': 'inventory',
    'possessions': 'inventory',
    'belongings': 'inventory',
    'stuff': 'inventory',
    'gear': 'inventory',

    // Help synonyms
    'help': 'help',
    'commands': 'help',
    'assist': 'help',
    'info': 'help',
    'instructions': 'help',
    '?': 'help',

    // Quit synonyms
    'quit': 'quit',
    'exit': 'quit',
    'leave': 'quit',
    'bye': 'quit',
    'goodbye': 'quit',
    'stop': 'quit',
    'end': 'quit',

    // Score synonyms
    'score': 'score',
    'points': 'score',
    'rating': 'score',
    'status': 'score',

    // Save synonyms
    'save': 'save',
    'store': 'save',
    'preserve': 'save',

    // Load synonyms
    'load': 'load',
    'restore': 'load',
    'retrieve': 'load'
  };

  parse(input: string): ParsedCommand {
    const trimmedInput = input.trim().toLowerCase();
    
    if (!trimmedInput) {
      return {
        verb: '',
        originalInput: input,
        isValid: false
      };
    }

    const parts = trimmedInput.split(/\s+/);
    const inputVerb = parts[0];
    const noun = parts.length > 1 ? parts.slice(1).join(' ') : undefined;

    // Check if the verb is a synonym and map it to canonical form
    const canonicalVerb = this.synonymMappings[inputVerb];
    const isValid = canonicalVerb !== undefined;

    return {
      verb: canonicalVerb || inputVerb, // Use canonical verb if it's a synonym
      noun,
      originalInput: input,
      isValid
    };
  }

  getValidVerbs(): string[] {
    return [...this.validVerbs];
  }

  getSynonyms(): Record<string, string[]> {
    const synonymGroups: Record<string, string[]> = {};
    
    // Group synonyms by their canonical command
    Object.entries(this.synonymMappings).forEach(([synonym, canonical]) => {
      if (!synonymGroups[canonical]) {
        synonymGroups[canonical] = [];
      }
      if (synonym !== canonical) { // Don't include the canonical word as a synonym of itself
        synonymGroups[canonical].push(synonym);
      }
    });
    
    return synonymGroups;
  }

  getAllSynonymsForCommand(canonicalCommand: string): string[] {
    return this.getSynonyms()[canonicalCommand] || [];
  }

  getCanonicalCommand(inputVerb: string): string | undefined {
    return this.synonymMappings[inputVerb.toLowerCase()];
  }
}