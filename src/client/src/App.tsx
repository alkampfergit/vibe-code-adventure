import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import LoginForm from './components/LoginForm';
import GameInterface from './components/GameInterface';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

interface UserSession {
  sessionId: string;
  username: string;
}

function App() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedSessionId = localStorage.getItem('sessionId');
    if (savedSessionId) {
      validateSession(savedSessionId);
    } else {
      setLoading(false);
    }
  }, []);

  const validateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/session/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setUserSession({
          sessionId: data.session.id,
          username: data.session.username,
        });
      } else {
        localStorage.removeItem('sessionId');
      }
    } catch (error) {
      console.error('Session validation error:', error);
      localStorage.removeItem('sessionId');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (sessionId: string, username: string) => {
    localStorage.setItem('sessionId', sessionId);
    setUserSession({ sessionId, username });
  };

  const handleLogout = () => {
    localStorage.removeItem('sessionId');
    setUserSession(null);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          Loading...
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {userSession ? (
        <GameInterface 
          username={userSession.username}
          sessionId={userSession.sessionId}
          onLogout={handleLogout}
        />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </ThemeProvider>
  );
}

export default App;