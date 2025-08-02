import { useState, useEffect } from 'react'
import { Box, Paper, Typography, Button, AppBar, Toolbar } from '@mui/material'
import { User, GameState } from '../../../shared/types'
import CommandInput from './CommandInput'
import GameOutput from './GameOutput'
import CharacterCreation from './CharacterCreation'
import { gameService } from '../services/gameService'

interface GameInterfaceProps {
  user: User
  onLogout: () => void
}

const GameInterface = ({ user, onLogout }: GameInterfaceProps) => {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [needsCharacter, setNeedsCharacter] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGameState()
  }, [user.id])

  const loadGameState = async () => {
    try {
      const state = await gameService.loadGame(user.id)
      if (state) {
        setGameState(state)
      } else {
        setNeedsCharacter(true)
      }
    } catch (error) {
      console.error('Failed to load game state:', error)
      setNeedsCharacter(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCharacterCreated = (newGameState: GameState) => {
    setGameState(newGameState)
    setNeedsCharacter(false)
  }

  if (loading) {
    return <Box>Loading game...</Box>
  }

  if (needsCharacter) {
    return <CharacterCreation user={user} onCharacterCreated={handleCharacterCreated} />
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            VIBE TEXT ADVENTURE - {user.username}
          </Typography>
          <Button color="inherit" onClick={onLogout}>
            LOGOUT
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1, p: 2, gap: 2 }}>
        <Paper sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          <GameOutput gameState={gameState} />
          <CommandInput gameState={gameState} onGameStateUpdate={setGameState} />
        </Paper>

        <Paper sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            CHARACTER STATUS
          </Typography>
          {gameState && (
            <Box>
              <Typography>Score: {gameState.score}</Typography>
              <Typography>Room: {gameState.currentRoomId}</Typography>
              <Typography>Items: {gameState.inventory.length}</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

export default GameInterface