import { Box, Typography, Paper } from '@mui/material'
import { GameState } from '../../../shared/types'

interface GameOutputProps {
  gameState: GameState | null
}

const GameOutput = ({ gameState }: GameOutputProps) => {
  if (!gameState) {
    return (
      <Paper sx={{ p: 2, minHeight: 400, bgcolor: 'background.paper' }}>
        <Typography variant="body1">
          Loading game...
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper 
      sx={{ 
        p: 2, 
        minHeight: 400, 
        maxHeight: 500,
        overflow: 'auto',
        bgcolor: 'background.paper',
        flexGrow: 1,
        fontFamily: 'monospace'
      }}
    >
      <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
        {`> Welcome to the VIBE Text Adventure!
        
You are currently in: ${gameState.currentRoomId}

Available commands:
- look: Examine your surroundings
- inventory: Check your items
- go [direction]: Move to another room
- take [item]: Pick up an item
- use [item]: Use an item from your inventory
- talk [npc]: Speak with a character
- save: Save your progress
- help: Show available commands

Score: ${gameState.score}
Items carried: ${gameState.inventory.length}

Type a command and press Enter to continue your adventure...`}
      </Typography>
    </Paper>
  )
}

export default GameOutput