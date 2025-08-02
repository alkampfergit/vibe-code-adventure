import express from 'express';
import cors from 'cors';
import { database } from './database';

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim();
    const existingUser = await database.findExistingUser(trimmedUsername);
    
    if (existingUser) {
      // User exists, update last active and return existing session
      await database.updateLastActive(existingUser.id);
      res.json({ success: true, session: existingUser });
    } else {
      // New user, create new session
      const session = await database.createSession(trimmedUsername);
      res.json({ success: true, session });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    await database.deactivateSession(sessionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await database.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await database.updateLastActive(sessionId);
    res.json({ session });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await database.getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});