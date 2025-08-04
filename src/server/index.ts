import express from 'express';
import cors from 'cors';
import { database } from './database';
import { CommandParser } from './services/commandParser';
import { GameEngine } from './services/gameEngine';
import { ExampleCommandsService } from './services/exampleCommands';

const app = express();
const PORT = 8000;

// Initialize game services
const commandParser = new CommandParser();
const gameEngine = new GameEngine(commandParser);
const exampleCommands = new ExampleCommandsService();

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

app.post('/api/game/command', async (req, res) => {
  try {
    const { sessionId, command } = req.body;
    
    if (!sessionId || !command) {
      return res.status(400).json({ error: 'Session ID and command are required' });
    }

    // Validate session exists
    const session = await database.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Parse and execute command
    const parsedCommand = commandParser.parse(command);
    const result = gameEngine.executeCommand(sessionId, parsedCommand);

    // Update last active
    await database.updateLastActive(sessionId);

    res.json({
      success: true,
      result,
      parsedCommand: {
        verb: parsedCommand.verb,
        noun: parsedCommand.noun,
        isValid: parsedCommand.isValid
      }
    });
  } catch (error) {
    console.error('Command processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/game/state/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Validate session
    const session = await database.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const gameState = gameEngine.getGameState(sessionId);
    res.json({ gameState });
  } catch (error) {
    console.error('Get game state error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/game/synonyms', (req, res) => {
  try {
    const synonyms = commandParser.getSynonyms();
    const validVerbs = commandParser.getValidVerbs();
    
    res.json({
      synonyms,
      validVerbs,
      documentation: 'Synonyms are alternative words you can use for commands. Each synonym maps to a canonical command.'
    });
  } catch (error) {
    console.error('Get synonyms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/game/examples', (req, res) => {
  try {
    const category = req.query.category as string;
    
    let examples;
    let responseData: any = {
      availableCategories: ['movement', 'items', 'interaction', 'information', 'game', 'new']
    };

    switch (category) {
      case 'movement':
      case 'items':
      case 'interaction':
      case 'information':
      case 'game':
        examples = exampleCommands.getExamplesByCategory(category as any);
        responseData.category = category;
        break;
      case 'new':
      case 'beginner':
        examples = exampleCommands.getExamplesForNewPlayers();
        responseData.category = 'new';
        break;
      case 'random':
        examples = exampleCommands.getRandomExamples();
        responseData.category = 'random';
        break;
      default:
        examples = exampleCommands.getAllExamples();
        responseData.category = 'all';
        break;
    }

    responseData.examples = examples;
    responseData.quickStartGuide = exampleCommands.getQuickStartGuide();
    
    res.json(responseData);
  } catch (error) {
    console.error('Get examples error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});