import { useState } from 'react'
import { TextField, Box } from '@mui/material'
import { GameState } from '../../../shared/types'
import { gameService } from '../services/gameService'

interface CommandInputProps {
  gameState: GameState | null
  onGameStateUpdate: (gameState: GameState) => void
}

const CommandInput = ({ gameState, onGameStateUpdate }: CommandInputProps) => {
  const [command, setCommand] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim() || !gameState || loading) return

    setLoading(true)
    const currentCommand = command.trim()
    setCommand('')

    try {
      const result = await gameService.executeCommand(gameState.id, currentCommand)
      if (result.gameState) {
        onGameStateUpdate({ ...gameState, ...result.gameState })
      }
    } catch (error) {
      console.error('Command execution failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ mt: 2 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          placeholder={loading ? 'Processing...' : 'Enter command (e.g., "look", "go north", "inventory")'}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          disabled={loading || !gameState}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: 'monospace',
              fontSize: '1rem',
            },
          }}
        />
      </form>
    </Box>
  )
}

export default CommandInput