import { useState, useEffect } from 'react'
import { Container, Box } from '@mui/material'
import LoginForm from './components/LoginForm'
import GameInterface from './components/GameInterface'
import { User } from '../../shared/types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', py: 2 }}>
        {!user ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <GameInterface user={user} onLogout={handleLogout} />
        )}
      </Box>
    </Container>
  )
}

export default App