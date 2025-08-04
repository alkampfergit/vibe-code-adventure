import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tabs,
  Tab,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import UserList from './UserList';
import CommandInput from './CommandInput';
import GameOutput from './GameOutput';

interface GameInterfaceProps {
  username: string;
  sessionId: string;
  onLogout: () => void;
}

interface GameMessage {
  id: string;
  type: 'command' | 'result' | 'error';
  content: string;
  timestamp: Date;
}

interface CommandExample {
  command: string;
  description: string;
  category: string;
}

const GameInterface: React.FC<GameInterfaceProps> = ({ username, sessionId, onLogout }) => {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [examplesDialogOpen, setExamplesDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [gameMessages, setGameMessages] = useState<GameMessage[]>([]);
  const [examples, setExamples] = useState<CommandExample[]>([]);

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      onLogout();
      setLogoutDialogOpen(false);
    }
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCommandResult = (commandData: any) => {
    const timestamp = new Date();
    const commandId = `cmd_${timestamp.getTime()}`;
    const resultId = `res_${timestamp.getTime()}`;

    // Add the command to messages
    if (commandData.parsedCommand && commandData.parsedCommand.verb) {
      const commandText = commandData.parsedCommand.noun 
        ? `${commandData.parsedCommand.verb} ${commandData.parsedCommand.noun}`
        : commandData.parsedCommand.verb;
      
      setGameMessages(prev => [...prev, {
        id: commandId,
        type: 'command',
        content: commandText,
        timestamp
      }]);
    }

    // Add the result to messages
    const resultMessage: GameMessage = {
      id: resultId,
      type: commandData.result.success ? 'result' : 'error',
      content: commandData.result.message,
      timestamp
    };

    setGameMessages(prev => [...prev, resultMessage]);
  };

  const handleExamplesClick = async () => {
    try {
      const response = await fetch('/api/game/examples?category=new');
      const data = await response.json();
      setExamples(data.examples || []);
      setExamplesDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch examples:', error);
      // Show default examples if fetch fails
      setExamples([
        { command: 'look', description: 'Look around to see where you are', category: 'information' },
        { command: 'go north', description: 'Try moving in different directions', category: 'movement' },
        { command: 'take key', description: 'Pick up items you find', category: 'items' },
        { command: 'inventory', description: 'Check what you are carrying', category: 'information' },
        { command: 'help', description: 'Get help when you are stuck', category: 'information' }
      ]);
      setExamplesDialogOpen(true);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ padding: 3 }}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    Welcome to the Adventure!
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Hello {username}, you are now logged in and ready to begin your text adventure.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Session ID: {sessionId}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} md={8}>
                <GameOutput messages={gameMessages} />
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 2, height: 400, overflow: 'auto' }}>
                  <Typography variant="h6" gutterBottom>
                    Game Info
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the command input below to interact with the game world.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Quick Commands:
                    </Typography>
                    <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                      <li>help - Show all commands</li>
                      <li>look - Look around</li>
                      <li>inventory (i) - Check items</li>
                      <li>score - View your score</li>
                      <li>go north/south/east/west</li>
                      <li>take [item] - Pick up item</li>
                      <li>drop [item] - Drop item</li>
                      <li>save/load - Save/load game</li>
                      <li>quit/exit - Exit game</li>
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={handleExamplesClick}
                        fullWidth
                      >
                        View Examples
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <CommandInput
                  sessionId={sessionId}
                  onCommandResult={handleCommandResult}
                />
              </Grid>
            </Grid>
          </Container>
        );
      case 1:
        return <UserList />;
      default:
        return null;
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Text Adventure Game
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {username}!
          </Typography>
          <Button color="inherit" onClick={handleLogoutClick}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Game" />
          <Tab label="Users" />
        </Tabs>
      </Box>

      {renderTabContent()}

      <Dialog open={logoutDialogOpen} onClose={handleLogoutCancel}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out? Any unsaved progress will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={examplesDialogOpen} 
        onClose={() => setExamplesDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Command Examples - Quick Start Guide</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Here are some essential commands to get you started in your text adventure:
          </DialogContentText>
          <List>
            {examples.map((example, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body1" 
                          component="code" 
                          sx={{ 
                            backgroundColor: 'grey.100', 
                            padding: '2px 6px', 
                            borderRadius: 1,
                            fontFamily: 'monospace' 
                          }}
                        >
                          {example.command}
                        </Typography>
                        <Chip 
                          label={example.category} 
                          size="small" 
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    }
                    secondary={example.description}
                  />
                </ListItem>
                {index < examples.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'info.50', borderRadius: 1 }}>
            <Typography variant="body2" color="info.main">
              <strong>Tips:</strong> Commands are not case-sensitive, and you can use synonyms 
              (e.g., "grab" instead of "take"). Type "help" anytime for more commands, 
              or "examples" in the game to see more detailed examples!
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExamplesDialogOpen(false)} color="primary">
            Got it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GameInterface;