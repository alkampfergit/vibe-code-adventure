export interface User {
  id: string;
  username: string;
  createdAt: Date;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  strength: number;
  dexterity: number;
  intelligence: number;
  health: number;
  maxHealth: number;
  experience: number;
  level: number;
  createdAt: Date;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'consumable' | 'quest' | 'misc';
  properties: Record<string, any>;
  value?: number;
  weight?: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  item: Item;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  exits: Record<string, string>; // direction -> roomId
  items: string[];
  npcs: string[];
  visited: boolean;
}

export interface NPC {
  id: string;
  name: string;
  description: string;
  dialogue: Record<string, string>;
  hostile: boolean;
  health?: number;
  maxHealth?: number;
  level?: number;
}

export interface GameState {
  id: string;
  userId: string;
  characterId: string;
  currentRoomId: string;
  inventory: InventoryItem[];
  score: number;
  visitedRooms: string[];
  gameData: Record<string, any>;
  lastSaved: Date;
}

export interface CommandResult {
  success: boolean;
  message: string;
  gameState?: Partial<GameState>;
}