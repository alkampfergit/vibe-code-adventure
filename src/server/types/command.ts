export interface ParsedCommand {
  verb: string;
  noun?: string;
  originalInput: string;
  isValid: boolean;
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface GameState {
  currentRoom: string;
  inventory: string[];
  score: number;
  playerName: string;
}