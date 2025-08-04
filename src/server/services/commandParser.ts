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
    const verb = parts[0];
    const noun = parts.length > 1 ? parts.slice(1).join(' ') : undefined;

    const isValid = this.validVerbs.includes(verb);

    return {
      verb,
      noun,
      originalInput: input,
      isValid
    };
  }

  getValidVerbs(): string[] {
    return [...this.validVerbs];
  }
}