import axios from 'axios'
import { User } from '../../../shared/types'

const API_BASE = '/api'

export const authService = {
  async login(username: string): Promise<User> {
    const response = await axios.post(`${API_BASE}/auth/login`, { username })
    return response.data
  },

  async logout(): Promise<void> {
    await axios.post(`${API_BASE}/auth/logout`)
  }
}