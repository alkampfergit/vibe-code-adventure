import { useState } from 'react'
import { Paper, TextField, Button, Typography, Box, Alert } from '@mui/material'
import { User } from '../../../shared/types'
import { authService } from '../services/authService'

interface LoginFormProps {
  onLogin: (user: User) => void
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Username is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const user = await authService.login(username.trim())
      onLogin(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h1" gutterBottom align="center">
          VIBE TEXT ADVENTURE
        </Typography>
        <Typography variant="body1" gutterBottom align="center" color="text.secondary">
          Enter your username to begin your adventure
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            disabled={loading}
            autoFocus
          />

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
            disabled={loading || !username.trim()}
          >
            {loading ? 'CONNECTING...' : 'ENTER GAME'}
          </Button>
        </form>
      </Paper>
    </Box>
  )
}

export default LoginForm