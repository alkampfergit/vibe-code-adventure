import axios from 'axios'
import { GameState, CommandResult, Character } from '../../../shared/types'

const API_BASE = '/api'

export const gameService = {
  async createCharacter(userId: string, characterData: Partial<Character>): Promise<GameState> {
    const response = await axios.post(`${API_BASE}/game/character`, {
      userId,
      ...characterData
    })
    return response.data
  },

  async loadGame(userId: string): Promise<GameState | null> {
    try {
      const response = await axios.get(`${API_BASE}/game/state/${userId}`)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  async saveGame(gameState: GameState): Promise<void> {
    await axios.post(`${API_BASE}/game/save`, gameState)
  },

  async executeCommand(gameStateId: string, command: string): Promise<CommandResult> {
    const response = await axios.post(`${API_BASE}/game/command`, {
      gameStateId,
      command
    })
    return response.data
  }
}