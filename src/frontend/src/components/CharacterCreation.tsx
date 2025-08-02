import { useState } from 'react'
import { Paper, TextField, Button, Typography, Box, Slider, Alert } from '@mui/material'
import { User, GameState } from '../../../shared/types'
import { gameService } from '../services/gameService'

interface CharacterCreationProps {
  user: User
  onCharacterCreated: (gameState: GameState) => void
}

const CharacterCreation = ({ user, onCharacterCreated }: CharacterCreationProps) => {
  const [name, setName] = useState('')
  const [strength, setStrength] = useState(10)
  const [dexterity, setDexterity] = useState(10)
  const [intelligence, setIntelligence] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalPoints = strength + dexterity + intelligence
  const maxPoints = 40
  const remainingPoints = maxPoints - totalPoints

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Character name is required')
      return
    }

    if (totalPoints > maxPoints) {
      setError('Total attribute points cannot exceed 40')
      return
    }

    setLoading(true)
    setError('')

    try {
      const gameState = await gameService.createCharacter(user.id, {
        name: name.trim(),
        strength,
        dexterity,
        intelligence,
      })
      onCharacterCreated(gameState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h1" gutterBottom align="center">
          CREATE CHARACTER
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Character Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            disabled={loading}
            autoFocus
          />

          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>
              Strength: {strength}
            </Typography>
            <Slider
              value={strength}
              onChange={(_, value) => setStrength(value as number)}
              min={1}
              max={20}
              disabled={loading}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              Dexterity: {dexterity}
            </Typography>
            <Slider
              value={dexterity}
              onChange={(_, value) => setDexterity(value as number)}
              min={1}
              max={20}
              disabled={loading}
            />
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              Intelligence: {intelligence}
            </Typography>
            <Slider
              value={intelligence}
              onChange={(_, value) => setIntelligence(value as number)}
              min={1}
              max={20}
              disabled={loading}
            />
          </Box>

          <Typography 
            variant="body2" 
            sx={{ mt: 2, color: remainingPoints < 0 ? 'error.main' : 'text.secondary' }}
          >
            Total Points: {totalPoints}/{maxPoints} (Remaining: {remainingPoints})
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading || !name.trim() || totalPoints > maxPoints}
          >
            {loading ? 'CREATING...' : 'CREATE CHARACTER'}
          </Button>
        </form>
      </Paper>
    </Box>
  )
}

export default CharacterCreation